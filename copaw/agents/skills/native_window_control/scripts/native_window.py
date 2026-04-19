#!/usr/bin/env python3
"""Windows UI Automation CLI: list_windows, snapshot, click, type_text. Requires pywinauto."""
import json
import sys
import platform

def main():
    if platform.system() != "Windows":
        out = {"ok": False, "error": "native_window_control is only supported on Windows."}
        print(json.dumps(out, ensure_ascii=False))
        return 1
    try:
        from pywinauto import Desktop
    except ImportError as e:
        out = {"ok": False, "error": f"pywinauto not installed: {e}. Run: pip install pywinauto"}
        print(json.dumps(out, ensure_ascii=False))
        return 1
    args = sys.argv[1:]
    if not args:
        out = {"ok": False, "error": "Usage: native_window.py list_windows | snapshot <title> | click <title> <ref> | type_text <title> <ref> <text>"}
        print(json.dumps(out, ensure_ascii=False))
        return 1
    action = args[0].lower()
    desktop = Desktop(backend="uia")
    wins = desktop.windows()

    if action == "list_windows":
        items = []
        for i, w in enumerate(wins):
            try:
                title = (w.window_text() or "").strip()
                if title:
                    items.append({"index": i, "title": title, "pid": getattr(w, "process_id", lambda: None)()})
            except Exception:
                pass
        print(json.dumps({"ok": True, "windows": items}, ensure_ascii=False, indent=2))
        return 0

    if action == "snapshot":
        if len(args) < 2:
            out = {"ok": False, "error": "snapshot requires window_title substring"}
            print(json.dumps(out, ensure_ascii=False))
            return 1
        title_sub = args[1]
        matched = [w for w in wins if title_sub in (w.window_text() or "")]
        if not matched:
            print(json.dumps({"ok": False, "error": f"No window found with title containing: {title_sub!r}"}, ensure_ascii=False))
            return 1
        w = matched[0]
        out_ctrl = []

        def collect(wrapper, prefix):
            try:
                for i, c in enumerate(wrapper.children()):
                    ref = f"{prefix}{i}" if prefix else str(i)
                    try:
                        info = getattr(c, "element_info", None)
                        name = (getattr(info, "name", None) or "").strip() or "(unnamed)"
                        ctrl_type = getattr(info, "control_type", None) or ""
                        r = {"ref": ref, "control_type": ctrl_type, "name": name}
                        out_ctrl.append(r)
                        collect(c, ref + ".")
                    except Exception:
                        pass
            except Exception:
                pass
        out_ctrl.append({"ref": "root", "control_type": "Window", "name": (w.window_text() or "").strip() or "(unnamed)"})
        collect(w, "")  # appends children with ref "0","1","0.0",...
        print(json.dumps({"ok": True, "window_title": w.window_text(), "controls": out_ctrl}, ensure_ascii=False, indent=2))
        return 0

    def get_control(window_title: str, ref: str):
        matched = [w for w in wins if window_title in (w.window_text() or "")]
        if not matched:
            return None
        cur = matched[0]
        if ref == "root":
            return cur
        parts = [int(x) for x in ref.replace(".", " ").split()]
        for idx in parts:
            ch = cur.children()
            if idx < 0 or idx >= len(ch):
                return None
            cur = ch[idx]
        return cur

    if action == "click":
        if len(args) < 3:
            out = {"ok": False, "error": "click requires window_title and ref"}
            print(json.dumps(out, ensure_ascii=False))
            return 1
        ctrl = get_control(args[1], args[2])
        if not ctrl:
            print(json.dumps({"ok": False, "error": f"Control ref {args[2]!r} not found"}, ensure_ascii=False))
            return 1
        try:
            ctrl.click_input()
            print(json.dumps({"ok": True, "message": f"Clicked {args[2]}"}, ensure_ascii=False))
            return 0
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
            return 1

    if action == "type_text":
        if len(args) < 4:
            out = {"ok": False, "error": "type_text requires window_title, ref, and text"}
            print(json.dumps(out, ensure_ascii=False))
            return 1
        ctrl = get_control(args[1], args[2])
        if not ctrl:
            print(json.dumps({"ok": False, "error": f"Control ref {args[2]!r} not found"}, ensure_ascii=False))
            return 1
        try:
            ctrl.type_keys(args[3], with_spaces=True)
            print(json.dumps({"ok": True, "message": f"Typed into {args[2]}"}, ensure_ascii=False))
            return 0
        except Exception as e:
            print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False))
            return 1

    print(json.dumps({"ok": False, "error": f"Unknown action: {action!r}"}, ensure_ascii=False))
    return 1

if __name__ == "__main__":
    sys.exit(main())
