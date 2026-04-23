# -*- coding: utf-8 -*-
"""CLI command: run CoPaw app on a free port in a native webview window."""
from __future__ import annotations

import os
import platform
import socket
import struct
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from pathlib import Path
from types import ModuleType

import click

from ..constant import LOG_LEVEL_ENV
from ..utils.packaged_runtime import running_as_packaged_executable
from ..utils.trace_m_flag import log_desktop_subprocess_argv

_DESKTOP_WEBVIEW_TITLE = (
    "iClaw Console——爱你所爱，如影随形。永久免token费，支持微信钉钉，兼容所有openclaw技能，"
    "skill能力加强。官方视频抖音号：98806056998"
)


def _desktop_server_argv(host: str, port: int, log_level: str) -> list[str]:
    """Build argv for the FastAPI child process.

    打包时用 ``<主程序> app ...``，源码环境用 ``python -m copaw app ...``。
    """
    tail = [
        "app",
        "--host",
        host,
        "--port",
        str(port),
        "--log-level",
        log_level,
    ]
    if running_as_packaged_executable():
        return [sys.executable, *tail]
    return [sys.executable, "-m", "copaw", *tail]


_webview_module: ModuleType | None = None


def _patch_pywebview_util_for_windows_dist(wutil) -> None:
    """Nuitka 布局下：exe 旁带 webview/ 时，为 ``interop_dll_path`` / ``get_app_root`` 做路径回退。"""
    exe_dir = Path(sys.executable).resolve().parent
    _orig_interop = wutil.interop_dll_path
    _orig_root = wutil.get_app_root

    def interop_dll_path(dll_name: str) -> str:
        try:
            return _orig_interop(dll_name)
        except FileNotFoundError:
            pass
        if dll_name in ("win-arm64", "win-x64", "win-x86"):
            native = exe_dir / "webview" / "lib" / "runtimes" / dll_name / "native"
            if native.is_dir():
                return str(native)
        for base in (exe_dir, exe_dir / "webview" / "lib"):
            cand = base / dll_name
            if cand.is_file():
                return str(cand)
        raise FileNotFoundError(f"Cannot find {dll_name}")

    def get_app_root() -> str:
        if running_as_packaged_executable():
            return str(exe_dir)
        return _orig_root()

    wutil.interop_dll_path = interop_dll_path
    wutil.get_app_root = get_app_root


def _load_webview() -> ModuleType:
    """Import pywebview only after Windows DLL paths are ready (WebView2Loader)."""
    global _webview_module
    if _webview_module is not None:
        return _webview_module
    if sys.platform == "win32":
        _prepare_windows_webview_runtime()
        import webview.util as wutil

        _patch_pywebview_util_for_windows_dist(wutil)
    import webview as wv

    _webview_module = wv
    return wv


class WebViewAPI:
    """API exposed to the webview for handling external links."""

    def open_external_link(self, url: str) -> None:
        """Open URL in system's default browser."""
        if not url.startswith(("http://", "https://")):
            return
        webbrowser.open(url)


