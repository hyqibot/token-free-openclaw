---
name: open_desktop_shortcuts
description: "When the user wants to open a single desktop/start-menu shortcut on Windows (by name match): use execute_shell_command with the PowerShell below — there is no tool named open_desktop_shortcuts; bulk 'open all' is not supported here. | 在 Windows 上按名称打开单个桌面/开始菜单快捷方式：用 execute_shell_command；不支持本技能内「一次打开全部」。"
metadata:
  builtin_skill_version: "1.4"
  copaw:
    emoji: "🖥️"
    requires:
      platform: win32
---

# Open Desktop Shortcuts (Windows)

## How to invoke in CoPaw (read this first)

- The YAML field `name: open_desktop_shortcuts` is the **skill folder id** for discovery — **not** a callable tool exposed to the model as `open_desktop_shortcuts(...)`.
- There is **no** function like `open_desktop_shortcuts` with parameters such as `shortcut: "微信"`. Calling that name causes **`FunctionNotFoundError`**.
- To actually run the steps below, use the built-in tool **`execute_shell_command`** with a **`command`** string containing the PowerShell one-liner (set `$MATCH` inside that string for a single shortcut). Do **not** invent another tool name.
- Example shape: `execute_shell_command` → `command`: paste the one-liner from [Open one shortcut (by name)](#open-one-shortcut-by-name), with `$MATCH="微信"` or `$MATCH="WeChat"` depending on the real file **BaseName** on disk.

Use **PowerShell** (these snippets are not `cmd.exe` one-liners). If your shell is `cmd`, run via `powershell -NoProfile -Command "..."`, or write a `.ps1` and run `powershell -NoProfile -ExecutionPolicy Bypass -File script.ps1` (see CoPaw Windows shell rules).

## Scope

Scripts below search these **roots** (missing folders are skipped):

| Location | Path source |
|----------|-------------|
| Current user Desktop | `[Environment]::GetFolderPath('Desktop')` |
| **All users / Public** Desktop | `[Environment]::GetFolderPath('CommonDesktopDirectory')` |
| Current user **Start Menu → Programs** | `[Environment]::GetFolderPath('Programs')` |
| **All users** Start Menu Programs | `[Environment]::GetFolderPath('CommonPrograms')` |

- **Recursive** under each root (so subfolders under Start Menu are included).
- **Files:** `*.lnk` and **`*.url`** (internet shortcuts). For `.url`, the script uses `Start-Process` on the file so the system opens the URL like double‑click.
- **Not covered:** Taskbar pins / tiles with no `.lnk` in these trees, UWP-only entries, or items outside the four roots above.
- **Single target only:** This skill does **not** describe “open every shortcut at once”. Each run launches **at most one** matching file (first hit); do not use it to mass-launch all shortcuts.

## Open one shortcut (by name)

When the user asks to open **one** shortcut (e.g. “open Chrome”, “launch 微信”, “run the shortcut named X”):

1. Choose a **substring** `MATCH` that should appear in the **file BaseName** (name without extension), for `.lnk` or `.url`.
2. **`MATCH` must be non-empty.**
3. `-like "*$MATCH*"` treats `*` `?` `[` inside `MATCH` as wildcard characters. If needed, list files first (see below).

**Single line** (set `MATCH` then run — **only the first** matching file is launched; roots are scanned in table order, first hit wins):

```powershell
$MATCH="WeChat"; if ([string]::IsNullOrWhiteSpace($MATCH)) { throw "MATCH must not be empty" }; $roots=@([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('CommonDesktopDirectory'),[Environment]::GetFolderPath('Programs'),[Environment]::GetFolderPath('CommonPrograms')); $s=New-Object -ComObject WScript.Shell; $one=$null; foreach($r in $roots){ if(-not (Test-Path -LiteralPath $r)){continue}; $one=Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '\.(lnk|url)$' -and $_.BaseName -like "*$MATCH*" } | Select-Object -First 1; if($one){break} }; if($one){ $p=$one.FullName; try { if($one.Extension -match '\.url$'){ Start-Process -FilePath $p -ErrorAction SilentlyContinue } else { $t=$s.CreateShortcut($p).TargetPath; if($t){ Start-Process $t -ErrorAction SilentlyContinue } else { Start-Process $p -ErrorAction SilentlyContinue } } } catch { try { Start-Process $p -ErrorAction SilentlyContinue } catch {} } }
```

- If **multiple** files match the pattern, **only one** is started (first found). If the wrong program opens, list files (below), then use a **tighter** `MATCH`, or ask the user which name to use.
- If nothing launches: try another substring for **BaseName** (e.g. `微信` vs `WeChat`), or list files across roots (example one-liner):

```powershell
$roots=@([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('CommonDesktopDirectory'),[Environment]::GetFolderPath('Programs'),[Environment]::GetFolderPath('CommonPrograms')); foreach($r in $roots){ if(Test-Path -LiteralPath $r){ Get-ChildItem -LiteralPath $r -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '\.(lnk|url)$' } | Select-Object FullName,BaseName } }
```

## Limitations

- **`.lnk`:** `CreateShortcut(...).TargetPath` ignores arguments / working directory / “run as admin”; for closest behavior to double‑click, you can use `Start-Process -FilePath $_.FullName` instead (same paths as above).
- **`.url`:** Opens with the **default browser** via `Start-Process` on the file; not every site behaves like in-app webview.
- **Start Menu recurse** can be slow on large profiles; use a narrower `$MATCH` when possible.
- **Pinned-only** items with no file under the four roots are still not reachable by these scripts.
