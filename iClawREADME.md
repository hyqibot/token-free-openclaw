<div align="center">

# iClaw

[![GitHub](https://img.shields.io/badge/GitHub-Repo-black.svg?logo=github)](https://github.com/hyqibot/token-free-openclaw)
[![Python](https://img.shields.io/badge/python-3.10%20~%20%3C3.14-blue.svg?logo=python&label=Python)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-Apache%202.0-red.svg?logo=apache&label=License)](LICENSE)
[![Code style](https://img.shields.io/badge/code%20style-black-black.svg?logo=python&label=Code%20style)](https://github.com/psf/black)
[![DingTalk](https://img.shields.io/badge/DingTalk-Join_Us-orange.svg)](https://qr.dingtalk.com/action/joingroup?code=v1,k1,9O3Nk5uBqF+FKGHas0gK4dkuLhC1CkMJ4CgU45rKMf8=&_dt_no_comment=1&origin=11)

[[中文](iClawREADME_zh.md)] [[日本語](iClawREADME_ja.md)]


<p align="center"><b>Love what you love, stay close like a shadow.</b></p>

</div>

Permanently token-free openclaw; three powerful skills that greatly improve desktop automation; no install required—ready out of the box; supports WeChat, DingTalk, and more channels for control.

> **Highlights**
>
> **Permanently token-free** — Uses a web-model calling stack so popular models can be used without cloud API token fees.
>
> **WeChat & DingTalk** — Control iClaw from multiple channels such as WeChat and DingTalk.
>
> **No install, ready out of the box** — Many AI projects are complex to deploy; this project uses a no-install model: copy the project or run the exe directly (Windows 10 or later; Chrome required). Official reference videos are provided; follow Douyin account **98806056998** for access.
>
> **Skill expansion** — Compatible with OpenClaw skills and supports stronger skill extensions (e.g., automated stock selection and trading workflows).
>
> **AlphaHYQi (planned)** — AI-driven strategy discovery/training/evolution for A-share. See [A-share-Ai](https://github.com/hyqibot/A-share-Ai/).
>
> **Desktop freedom** — Three skills greatly improve iClaw’s ability to operate the Windows desktop (import into the skill pool and enable as needed).
>

| Skill | What it does | Requirements |
|-------|----------------|--------------|
| **open_desktop_shortcuts** | Open **one** `.lnk` / `.url` by name (first match) under user+public Desktop and Start Menu Programs | Windows only; no extra install |
| **native_window_control** | List windows, UI snapshots, click/type in native desktop windows | Windows |
| **exe_bundle** | Convention for wiring “exe + dll + resources” into a skill | None |

### open_desktop_shortcuts

- **Location** (this repo): `src/copaw/agents/skills/open_desktop_shortcuts/SKILL.md` (OpenClaw upstream docs often use `skills/open_desktop_shortcuts/`)
- **Usage**: When the user asks to open **one** shortcut by name, the agent runs the SKILL’s PowerShell; it scans **user + common Desktop** and **user + common Start Menu → Programs** (recursive) and launches the **first** matching **`.lnk` or `.url`**. Bulk “open all” is **not** part of this skill.
- **No install**: Windows and a working shell/run tool are enough.
- **Note**: The skill folder name is **not** a callable tool. Use the registered **`execute_shell_command`** tool with the PowerShell one-liner from SKILL in the `command` field (do not invent a tool named `open_desktop_shortcuts`). The system prompt includes a fixed “skills vs. registered tools” reminder.

### native_window_control

- **Location**: `skills/native_window_control/` (includes `SKILL.md`, `scripts/native_window.py`, `scripts/requirements.txt`)
- **Dependencies**: Python on the machine and `pip install pywinauto` (or `pip install -r src/copaw/agents/skills/native_window_control/scripts/requirements.txt`).
- **Usage**: The agent runs this skill’s Python scripts from the shell, for example:
  - List windows: `python scripts/native_window.py list_windows` (cwd = skill root or script directory)
  - Control snapshot: `python scripts/native_window.py snapshot "substring of window title"`
  - Click: `python scripts/native_window.py click "Window title" "ref"`
  - Type text: `python scripts/native_window.py type_text "Window title" "ref" "text to type"`
- Scripts print JSON to stdout for the agent to parse.

### exe_bundle

- **Location** (this repo): `src/copaw/agents/skills/exe_bundle/` (includes `SKILL.md`, `scripts/README.txt`)
- **Usage**: A **convention and template** for placing “exe + dll + resources” under a skill’s `scripts/<AppName>/`, setting cwd and the launch command. Use it when you or the agent create a concrete exe-based skill; you do not “run” exe_bundle by itself.

#### Convention (how to use)

##### Directory layout (example)

Inside some skill (often one dedicated to a specific app):

```text
scripts/MyApp/
  MyApp.exe
  (dlls, config, data, etc.)
```

##### Working directory

**cwd** = `scripts/MyApp` (relative to that skill’s root).

##### How to launch

In the shell: `cd` to `scripts/MyApp`, then run `MyApp.exe` with arguments, e.g.:

- Launch only: `MyApp.exe`
- With args: `MyApp.exe --config config\app.json`

##### When creating your own exe-based skill

Copy or mirror `exe_bundle`’s `SKILL.md`: describe in `description` when the user should trigger it; in the body document cwd, entry command, and common parameters; put real files under `scripts/<app name>/`.

##### Secrets

Do not put keys in the SKILL; use environment variables or config files next to the binary and let the program read them.

---

This project is built on and customized from the open-source **CoPaw** project (including performance and packaging).

## More from upstream CoPaw

- **Skills** — Built-in scheduling, PDF/Office, news digests, etc.; on **Windows**, combine with the three desktop skills above (may need `pip install pywinauto`). Custom skills can be imported into the pool and attached to agents.
- **Multi-agent collaboration** — Multiple independent agents with roles; collaboration skills let agents message each other for complex tasks.
- **Layered security** — Tool guards, file access control, skill security scanning.
- **Reach everywhere** — DingTalk, Feishu/Lark, WeChat, Discord, Telegram, and more—connect as needed.

<details>
<summary><b>What you can do with iClaw</b></summary>

- **Social**: Daily hot-post digests (Xiaohongshu, Zhihu, Reddit), new video digests for Bilibili/YouTube.
- **Productivity**: Email/Newsletter highlights to DingTalk/Feishu/QQ; tidy contacts from mail and calendar.
- **Create & build**: Describe a goal before bed, let it run overnight, get a draft the next day; end-to-end from idea to video.
- **Research & learning**: Track tech/AI news; search and reuse a personal knowledge base.
- **Desktop & files**: Organize/search local files; read and summarize documents; ask for files in chat.
- **Explore**: Combine Skills and schedules into your own agentic apps.

</details>


## Security

iClaw includes multiple layers of protection for your data and system:

- **Tool guard** — Blocks dangerous shell patterns (e.g. `rm -rf /`, fork bombs, reverse shells).
- **File access guard** — Limits access to sensitive paths (e.g. `~/.ssh`, key files, system dirs).
- **Skill security scan** — Scans skills before install for prompt injection, command injection, hard-coded secrets, exfiltration, etc.
- **Local-first** — Data and memory stay local; nothing is uploaded to a third party by default (when using cloud LLM APIs, conversation content is sent to that provider).


## Contact

**DingTalk group**: [Join the group](https://qr.dingtalk.com/action/joingroup?code=v1,k1,9O3Nk5uBqF+FKGHas0gK4dkuLhC1CkMJ4CgU45rKMf8=&_dt_no_comment=1&origin=11)

[<img src="https://img.alicdn.com/imgextra/i2/O1CN01vCWI8a1skHtLGXEMQ_!!6000000005804-2-tps-458-460.png" width="80" height="80" alt="DingTalk">](https://qr.dingtalk.com/action/joingroup?code=v1,k1,9O3Nk5uBqF+FKGHas0gK4dkuLhC1CkMJ4CgU45rKMf8=&_dt_no_comment=1&origin=11)



## License

Released under [Apache License 2.0](LICENSE).

---

# Third-party open-source notice

This product **[iClaw]** version **[1.0.0]** includes the following third-party software licensed under **Apache License 2.0**.

## Components used

### CoPaw
- **Project name**: CoPaw
- **Copyright**: Copyright 2025 The CoPaw Authors—see the LICENSE file
- **Source**: https://github.com/agentscope-ai/CoPaw
- **License**: Apache License 2.0
- **Use in this software**: Modified and integrated
- **Changes**: Extended the skill modules; added a free-token access path; supports exe-based, install-free deployment, etc.

## License and disclaimer

### Apache License 2.0
The components above are governed by Apache License 2.0. Full text:
- The `LICENSE` file in this distribution
- Or https://www.apache.org/licenses/LICENSE-2.0

### Third-party disclaimer
**For the listed third-party components (CoPaw):**  
They are provided “AS-IS” by their copyright holders, without warranties of any kind, including merchantability, fitness for a particular purpose, or non-infringement. The original authors are not liable for damages arising from use of these components.

### Our code
All other code in this product is developed or modified by the **[iClaw team]**. It is also provided “AS-IS” without warranties of any kind. In no event shall the **[iClaw team]** be liable for any direct, indirect, incidental, special, or consequential damages (including loss of profit, data, or business interruption) arising from use or inability to use that code, even if advised of the possibility of such damages.

## How to obtain full source code
Source code for the open components (and modifications, if any) can be obtained as required by Apache License 2.0. Contact: DingTalk **iclaw001**.

## Thanks
Thanks to all open-source authors for their contributions to the community.