def _find_free_port(host: str = "127.0.0.1") -> int:
    """Bind to port 0 and return the OS-assigned free port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((host, 0))
        sock.listen(1)
        return sock.getsockname()[1]


def _wait_for_http(host: str, port: int, timeout_sec: float = 300.0) -> bool:
    """Return True when something accepts TCP on host:port."""
    deadline = time.monotonic() + timeout_sec
    while time.monotonic() < deadline:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(2.0)
                s.connect((host, port))
                return True
        except (OSError, socket.error):
            time.sleep(1)
    return False


def _desktop_wait_timeout_sec() -> float:
    """Desktop startup wait timeout (seconds), overridable by env."""
    raw = os.environ.get("COPAW_DESKTOP_WAIT_TIMEOUT", "").strip()
    if not raw:
        return 420.0
    try:
        v = float(raw)
        return v if v > 0 else 420.0
    except Exception:
        return 420.0


def _win_webview_runtime_folder_name() -> str:
    """``webview/lib/runtimes/<this>`` for the running Python / Nuitka exe (not alphabet)."""
    if sys.platform != "win32":
        return "win-x64"
    machine = (platform.machine() or "").lower()
    is_64bit = struct.calcsize("P") >= 8
    if machine in ("arm64", "aarch64"):
        return "win-arm64"
    if is_64bit:
        return "win-x64"
    return "win-x86"


def _prepare_windows_webview_runtime() -> None:
    """DLL 搜索路径与工作目录：依赖与上游 pywebview 一致，仅适配 exe 旁 *.dist 布局。"""
    if sys.platform != "win32":
        return
    exe_root = Path(sys.executable).resolve().parent
    exe_dir = str(exe_root)
    if running_as_packaged_executable():
        try:
            os.chdir(exe_root)
        except OSError:
            pass
    try:
        os.add_dll_directory(exe_dir)
    except (AttributeError, OSError):
        pass
    pn_rt = exe_root / "pythonnet" / "runtime"
    if pn_rt.is_dir():
        try:
            os.add_dll_directory(str(pn_rt.resolve()))
        except (AttributeError, OSError):
            pass
    wv_lib = exe_root / "webview" / "lib"
    if wv_lib.is_dir():
        try:
            os.add_dll_directory(str(wv_lib.resolve()))
        except (AttributeError, OSError):
            pass
    if exe_dir not in sys.path:
        sys.path.insert(0, exe_dir)
    lib_rt = exe_root / "webview" / "lib" / "runtimes"
    if lib_rt.is_dir():
        preferred = _win_webview_runtime_folder_name()
        native = lib_rt / preferred / "native"
        if native.is_dir():
            ns = str(native.resolve())
            try:
                os.add_dll_directory(ns)
            except (AttributeError, OSError):
                pass
            os.environ["Path"] = ns + ";" + os.environ.get("Path", "")


def _log_desktop(msg: str) -> None:
    """Print to stderr and flush (for desktop.log when launched from .app)."""
    print(msg, file=sys.stderr)
    sys.stderr.flush()


def _webview_start_kwargs() -> dict:
    """Keyword args for ``webview.start``."""
    return {"private_mode": False}


def _stream_reader(in_stream, out_stream) -> None:
    """Read from in_stream line by line and write to out_stream.

    Used on Windows to prevent subprocess buffer blocking. Runs in a
    background thread to continuously drain the subprocess output.
    """
    try:
        for line in iter(in_stream.readline, ""):
            if not line:
                break
            out_stream.write(line)
            out_stream.flush()
    except Exception:
        pass
    finally:
        try:
            in_stream.close()
        except Exception:
            pass


@click.command("desktop")
@click.option(
    "--host",
    default="127.0.0.1",
    show_default=True,
    help="Bind host for the app server.",
)
@click.option(
    "--log-level",
    default="info",
    type=click.Choice(
        ["critical", "error", "warning", "info", "debug", "trace"],
        case_sensitive=False,
    ),
    show_default=True,
    help="Log level for the app process.",
)
def desktop_cmd(
    host: str,
    log_level: str,
) -> None:
    """Run CoPaw app on an auto-selected free port in a webview window.

    Starts the FastAPI app in a subprocess on a free port, then opens a
    native webview window loading that URL. Use for a dedicated desktop
    window without conflicting with an existing CoPaw app instance.
    """
    try:
        webview = _load_webview()
    except ImportError:
        raise click.ClickException(
            "pywebview is not installed. Install with: pip install pywebview",
        ) from None

    port = _find_free_port(host)
    url = f"http://{host}:{port}"
    click.echo(f"Starting CoPaw app on {url} (port {port})")
    _log_desktop("[desktop] Server subprocess starting...")

    env = os.environ.copy()
    # 内置 zero-token 网关会 fetch ``/api/zero-token/ensure-chrome-debug``；默认曾写死 8088，此处写入实际根地址供子进程继承
    env["COPAW_APP_URL"] = url
    env["COPAW_API_BASE_URL"] = url
    env.setdefault("ICLAW_APP_URL", url)
    env.setdefault("ICLAW_API_BASE_URL", url)
    env[LOG_LEVEL_ENV] = log_level
    if sys.platform == "win32":
        env.setdefault("PYTHONIOENCODING", "utf-8")
        env.setdefault("PYTHONUTF8", "1")

    if not env.get("SSL_CERT_FILE") and sys.platform == "win32":
        try:
            import certifi

            env["SSL_CERT_FILE"] = certifi.where()
        except ImportError:
            pass

    if "SSL_CERT_FILE" in env:
        cert_file = env["SSL_CERT_FILE"]
        if os.path.exists(cert_file):
            _log_desktop(f"[desktop] SSL certificate: {cert_file}")
        else:
            _log_desktop(
                f"[desktop] WARNING: SSL_CERT_FILE set but not found: "
                f"{cert_file}",
            )
    else:
        _log_desktop("[desktop] WARNING: SSL_CERT_FILE not set (install certifi)")

    is_windows = sys.platform == "win32"
    srv_argv = _desktop_server_argv(host, port, log_level)
    # 全仓库唯一：桌面用 Popen 拉起 ``app`` 子进程的路径（见 ``log_desktop_subprocess_argv`` 说明）。
    log_desktop_subprocess_argv(
        srv_argv,
        running_as_packaged=running_as_packaged_executable(),
    )
    try:
        with subprocess.Popen(
            srv_argv,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE if is_windows else sys.stdout,
            stderr=subprocess.PIPE if is_windows else sys.stderr,
            env=env,
            bufsize=1,
            universal_newlines=True,
            encoding="utf-8" if is_windows else None,
            errors="replace" if is_windows else None,
        ) as proc:
            if is_windows:
                stdout_thread = threading.Thread(
                    target=_stream_reader,
                    args=(proc.stdout, sys.stdout),
                    daemon=True,
                )
                stderr_thread = threading.Thread(
                    target=_stream_reader,
                    args=(proc.stderr, sys.stderr),
                    daemon=True,
                )
                stdout_thread.start()
                stderr_thread.start()
            _log_desktop("[desktop] Waiting for HTTP ready...")
            wait_sec = _desktop_wait_timeout_sec()
            if _wait_for_http(host, port, timeout_sec=wait_sec):
                _log_desktop("[desktop] HTTP ready, opening UI...")
                api = WebViewAPI()
                webview.create_window(
                    _DESKTOP_WEBVIEW_TITLE,
                    url,
                    width=1280,
                    height=800,
                    text_select=True,
                    js_api=api,
                )
                _log_desktop("[desktop] webview window registered, starting GUI...")
                _log_desktop(
                    "[desktop] Calling webview.start() "
                    "(blocks until closed)...",
                )
                webview.start(**_webview_start_kwargs())
                _log_desktop(
                    "[desktop] webview.start() returned (window closed).",
                )
                proc.terminate()
                proc.wait()
                return
            if _wait_for_http(host, port, timeout_sec=12.0):
                _log_desktop(
                    "[desktop] HTTP became ready during grace probe, opening UI...",
                )
                api = WebViewAPI()
                webview.create_window(
                    _DESKTOP_WEBVIEW_TITLE,
                    url,
                    width=1280,
                    height=800,
                    text_select=True,
                    js_api=api,
                )
                webview.start(**_webview_start_kwargs())
                proc.terminate()
                proc.wait()
                return
            _log_desktop("[desktop] Server did not become ready in time.")
            click.echo(
                "Server did not become ready in time; open manually: " + url,
                err=True,
            )
            try:
                proc.wait()
            except KeyboardInterrupt:
                proc.terminate()
                proc.wait()

        if proc.returncode != 0:
            sys.exit(proc.returncode or 1)
    except Exception as e:
        _log_desktop(f"[desktop] Exception: {e!r}")
        import traceback

        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        raise
