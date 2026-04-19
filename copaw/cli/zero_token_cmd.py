# -*- coding: utf-8 -*-
from __future__ import annotations

import os
import click

from ..zero_token.webauth import (
    deepseek_webauth,
    doubao_webauth,
    claude_webauth,
    qwen_webauth,
    qwen_cn_webauth,
    kimi_webauth,
    chatgpt_webauth,
    gemini_webauth,
    glm_webauth,
    glm_intl_webauth,
    launch_chrome_debug,
)
from ..zero_token.gateway_manager import ensure_running, stop, status


@click.group("zero-token")
def zero_token_group() -> None:
    """内置 Zero-Token Node 网关（免 Token Web 模型）。"""


@zero_token_group.command("start")
@click.option("--port", default=3002, type=int, show_default=True)
def zt_start(port: int) -> None:
    env = os.environ.copy()
    env["COPAW_ZERO_TOKEN_PORT"] = str(port)
    d = ensure_running(timeout_sec=10.0, env=env)
    raise SystemExit(
        f"zero-token: listening={d['listening']} pid={d['pid']} {d['host']}:{d['port']}"
    )


@zero_token_group.command("stop")
def zt_stop() -> None:
    d = stop()
    raise SystemExit(
        f"zero-token: listening={d['listening']} pid={d['pid']} {d['host']}:{d['port']}"
    )


@zero_token_group.command("status")
def zt_status() -> None:
    d = status()
    raise SystemExit(
        f"zero-token: listening={d['listening']} pid={d['pid']} {d['host']}:{d['port']}"
    )


@zero_token_group.command("restart")
def zt_restart() -> None:
    stop()
    d = ensure_running(timeout_sec=10.0)
    raise SystemExit(
        f"zero-token: listening={d['listening']} pid={d['pid']} {d['host']}:{d['port']}"
    )


@zero_token_group.command("onboard")
@click.argument("mode", required=False, default="webauth")
def zt_onboard(mode: str) -> None:
    m = (mode or "").strip().lower()
    if m not in (
        "webauth",
        "doubao",
        "claude",
        "qwen",
        "qwen-cn",
        "kimi",
        "chatgpt",
        "gemini",
        "glm",
        "glm-intl",
        "chrome-debug",
    ):
        raise SystemExit(
            "mode 仅支持: webauth | doubao | claude | qwen | qwen-cn | kimi | "
            "chatgpt | gemini | glm | glm-intl | chrome-debug"
        )
    if m == "chrome-debug":
        pid = launch_chrome_debug(urls=["about:blank"])
        raise SystemExit(
            f"已启动浏览器调试模式(pid={pid})，请勿关闭该浏览器窗口；然后执行: copaw zero-token onboard "
            "webauth/doubao/claude/qwen/qwen-cn/kimi/chatgpt/gemini/glm/glm-intl"
        )

    def p(msg: str) -> None:
        click.echo(msg)

    if m == "doubao":
        d = doubao_webauth(progress=p)
        raise SystemExit(
            f"Doubao Web 授权完成：sessionid={'ok' if d.get('sessionid') else 'missing'}"
        )
    if m == "claude":
        d = claude_webauth(progress=p)
        raise SystemExit(
            f"Claude Web 授权完成：sessionKey={'ok' if d.get('sessionKey') else 'missing'}"
        )
    if m == "qwen":
        d = qwen_webauth(progress=p)
        raise SystemExit(
            f"Qwen Web 授权完成：sessionToken/cookie={'ok' if (d.get('sessionToken') or d.get('cookie')) else 'missing'}"
        )
    if m == "qwen-cn":
        d = qwen_cn_webauth(progress=p)
        raise SystemExit(f"Qwen 国内版 授权完成：cookie={'ok' if d.get('cookie') else 'missing'}")
    if m == "kimi":
        d = kimi_webauth(progress=p)
        raise SystemExit(f"Kimi Web 授权完成：kimiAuth={'ok' if d.get('kimiAuth') else 'missing'}")
    if m == "chatgpt":
        d = chatgpt_webauth(progress=p)
        raise SystemExit(f"ChatGPT Web 授权完成：cookie={'ok' if d.get('cookie') else 'missing'}")
    if m == "gemini":
        d = gemini_webauth(progress=p)
        raise SystemExit(f"Gemini Web 授权完成：cookie={'ok' if d.get('cookie') else 'missing'}")
    if m == "glm":
        d = glm_webauth(progress=p)
        raise SystemExit(f"GLM Web 授权完成：cookie={'ok' if d.get('cookie') else 'missing'}")
    if m == "glm-intl":
        d = glm_intl_webauth(progress=p)
        raise SystemExit(f"GLM Intl Web 授权完成：cookie={'ok' if d.get('cookie') else 'missing'}")
    d = deepseek_webauth(progress=p)
    raise SystemExit(
        f"DeepSeek Web 授权完成：cookie={'ok' if d.get('cookie') else 'missing'} "
        f"bearer={'ok' if d.get('bearer') else 'missing'}"
    )
