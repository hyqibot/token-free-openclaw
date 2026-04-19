---
name: exe_bundle
description: "When the user wants to add or run a packaged exe + libraries/dlls + resource files (desktop app bundle). Describes placement, working directory, and entry command conventions. | 说明如何把「exe + dll/资源」作为 skill 放置、工作目录与启动命令约定。"
metadata:
  builtin_skill_version: "1.0"
  copaw:
    emoji: "📦"
    requires: {}
---

# Packaged exe + libraries/dll + resource files

This skill defines how to add a **packaged desktop app** (exe + dlls/libs + config/data) as a CoPaw skill and how the agent should run it.

## Placement

- Put **exe, dependency libraries (dlls), and resource files** in a **single subdirectory** under this skill's **scripts/** folder, e.g.:
  - `scripts/MyApp/`  
  Containing: `MyApp.exe`, dlls/libs, and config or data (e.g. `config/`, `data/`, `*.json`).
- **Working directory (cwd)** must be that subdirectory (e.g. `scripts/MyApp`) so the exe finds dlls and relative-path resources.

## Entry command

- **Windows**: In the shell, set **cwd** to `scripts/MyApp` (or your actual subdirectory) and **command** to `MyApp.exe [args]`. Examples:
  - Start: cwd=`scripts/MyApp`, command=`MyApp.exe`
  - With args: cwd=`scripts/MyApp`, command=`MyApp.exe --mode live --config config/app.json`
- Keep paths relative to that directory; do not use absolute paths in the command—rely on cwd.

## Resource files

- If the app needs **config, data, templates**, place them in the **same directory or a subdirectory** (e.g. `scripts/MyApp/config/`, `scripts/MyApp/data/`). No need to mention absolute paths in SKILL.md.
- Do not put secrets in SKILL.md; note "read from memory or env" or let the app read from a config file in the same directory.

## When adding a concrete app as a skill

For a new skill for a specific app (e.g. "my trader exe"):

1. In that skill's SKILL.md set **description** to when to trigger (e.g. user says "run trader", "open XX app").
2. In the body write: **working directory** = that skill's `scripts/<AppName>/`, **entry command** = `AppName.exe [args]`, and what each argument does.
3. Put exe, dlls, and resources under that skill's `scripts/<AppName>/`.

## Example (SKILL.md snippet)

```markdown
---
name: my_trader
description: "When the user wants to start the trading app, run backtest, or check positions; this skill uses the packaged trader.exe."
---

## Entry (working directory = scripts/trader)

- Start: cwd=`scripts/trader`, command=`trader.exe`
- Backtest: cwd=`scripts/trader`, command=`trader.exe --backtest --config config/backtest.json`
- Positions: cwd=`scripts/trader`, command=`trader.exe --query positions`

Exe, dlls, and resources are under `scripts/trader/`; no Python or system install required.
```
