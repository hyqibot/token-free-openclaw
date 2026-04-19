---
name: native_window_control
description: "When the user needs to operate an already-open native desktop app window (not a browser): list windows, get control tree, click buttons/tabs, or type text into controls. Windows only; requires Python and pywinauto (pip install pywinauto). | 操作已打开的原生桌面窗口（非浏览器）：列举窗口、控件树、点击或输入；仅 Windows，需 pywinauto。"
metadata:
  builtin_skill_version: "1.0"
  copaw:
    emoji: "🪟"
    requires:
      platform: win32
---

# Native Window Control (Windows UI Automation)

For **already-open native desktop app** windows: list windows, snapshot controls, click buttons/tabs, type into edit controls. Unlike browser tooling, this operates **native desktop windows** (exe, desktop apps), not web pages.

## When to use

- User says: "Click the Start button in XX app", "Click the second tab in XX window", "Type 123 into the input in XX window"
- User wants the agent to operate an **already-open** desktop app UI (exe window with tabs/buttons)
- Combine with screenshot tool: capture the window first, then use this skill to click or type

## Prerequisites

- **OS**: Windows only.
- **Dependencies**: `pip install pywinauto`. Run the script from the skill's `scripts/` directory with Python.

## How to run (script in this skill)

This skill provides a Python script `scripts/native_window.py`. Run it from the **skill directory** (or with the script path pointing at this skill's scripts folder). Working directory should be the skill root or the folder containing `native_window.py`.

**Usage:**

```text
python scripts/native_window.py <action> [window_title] [ref] [text]
```

- **list_windows** — List visible windows (title, PID). No extra args.  
  Example: `python scripts/native_window.py list_windows`

- **snapshot** — Get control tree for a window (substring match on title).  
  Example: `python scripts/native_window.py snapshot "Notepad"`  
  Returns JSON with `controls` array; each has `ref`, `control_type`, `name`. Use `ref` for click/type_text.

- **click** — Click a control by window title substring and ref.  
  Example: `python scripts/native_window.py click "Notepad" "2"`

- **type_text** — Type into a control.  
  Example: `python scripts/native_window.py type_text "Notepad" "1" "hello"`

## Recommended flow

1. **list_windows** → identify the target window title.
2. **snapshot** with that title substring → get controls and refs.
3. **click** or **type_text** with the same title and the chosen ref (and text for type_text).

## Notes

- Window title matching is **substring**, **first match**. Use a more specific substring or list_windows if multiple windows match.
- Some legacy apps do not support UI Automation; those windows cannot be snapshotted or controlled.
- You can take a screenshot first so the user can confirm the target window is open and in front.
