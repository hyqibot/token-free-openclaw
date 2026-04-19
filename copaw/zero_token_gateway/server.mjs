import http from "node:http";
import fs from "node:fs";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { C, authPath, Z } from "./config.mjs";

const require = createRequire(import.meta.url);
const { solvePow } = require("../zero_token/deepseek_pow.js");

const j = (o) => JSON.stringify(o);
const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
const cred = () => {
  const c = readJson(authPath());
  if (!c?.cookie) throw new Error(`missing DeepSeek cookie in ${authPath()}`);
  return c;
};
const home = () => process.env.USERPROFILE || process.env.HOME || ".";
const zstate = () =>
  process.env.COPAW_ZERO_TOKEN_STATE_DIR || process.env.ICLAW_ZERO_TOKEN_STATE_DIR || ".copaw-zero-state";
const authFile = (name) => `${home()}/${zstate()}/${name}`.replace(/\\/g, "/");
const credDoubao = () => {
  const p = authFile("doubao_auth.json");
  const c = readJson(p);
  if (!c?.sessionid) throw new Error(`missing Doubao sessionid in ${p}`);
  return c;
};
const credClaude = () => {
  const p = authFile("claude_auth.json");
  const c = readJson(p);
  if (!c?.sessionKey) throw new Error(`missing Claude sessionKey in ${p}`);
  return c;
};
const credQwen = () => {
  const p = authFile("qwen_auth.json");
  const c = readJson(p);
  if (!c?.sessionToken && !c?.cookie) throw new Error(`missing Qwen sessionToken/cookie in ${p}`);
  return c;
};
const credQwenCn = () => {
  const p = authFile("qwen_cn_auth.json");
  const c = readJson(p);
  if (!c?.cookie) throw new Error(`missing Qwen CN cookie in ${p}`);
  return c;
};
const credKimi = () => {
  const p = authFile("kimi_auth.json");
  const c = readJson(p);
  const cookie = c?.cookie || "";
  const kimiAuth = c?.kimiAuth || (cookie.match(/kimi-auth=([^;]+)/) || [])[1];
  if (!kimiAuth) throw new Error(`missing Kimi kimiAuth/cookie in ${p}`);
  return { ...c, kimiAuth };
};
const credGemini = () => {
  const p = authFile("gemini_auth.json");
  const c = readJson(p);
  if (!c?.cookie) throw new Error(`missing Gemini cookie in ${p}`);
  return c;
};
const credGlm = () => {
  const p = authFile("glm_auth.json");
  const c = readJson(p);
  if (!c?.cookie) throw new Error(`missing GLM cookie in ${p}`);
  return c;
};
const credGlmIntl = () => {
  const p = authFile("glm_intl_auth.json");
  const c = readJson(p);
  if (!c?.cookie) throw new Error(`missing GLM Intl cookie in ${p}`);
  return c;
};
const credChatGPT = () => {
  const p = authFile("chatgpt_auth.json");
  const c = readJson(p);
  if (!c?.cookie) throw new Error(`missing ChatGPT cookie in ${p}`);
  return c;
};
const parseCookieKV = (s) =>
  String(s || "")
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const i = x.indexOf("=");
      return i > 0 ? [x.slice(0, i), x.slice(i + 1)] : null;
    })
    .filter(Boolean);
const cookieVal = (cookie, name) => {
  for (const kv of parseCookieKV(cookie)) if (kv?.[0] === name) return String(kv[1] || "");
  return "";
};
const h = (c) => ({
  Cookie: c.cookie || "",
  Authorization: c.bearer ? `Bearer ${c.bearer}` : undefined,
  "User-Agent": c.userAgent || C.ua,
  "Content-Type": "application/json",
  Accept: "*/*",
  Referer: `${C.base}/`,
  Origin: C.base,
  "x-client-platform": "web",
  "x-client-version": "1.7.0",
  "x-app-version": "20241129.1",
  "x-client-locale": "zh_CN",
  "x-client-timezone-offset": "28800",
});
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

const post = async (url, c, body, extra = {}) => {
  const r = await fetch(url, { method: "POST", headers: clean({ ...h(c), ...extra }), body: j(body) });
  const t = await r.text();
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${t.slice(0, 800)}`);
  return t ? JSON.parse(t) : {};
};

const createSession = async (c) => {
  const url = `${C.base}${C.api.sessionCreate}`;
  const d = await post(url, c, {});
  if (d?.msg === "Missing Token" || d?.code === 40002) throw new Error("Missing bearer token in deepseek_auth.json");
  const biz = d?.data?.biz_data || {};
  const sid = biz.id || biz.chat_session_id || biz.chatSessionId || d?.data?.chat_session_id || d.chat_session_id || d.id;
  if (!sid) throw new Error(`chat session id missing: ${j(d).slice(0, 800)}`);
  return String(sid);
};

const createPow = async (c, targetPath) => {
  const url = `${C.base}${C.api.powCreate}`;
  const d = await post(url, c, { target_path: targetPath });
  const ch = d?.data?.biz_data?.challenge || d?.data?.challenge || d.challenge;
  if (!ch) throw new Error(`pow challenge missing: ${Object.keys(d || {}).join(",")}`);
  return ch;
};

const thinkingEnabled = (model) => !(model === "deepseek-chat" && !String(model || "").includes("reasoning"));

// ---------------------------------------------------------------------------
// Strict tool-call parsing (openclaw-zero-token style)
//
// We intentionally DO NOT accept mixed natural language + JSON/code-fences
// + arbitrary recovery. Only this format is accepted:
//   <tool_call>{"name":"tool_name","arguments":{...}}</tool_call>
// Multiple tool_call tags may be emitted sequentially.
// ---------------------------------------------------------------------------

const _parseJsonToolCallObject = (jsonText) => {
  const s = String(jsonText || "").trim();
  if (!s.startsWith("{") || !s.endsWith("}")) return null;
  let obj;
  try {
    obj = JSON.parse(s);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) return null;
  let args = obj.arguments ?? {};
  // Strict: arguments must be an object. (No string shims.)
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;
  return { name, arguments: args };
};

const _extractToolCallsStrict = (text) => {
  const s0 = String(text || "").replace(/\bFINISHED\b\s*$/i, "").trim();
  if (!s0) return { ok: false, toolCalls: [] };

  const toolCalls = [];
  // Some web models occasionally drop the leading '<' on the opening tag:
  //   tool_call>{...}</tool_call>
  // Accept that single-character omission, but nothing else.
  const re = /(?:<)?tool_call\b[^>]*>\s*([\s\S]*?)\s*<\/tool_call>/gi;
  let m;
  while ((m = re.exec(s0))) {
    const body = String(m[1] || "").trim();
    const parsed = _parseJsonToolCallObject(body);
    if (!parsed) return { ok: false, toolCalls: [] };
    toolCalls.push(parsed);
  }

  // Deterministic: if at least one valid tool_call tag exists, treat this turn
  // as tool_calls and ignore any surrounding natural language.
  if (toolCalls.length === 0) return { ok: false, toolCalls: [] };
  return { ok: true, toolCalls };
};

/** 仅在 tool_choice=require / function 时追加；勿在 auto 下启发式重试（易误判闲聊/能力介绍，逼模型输出假 <tool_call>）。 */
const _STRICT_TOOL_RETRY_USER =
  "重试：你刚才的输出不合规。你必须只输出一行，且仅包含：<tool_call>{\"name\":\"上方tools列表中的确切工具名\",\"arguments\":{...}}</tool_call>。结束标签必须是 </tool_call>（不要用第二个<tool_call>收尾）。除此之外不要输出任何字符（不要思考过程、不要Markdown、不要代码块）。";

const sseText = (raw) => {
  const out = [];
  for (const ln of String(raw || "").split(/\r?\n/)) {
    if (!ln.startsWith("data: ")) continue;
    const p = ln.slice(6).trim();
    if (!p || p === "[DONE]") continue;
    try {
      const j = JSON.parse(p);
      const v = j && typeof j === "object" && typeof j.v === "string" ? j.v : "";
      if (v) out.push(v);
    } catch {}
  }
  return out.join("");
};

const msgText = (m) => {
  const c = m?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((p) => (p && typeof p.text === "string" ? p.text : "")).filter(Boolean).join("");
  return String(c ?? "");
};

/** Serialize OpenAI-style assistant.tool_calls into the same <tool_call> protocol the model is trained on. */
const _assistantTranscriptText = (m) => {
  if (String(m?.role || "") !== "assistant") return "";
  const text = String(msgText(m) || "").trim();
  const raw = m?.tool_calls || m?.toolCalls;
  const tcs = Array.isArray(raw) ? raw : [];
  const tags = [];
  for (const tc of tcs) {
    const fn = tc?.function || tc?.func;
    const name = fn?.name ? String(fn.name).trim() : "";
    if (!name) continue;
    let args = fn?.arguments;
    let argsObj;
    if (typeof args === "string") {
      try {
        argsObj = JSON.parse(args);
      } catch {
        argsObj = { _raw_arguments: args };
      }
    } else if (args && typeof args === "object" && !Array.isArray(args)) {
      argsObj = args;
    } else {
      argsObj = {};
    }
    const body = JSON.stringify({ name, arguments: argsObj });
    tags.push(`<tool_call>${body}</tool_call>`);
  }
  const parts = [];
  if (text) parts.push(text);
  if (tags.length) parts.push(tags.join("\n"));
  return parts.join("\n\n").trim();
};

const _transcriptBodyForMessage = (m) => {
  const roleRaw = String(m?.role || "user");
  if (roleRaw === "assistant") {
    const u = _assistantTranscriptText(m);
    return u;
  }
  return String(msgText(m) || "").trim();
};

const _toolsIncludeShell = (tools) =>
  Array.isArray(tools) && tools.some((t) => t && t.type === "function" && String(t.function?.name || "") === "execute_shell_command");

const _pickExampleToolName = (tools, forced) => {
  const f = forced && String(forced).trim() ? String(forced).trim() : "";
  if (f) return f;
  const names = (tools || [])
    .map((t) => (t && t.type === "function" && t.function?.name ? String(t.function.name).trim() : ""))
    .filter(Boolean);
  if (names.includes("execute_shell_command")) return "execute_shell_command";
  if (names.length === 1) return names[0];
  return names[0] || "tool_name";
};

const _exampleArgsForToolName = (name) => {
  if (name === "execute_shell_command") return { command: "dir" };
  if (name === "read_file") return { file_path: "%USERPROFILE%\\Desktop\\example.txt" };
  if (name === "write_file") return { file_path: "%USERPROFILE%\\Desktop\\out.txt", content: "hello" };
  if (name === "edit_file") return { file_path: "%USERPROFILE%\\Desktop\\out.txt", old_string: "a", new_string: "b" };
  return {};
};

const _buildToolExampleLines = (tools, forcedExampleTool) => {
  const exName = _pickExampleToolName(tools, forcedExampleTool);
  const exArgs = _exampleArgsForToolName(exName);
  const main = `<tool_call>${JSON.stringify({ name: exName, arguments: exArgs })}</tool_call>`;
  const lines = ["### Example (copy shape, then edit arguments)", main];
  if (exName === "execute_shell_command") {
    lines.push(
      "",
      "### Example: download a file (avoid inner quotes to keep JSON valid)",
      '<tool_call>{"name":"execute_shell_command","arguments":{"command":"curl -L -o %USERPROFILE%\\\\Downloads\\\\example.bin https://example.com/file.bin"}}</tool_call>',
    );
  }
  return lines.join("\n");
};

// zero-token web backends do not speak OpenAI-native tool calling.
// This gateway merges the full transcript into the upstream prompt, then
// converts model output into OpenAI `tool_calls` when possible so CoPaw can
// reuse the same structured tool loop as built-in models.
const _toolListText = (tools) => {
  if (!tools || !Array.isArray(tools) || tools.length === 0) return "";
  // openclaw-zero-token style: structured tool definitions (XML-ish) injected
  // into the prompt so web models can reliably emit <tool_call>.
  const out = [];
  out.push("## Available Tools");
  out.push("<tools>");
  for (const t of tools) {
    const fn = t?.type === "function" ? t.function : null;
    const name = fn?.name ? String(fn.name) : "";
    if (!name) continue;
    const desc = fn?.description ? String(fn.description) : "";
    const params = fn?.parameters || {};
    out.push("  <tool>");
    out.push(`    <name>${name}</name>`);
    if (desc) out.push(`    <description>${desc}</description>`);
    try {
      out.push(`    <parameters>${JSON.stringify(params)}</parameters>`);
    } catch {
      out.push("    <parameters>{}</parameters>");
    }
    out.push("  </tool>");
  }
  out.push("</tools>");
  return out.join("\n");
};

const mergeOpenAIMessages = (messages, tools, opts = {}) => {
  const hasTools = !!(tools && Array.isArray(tools) && tools.length);
  const parts = [];
  const MAX_SYSTEM_CHARS = 6000;
  const MAX_TRANSCRIPT_CHUNKS = 18;
  const MAX_TOTAL_CHARS = 24000;
  const requireTool = !!opts.requireTool;
  const extraSystemPrompt = typeof opts.extraSystemPrompt === "string" ? opts.extraSystemPrompt.trim() : "";
  const forcedExampleTool = typeof opts.forcedExampleTool === "string" ? opts.forcedExampleTool.trim() : "";

  const shellRules = _toolsIncludeShell(tools)
    ? [
        "### Windows command rules (CRITICAL)",
        "- The `execute_shell_command` tool runs `cmd.exe` on Windows (NOT bash).",
        "- DO NOT generate any Unix/bash commands or paths: `~/.openclaw`, `mkdir -p`, `rm`, `cp`, `tar`, `unzip`, `export`, `$HOME`.",
        "- Use Windows paths and env vars: `%USERPROFILE%\\.openclaw\\skills\\...`",
        "- For chaining commands in cmd.exe, prefer `&` (NOT `&&`). Avoid multiline scripts.",
        "- Do NOT use Unix-only tools like `head` (not in cmd.exe). Use `more`, PowerShell, or `findstr` as needed.",
        "- Paths with non-ASCII characters: prefer ASCII-only paths; or run `chcp 65001` first in the same line (e.g. `chcp 65001 & ...`) so literals are not corrupted.",
        "- To avoid long stalls, pass a smaller `timeout` in tool arguments (e.g. 15–30) for quick probes; default is 60 seconds.",
        "- Avoid `powershell -Command \"...\"` because JSON quoting breaks easily.",
        "  If PowerShell is needed, write a temporary `.ps1` file then run `powershell -NoProfile -ExecutionPolicy Bypass -File <file.ps1>`.",
        "",
      ]
    : [
        "### Environment",
        "- Follow each tool's JSON parameter schema under <tools> below.",
        "",
      ];

  // Put tool instructions FIRST so web backends can't ignore them.
  if (hasTools) {
    parts.push(
      [
        "## Tool Use Instructions (IMPORTANT)",
        "You are running inside CoPaw and you DO have tools.",
        "Only call tools when the user explicitly asks you to execute actions (open URL, download, read/write files, run commands, call skills).",
        "",
        ...shellRules,
        "### Post-tool rule (MUST FOLLOW)",
        "- After a tool runs (you receive <tool_response>...</tool_response>), you MUST respond with a short summary:",
        "  - success/failure",
        "  - the key stdout/stderr lines",
        "  - the next action you will take",
        "",
        "### tool_call formatting rules (MUST FOLLOW)",
        "- If you decide to call a tool, you MUST use ONLY this format:",
        '  <tool_call>{"name":"tool_name","arguments":{...}}</tool_call>',
        "- Inside <tool_call>...</tool_call> output PURE JSON only (no markdown fences, no extra text).",
        "- If you call a tool, do NOT output any other text outside <tool_call>...</tool_call>.",
        "- The JSON must be valid and complete (double quotes for keys/strings).",
        "- `arguments` must be a JSON object (not a string).",
        "- If the command string needs quotes, keep them properly escaped for JSON; otherwise write a script file and execute it.",
        "- File tools: use JSON key `file_path` for `read_file` / `write_file` / `edit_file`.",
        ...(requireTool
          ? [
              "",
              "### REQUIRED (tool_choice)",
              "You MUST call a tool before responding. Output ONLY <tool_call>...</tool_call> and nothing else.",
              "- 如果你输出了任何自然语言/解释/Markdown/代码块，系统会判定为失败并要求你重试。",
            ]
          : []),
        "",
        _buildToolExampleLines(tools, forcedExampleTool),
        "",
        _toolListText(tools),
      ].join("\n"),
    );
  }

  // Prefer a "System/User/Assistant" transcript style, matching what
  // openclaw-zero-token's web streams feed into web backends.
  const systemChunks = [];
  const otherChunks = [];

  for (const m of messages || []) {
    const roleRaw = String(m?.role || "user");

    if (roleRaw === "tool") {
      const t = String(msgText(m) || "").trim();
      if (!t) continue;
      const toolCallId = String(m?.tool_call_id || m?.toolCallId || m?.id || "");
      const toolName = String(m?.name || m?.tool_name || m?.toolName || "");
      otherChunks.push(
        `<tool_response${toolCallId ? ` id="${toolCallId}"` : ""}${toolName ? ` name="${toolName}"` : ""}>\n${t}\n</tool_response>`,
      );
      continue;
    }

    if (roleRaw === "system") {
      const t = String(msgText(m) || "").trim();
      if (!t) continue;
      systemChunks.push(t);
      continue;
    }

    const role =
      roleRaw === "assistant"
        ? "Assistant"
        : roleRaw === "developer"
          ? "System"
          : "User";
    const body = _transcriptBodyForMessage(m);
    if (!body) continue;
    otherChunks.push(`${role}: ${body}`);
  }

  if (systemChunks.length) {
    const sys = systemChunks.join("\n\n");
    parts.push(`System: ${sys.length > MAX_SYSTEM_CHARS ? `${sys.slice(0, MAX_SYSTEM_CHARS)}\n…(truncated)…` : sys}`);
  }

  // Align openclaw tool_choice prompts: append short "must call tool" hint to system context.
  // Keep this AFTER user-provided system messages so it's visible and not overwritten.
  if (extraSystemPrompt) {
    parts.push(`System: ${extraSystemPrompt}`);
  }

  // Keep only the tail of the transcript to avoid blowing up upstream context.
  const tail = otherChunks.length > MAX_TRANSCRIPT_CHUNKS ? otherChunks.slice(-MAX_TRANSCRIPT_CHUNKS) : otherChunks.slice();
  parts.push(...tail);

  // Best-effort size cap (keep the tail, which includes tool instructions).
  const merged = parts.join("\n\n");
  if (merged.length <= MAX_TOTAL_CHARS) return merged;
  // Keep the head (tool instructions) and the tail (recent transcript).
  const head = merged.slice(0, Math.floor(MAX_TOTAL_CHARS / 2));
  const tailKeep = merged.slice(-Math.floor(MAX_TOTAL_CHARS / 2));
  return `${head}\n\n…(truncated)…\n\n${tailKeep}`;
};

/** 与 canonical_models._ZERO_ORDERED / console zeroTokenWebConfig 一致；仅 Web 通道 */
const MODELS = [
  { id: "deepseek-chat", owned_by: "deepseek-web" },
  { id: "doubao-web", owned_by: "doubao-web" },
  { id: "claude-web", owned_by: "claude-web" },
  { id: "qwen-web", owned_by: "qwen-web" },
  { id: "qwen-cn-web", owned_by: "qwen-cn-web" },
  { id: "kimi-web", owned_by: "kimi-web" },
  { id: "chatgpt-web", owned_by: "chatgpt-web" },
  { id: "gemini-web", owned_by: "gemini-web" },
  { id: "glm-web", owned_by: "glm-web" },
  { id: "glm-intl-web", owned_by: "glm-intl-web" },
];

/** 对齐 openclaw-zero-token doubao-web-client：默认 config + buildQueryParams + getHeaders + streamGenerator */
const doubaoDefaultCfg = () => ({
  aid: "497858",
  device_platform: "web",
  language: "zh",
  pkg_type: "release_version",
  real_aid: "497858",
  region: "CN",
  samantha_web: "1",
  sys_region: "CN",
  use_olympus_account: "1",
  version_code: "20800",
});
const doubaoCfgFromCred = (c) => {
  const o = { ...doubaoDefaultCfg() };
  const put = (k, v) => {
    if (v != null && v !== "") o[k] = String(v);
  };
  put("msToken", c.msToken);
  put("a_bogus", c.a_bogus);
  put("fp", c.fp);
  put("tea_uuid", c.tea_uuid);
  put("device_id", c.device_id);
  put("web_tab_id", c.web_tab_id);
  put("web_id", c.web_id);
  put("aid", c.aid);
  put("version_code", c.version_code);
  put("pc_version", c.pc_version);
  put("region", c.region);
  put("language", c.language);
  // Fallback from browser cookie: s_v_web_id is often used as fp.
  if (!o.fp) {
    const fromCookie = cookieVal(c.cookie || "", "s_v_web_id");
    if (fromCookie) o.fp = fromCookie;
  }
  return o;
};
const doubaoBuildQs = (cfg) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(cfg))
    if (v != null && v !== "" && k !== "msToken" && k !== "a_bogus") p.append(k, String(v));
  if (cfg.msToken) p.append("msToken", String(cfg.msToken));
  if (cfg.a_bogus) p.append("a_bogus", String(cfg.a_bogus));
  return p.toString();
};
const doubaoHeaders = (c) =>
  clean({
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    "User-Agent":
      c.userAgent || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: "https://www.doubao.com/chat/",
    Origin: "https://www.doubao.com",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    Cookie: c.cookie || (c.ttwid ? `sessionid=${c.sessionid}; ttwid=${decodeURIComponent(String(c.ttwid))}` : `sessionid=${c.sessionid}`),
    "Agw-js-conv": "str",
  });
const doubaoMerge = (messages) =>
  (messages || [])
    .map((m) => `<|im_start|>${m?.role === "assistant" ? "assistant" : m?.role === "system" ? "system" : "user"}\n${msgText(m)}\n`)
    .join("") + "<|im_end|>\n";
const doubaoParseSingleLineSse = (line) => {
  const m = line.match(/id:\s*\d+\s+event:\s*(\S+)\s+data:\s*(.+)/);
  return m ? { event: m[1].trim(), data: m[2].trim() } : null;
};
const doubaoParseEventDataStr = (s) => {
  if (!s || typeof s !== "string") return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};
/** 710022004：错误正文用上游字段；长排查说明只写在 docs/zero-token.md */
const doubaoErr710022 = (detail) =>
  new Error(`豆包 710022004: ${String(detail || "rate limited")}。详见 docs/zero-token.md`);
/** 豆包常在 event_data 内嵌 { code:710022004, message:"rate limited" }，与 STREAM_ERROR 并列 */
const doubaoThrowIfSamanthaError = (raw) => {
  const lim = (o) =>
    o &&
    (o.code === 710022004 ||
      /rate\s*limit/i.test(String(o.message || "")) ||
      o.error_detail?.code === 710022004);
  if (lim(raw)) throw doubaoErr710022(raw.message || raw.error_msg || raw.error_detail?.message);
  const inner = doubaoParseEventDataStr(raw?.event_data);
  if (lim(inner)) throw doubaoErr710022(inner.message || inner.error_msg || inner.error_detail?.message);
};
const doubaoExtractTextFromSamanthaLine = (line) => {
  const chunks = [];
  let raw;
  try {
    raw = JSON.parse(line);
  } catch {
    return chunks;
  }
  doubaoThrowIfSamanthaError(raw);
  if (raw.code != null && raw.code !== 0)
    throw new Error(`豆包API错误: ${raw.message || raw.msg || JSON.stringify(raw).slice(0, 200)} (code=${raw.code})`);
  if (raw.event_type === 2003) return chunks;
  if (raw.event_type !== 2001 || !raw.event_data) return chunks;
  let result;
  try {
    result = JSON.parse(raw.event_data);
  } catch {
    return chunks;
  }
  doubaoThrowIfSamanthaError(result);
  if (result.is_finish) return chunks;
  const message = result.message;
  const contentType = message?.content_type;
  if (!message || contentType === undefined || ![2001, 2008].includes(contentType) || !message.content) return chunks;
  try {
    const content = JSON.parse(message.content);
    if (content.text) chunks.push(String(content.text));
  } catch {
    /* ignore bad chunk json */
  }
  return chunks;
};
const doubaoExtractTextFromEvent = (event) => {
  const chunks = [];
  if (!event.event || !event.data) return chunks;
  let data;
  try {
    data = JSON.parse(event.data);
  } catch {
    return chunks;
  }
  switch (event.event) {
    case "CHUNK_DELTA":
      if (data.text) chunks.push(String(data.text));
      break;
    case "STREAM_CHUNK":
      if (Array.isArray(data.patch_op))
        for (const patch of data.patch_op)
          if (patch.patch_value?.tts_content) chunks.push(String(patch.patch_value.tts_content));
      break;
    case "STREAM_MSG_NOTIFY":
      if (data.content?.content_block)
        for (const block of data.content.content_block) {
          const t = block.content?.text_block?.text;
          if (t) chunks.push(String(t));
        }
      break;
    case "STREAM_ERROR":
      if (data.error_code === 710022004) throw doubaoErr710022(data.error_msg);
      throw new Error(`豆包API错误: ${data.error_msg} (${data.error_code})`);
    default:
      break;
  }
  return chunks;
};
/** 对齐 DoubaoWebClientBrowser：同凭证复用 conversation_id，首条 need_create_conversation=true */
const doubaoConvByKey = new Map();
const doubaoSessKey = (c) => {
  const sid = String(c.sessionid || "").trim();
  if (sid) return `s:${sid}`;
  return `h:${crypto.createHash("sha256").update(String(c.cookie || "")).digest("hex").slice(0, 32)}`;
};
const doubaoCaptureCid = (snippet, st) => {
  if (!snippet || !String(snippet).includes("conversation_id")) return;
  const m = String(snippet).match(/"conversation_id"\s*:\s*"([^"]+)"/);
  if (m?.[1] && m[1] !== "0") st.cid = m[1];
};
const doubaoBuildChatBody = (c, messages, st) => ({
  messages: [{ content: j({ text: doubaoMerge(messages) }), content_type: 2001, attachments: [], references: [] }],
  completion_option: {
    is_regen: false,
    with_suggest: true,
    need_create_conversation: !st.cid,
    launch_stage: 1,
    is_replace: false,
    is_delete: false,
    message_from: 0,
    event_id: "0",
  },
  conversation_id: st.cid || "0",
  local_conversation_id: `local_16${Date.now().toString().slice(-14)}`,
  local_message_id: crypto.randomUUID?.() || `${Date.now()}`,
});
/** SSE 解析（Node fetch 与 CDP 页内 fetch 共用） */
const doubaoCreateSseParser = (onDelta, st) => {
  let buffer = "";
  let rawFull = "";
  let dbgAcc = "";
  let currentEvent = {};
  let eventCount = 0;
  let textEventCount = 0;
  let nEmitted = 0;
  const emitChunks = (arr) => {
    for (const ch of arr) {
      onDelta(ch);
      nEmitted++;
    }
  };
  const feedEvent = (ev) => {
    const chunks = doubaoExtractTextFromEvent(ev);
    eventCount++;
    if (chunks.length) textEventCount++;
    emitChunks(chunks);
  };
  const handleLine = (trimmed) => {
    if (trimmed.startsWith("data:")) {
      const p = trimmed.slice(5).trim();
      if (p && p !== "[DONE]" && p.startsWith("{")) {
        try {
          const o = JSON.parse(p);
          if (o?.error?.message) throw new Error(String(o.error.message));
        } catch (e) {
          if (!(e instanceof SyntaxError)) throw e;
        }
      }
    }
    doubaoCaptureCid(trimmed, st);
    if (Z.streamDbg && trimmed && dbgAcc.length < 800) dbgAcc += `${trimmed.slice(0, 200)}|`;
    if (trimmed === "") {
      if (currentEvent.event && currentEvent.data) feedEvent(currentEvent);
      currentEvent = {};
      return;
    }
    const single = doubaoParseSingleLineSse(trimmed);
    if (single) {
      feedEvent({ event: single.event, data: single.data });
      currentEvent = {};
      return;
    }
    const dataLine = trimmed.startsWith("data: ") ? trimmed.slice(6).trim() : trimmed;
    const sam = doubaoExtractTextFromSamanthaLine(dataLine);
    if (sam.length) {
      eventCount++;
      textEventCount++;
      emitChunks(sam);
      currentEvent = {};
      return;
    }
    if (trimmed.startsWith("id: ")) currentEvent.id = trimmed.substring(4).trim();
    else if (trimmed.startsWith("event: ")) currentEvent.event = trimmed.substring(7).trim();
    else if (trimmed.startsWith("data: ")) currentEvent.data = trimmed.substring(6).trim();
  };
  return {
    push(dec) {
      rawFull += dec;
      buffer += dec;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) handleLine(line.trim());
      doubaoCaptureCid(rawFull.slice(-8000), st);
    },
    finalize() {
      if (buffer.trim()) handleLine(buffer.trim());
      if (currentEvent.event && currentEvent.data) feedEvent(currentEvent);
      if (eventCount > 0 && textEventCount === 0) {
        throw new Error(
          `[Doubao] 收到 ${eventCount} 个 SSE 事件但未解析出文本，请检查 sessionid/cookie 是否有效或上游格式是否变更${Z.streamDbg ? ` dbg=${dbgAcc.slice(0, 500)}` : ""}`,
        );
      }
      if (nEmitted === 0) {
        const peek = rawFull.replace(/\s+/g, " ").slice(0, 280);
        throw new Error(
          `[Doubao] 空响应或未解析到文本：请检查 doubao_auth.json；片段：${peek || "(空)"}${Z.streamDbg ? ` dbg=${dbgAcc.slice(0, 500)}` : ""}`,
        );
      }
    },
  };
};
const streamDoubaoNode = async (messages, model, onDelta, c, k, st) => {
  const cfg = doubaoCfgFromCred(c);
  const url = `https://www.doubao.com/samantha/chat/completion?${doubaoBuildQs(cfg)}`;
  const body = doubaoBuildChatBody(c, messages, st);
  const r = await fetch(url, { method: "POST", headers: doubaoHeaders(c), body: j(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${(await r.text()).slice(0, 800)}`);
  const reader = r.body?.getReader();
  if (!reader) throw new Error("[Doubao] No response body");
  const decoder = new TextDecoder();
  const parser = doubaoCreateSseParser(onDelta, st);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
    }
    parser.finalize();
  } finally {
    if (st.cid) doubaoConvByKey.set(k, st);
  }
};

const claudeHeaders = (c) =>
  clean({
    "Content-Type": "application/json",
    Cookie: c.cookie || `sessionKey=${c.sessionKey}`,
    "User-Agent": c.userAgent || "Mozilla/5.0",
    Accept: "text/event-stream",
    Referer: "https://claude.ai/",
    Origin: "https://claude.ai",
    "anthropic-client-platform": "web_claude_ai",
    "anthropic-device-id": c.deviceId || c.device_id || c.anthropic_device_id || "",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  });

const claudeJsonLine = (ln) => {
  const s = String(ln || "").trim();
  if (!s || !s.startsWith("data:")) return null;
  const p = s.slice(5).trim();
  if (!p || p === "[DONE]") return null;
  try { return JSON.parse(p); } catch { return null; }
};

const claudeDelta = (o) => {
  if (!o || typeof o !== "object") return "";
  if (typeof o.completion === "string") return o.completion;
  if (typeof o.delta === "string") return o.delta;
  const d = o.delta;
  if (d && typeof d === "object" && typeof d.text === "string") return d.text;
  const m = o.message;
  const c = m && typeof m === "object" ? m.content : null;
  if (Array.isArray(c)) {
    const t = c.map((x) => (x && typeof x.text === "string" ? x.text : "")).filter(Boolean).join("");
    if (t) return t;
  }
  return "";
};

const claudeOrg = async (c) => {
  const url = "https://claude.ai/api/organizations";
  const r = await fetch(url, { headers: claudeHeaders(c) });
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${(await r.text()).slice(0, 800)}`);
  const xs = await r.json();
  const id = xs?.[0]?.uuid;
  return id ? String(id) : "";
};

const claudeConv = async (c, org) => {
  const url = org ? `https://claude.ai/api/organizations/${org}/chat_conversations` : "https://claude.ai/api/chat_conversations";
  const r = await fetch(url, {
    method: "POST",
    headers: claudeHeaders(c),
    body: j({ name: `Conversation ${new Date().toISOString()}`, uuid: crypto.randomUUID?.() || `${Date.now()}` }),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${t.slice(0, 800)}`);
  const o = t ? JSON.parse(t) : {};
  const id = o?.uuid;
  return id ? String(id) : "";
};

const streamClaude = async (messages, model, onDelta) => {
  const c = credClaude();
  const org = await claudeOrg(c);
  const cid = await claudeConv(c, org);
  if (!cid) throw new Error("[Claude] failed to create conversation");
  const url = org
    ? `https://claude.ai/api/organizations/${org}/chat_conversations/${cid}/completion`
    : `https://claude.ai/api/chat_conversations/${cid}/completion`;
  const body = {
    prompt: msgText((messages || []).at?.(-1) || {}),
    parent_message_uuid: "00000000-0000-4000-8000-000000000000",
    model: model || "claude-sonnet-4-6",
    timezone: "Asia/Shanghai",
    rendering_mode: "messages",
    attachments: [],
    files: [],
    locale: "zh-CN",
    personalized_styles: [],
    sync_sources: [],
    tools: [],
  };
  const r = await fetch(url, { method: "POST", headers: claudeHeaders(c), body: j(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${(await r.text()).slice(0, 800)}`);
  const td = new TextDecoder("utf-8");
  let buf = "";
  let n = 0;
  for await (const chunk of r.body) {
    buf += td.decode(chunk, { stream: true });
    const parts = buf.split(/\r?\n/);
    buf = parts.pop() || "";
    for (const ln of parts) {
      const o = claudeJsonLine(ln);
      const t = claudeDelta(o);
      if (t) { n++; onDelta(t); }
    }
  }
  if (buf) {
    for (const ln of buf.split(/\r?\n/)) {
      const o = claudeJsonLine(ln);
      const t = claudeDelta(o);
      if (t) { n++; onDelta(t); }
    }
  }
  if (!n) throw new Error("[Claude] 收到响应但未解析出文本：可能被 Cloudflare/登录态失效/接口格式变更");
};

const qwenBase = "https://chat.qwen.ai";
/** 对齐 qwen-web-client-browser 页内 fetch：仅 Content-Type + Accept + Cookie（会话在 Cookie） */
const qwenHeaders = (c) =>
  clean({
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    Cookie: c.cookie || `qwen_session=${c.sessionToken}`,
  });
const qwenCreateChat = async (c) => {
  const r = await fetch(`${qwenBase}/api/v2/chats/new`, { method: "POST", headers: qwenHeaders(c), body: "{}" });
  const t = await r.text();
  if (!r.ok) throw new Error(`${qwenBase}/api/v2/chats/new -> ${r.status}: ${t.slice(0, 500)}`);
  const d = t ? JSON.parse(t) : {};
  const chatId = d?.data?.id ?? d?.chat_id ?? d?.id ?? d?.chatId;
  if (!chatId) throw new Error(`Qwen create chat no chat_id: ${t.slice(0, 300)}`);
  return String(chatId);
};
const qwenDeltaTxt = (d) => {
  if (typeof d === "string" && d) return d;
  if (!d || typeof d !== "object") return "";
  const c = d.content;
  if (typeof c === "string" && c) return c;
  if (Array.isArray(c))
    return c.map((x) => (typeof x === "string" ? x : x?.text ?? x?.content ?? x?.value ?? "")).join("");
  const rc = d.reasoning_content;
  if (typeof rc === "string" && rc) return rc;
  return typeof d.text === "string" ? d.text : "";
};
const qwenDeepDelta = (o) => {
  if (!o || typeof o !== "object") return "";
  const d = o.choices?.[0]?.delta;
  if (typeof d === "string" && d) return d;
  if (!d || typeof d !== "object") return "";
  if (typeof d.text === "string" && d.text) return d.text;
  if (Array.isArray(d.content))
    return d.content.map((x) => (typeof x === "string" ? x : x?.text ?? x?.content ?? "")).join("");
  if (d.content != null && typeof d.content === "object") {
    if (typeof d.content.text === "string") return d.content.text;
    return qwenDeltaTxt({ content: d.content });
  }
  return "";
};
const qwenPayloadText = (o) => {
  if (!o || typeof o !== "object") return "";
  const dd = qwenDeepDelta(o);
  if (dd) return dd;
  const pick = (ch) => qwenDeltaTxt(ch?.delta) || qwenDeltaTxt(ch?.message);
  let t = pick(o.choices?.[0]);
  if (t) return t;
  t = pick(o.data?.choices?.[0]);
  if (t) return t;
  if (typeof o.data === "string") {
    try {
      return qwenPayloadText(JSON.parse(o.data));
    } catch {
      return "";
    }
  }
  if (o.data && typeof o.data === "object") {
    const inner = qwenPayloadText(o.data);
    if (inner) return inner;
  }
  if (typeof o.output?.text === "string") return o.output.text;
  const oc = o.output?.choices?.[0]?.message?.content;
  if (typeof oc === "string") return oc;
  if (typeof o.data?.text === "string") return o.data.text;
  if (typeof o.result?.text === "string") return o.result.text;
  if (typeof o.text === "string") return o.text;
  if (typeof o.content === "string") return o.content;
  if (typeof o.message?.content === "string") return o.message.content;
  return "";
};
/** 从首个 { 起括号平衡切出一段 JSON（粘包/截断时尽量兜底） */
const qwenCnBalancedJsonSlice = (s) => {
  const t = String(s || "").trim();
  const i = t.indexOf("{");
  if (i < 0) return "";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let j = i; j < t.length; j++) {
    const ch = t[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return t.slice(i, j + 1);
    }
  }
  return "";
};

const qwenCnTryParsePayload = (payload) => {
  const p = String(payload || "").trim();
  if (!p) return null;
  try {
    return JSON.parse(p);
  } catch {
    const slice = qwenCnBalancedJsonSlice(p);
    if (!slice) return null;
    try {
      return JSON.parse(slice);
    } catch {
      return null;
    }
  }
};

/** 上游在 event:complete 等帧里除 messages 外，还会在 chat_odps / 嵌套对象中带正文 */
const QWEN_CN_TEXT_KEYS = new Set([
  "text",
  "content",
  "answer",
  "markdown",
  "reasoning",
  "output",
  "delta",
  "message",
  "value",
  "body",
  "summary",
]);
/** UI/路由元数据键：深入递归会把 regenerate 等按钮文案拼进正文 */
const QWEN_CN_SKIP_DEEP_KEYS = new Set([
  "debug",
  "intent_data",
  "extra_info",
  "operation_types",
  "intent_debug_data",
  "recall_info",
  "recall_trigger",
]);
const QWEN_CN_UI_TOKEN = new Set(["regenerate", "expansion", "simplify", "regenerat"]);
const qwenCnDeepExtractAssistantText = (node, depth = 0) => {
  if (depth > 16 || node == null) return "";
  if (typeof node === "string") {
    const t = node.trim();
    if (t.length < 8) return "";
    const low = t.toLowerCase();
    if (QWEN_CN_UI_TOKEN.has(low)) return "";
    return t;
  }
  if (Array.isArray(node)) {
    let acc = "";
    for (const x of node) acc += qwenCnDeepExtractAssistantText(x, depth + 1);
    return acc;
  }
  if (typeof node !== "object") return "";
  let acc = "";
  for (const [k, v] of Object.entries(node)) {
    if (QWEN_CN_SKIP_DEEP_KEYS.has(k)) continue;
    if (k === "intent_content" && typeof v === "string" && v.length < 16) continue;
    if (QWEN_CN_TEXT_KEYS.has(k) && typeof v === "string" && v.trim()) {
      acc += v;
      continue;
    }
    if (typeof v === "object" && v !== null) {
      if (k === "meta_data" && depth > 1) continue;
      acc += qwenCnDeepExtractAssistantText(v, depth + 1);
    }
  }
  return acc;
};

/** acc 后缀与 snap 前缀的最大重叠长度（用于非单调累积快照时只发增量，避免整段重复） */
const qwenCnOverlapSuffixPrefix = (acc, snap) => {
  const a = String(acc || "");
  const b = String(snap || "");
  const max = Math.min(a.length, b.length);
  for (let k = max; k > 0; k--) {
    if (a.endsWith(b.slice(0, k))) return k;
  }
  return 0;
};

/** 千问国内 chat2.qianwen.com：SSE 常为 data.messages[]，含 signal/post 控制帧与正文分片 */
const qwenCnOneMessageText = (m) => {
  if (!m || typeof m !== "object") return "";
  const mt = String(m.mime_type || "").toLowerCase();
  const meta = m.meta_data;
  if (meta && typeof meta === "object") {
    if (meta.is_user === true || meta.role === "user" || meta.from === "user") return "";
  }
  if (typeof m.content === "string" && m.content) return m.content;
  if (m.content && typeof m.content === "object") {
    if (typeof m.content.text === "string") return m.content.text;
    const inner = qwenDeltaTxt(m.content);
    if (inner) return inner;
  }
  if (typeof m.text === "string" && m.text) return m.text;
  if (typeof m.delta === "string" && m.delta) return m.delta;
  if (m.delta && typeof m.delta === "object") {
    const d = qwenDeltaTxt(m.delta);
    if (d) return d;
  }
  if (Array.isArray(m.parts))
    return m.parts.map((p) => (typeof p === "string" ? p : qwenCnOneMessageText(p))).join("");
  if (mt.startsWith("signal/")) return "";
  return "";
};
const qwenCnSnapshotFromData = (data) => {
  if (!data || typeof data !== "object") return "";
  const msgs = data.messages;
  if (Array.isArray(msgs)) {
    const fromMsgs = msgs.map((m) => qwenCnOneMessageText(m)).join("");
    if (fromMsgs) return fromMsgs;
  }
  return qwenCnDeepExtractAssistantText(data);
};
/** 从整段 JSON 拉取国内站可展示正文（优先 data.messages） */
const qwenCnSnapshotFromPayload = (o) => {
  if (!o || typeof o !== "object") return "";
  const a = qwenCnSnapshotFromData(o.data);
  if (a) return a;
  return qwenCnSnapshotFromData(o);
};

/** 按累积快照发增量，避免上游重传整段时控制台重复多遍 */
const qwenCnApplySnapshotDelta = (st, snap, onDelta) => {
  if (!snap) return 0;
  const acc = st.cnAcc || "";
  if (!acc) {
    onDelta(snap);
    st.cnAcc = snap;
    return 1;
  }
  if (snap === acc) return 0;
  if (snap.startsWith(acc)) {
    const delta = snap.slice(acc.length);
    if (!delta) return 0;
    onDelta(delta);
    st.cnAcc = snap;
    return 1;
  }
  const ov = qwenCnOverlapSuffixPrefix(acc, snap);
  if (ov > 0) {
    const delta = snap.slice(ov);
    if (!delta) return 0;
    onDelta(delta);
    st.cnAcc = acc + delta;
    return 1;
  }
  if (snap.length < 512 && !acc.includes(snap)) {
    onDelta(snap);
    st.cnAcc = acc + snap;
    return 1;
  }
  if (!acc.includes(snap)) {
    onDelta(snap);
    st.cnAcc = snap;
    return 1;
  }
  return 0;
};

const qwenFeedSseLineCn = (trimmed, st, onDelta) => {
  let n = 0;
  if (!trimmed) {
    st.sseEvent = "";
    return n;
  }
  if (trimmed.startsWith(":")) return n;
  const em = trimmed.match(/^event:\s*(.*)$/i);
  if (em) {
    st.sseEvent = em[1].trim();
    return n;
  }
  const dm = trimmed.match(/^data:\s*(.*)$/i);
  if (dm) {
    const payload = dm[1].trim();
    if (!payload || payload === "[DONE]") return n;
    const o = qwenCnTryParsePayload(payload);
    if (!o) {
      n += qwenFeedSseLine(trimmed, { sseEvent: st.sseEvent }, onDelta);
      st.sseEvent = "";
      return n;
    }
    const snap = qwenCnSnapshotFromPayload(o);
    if (snap) n += qwenCnApplySnapshotDelta(st, snap, onDelta);
    if (!n) {
      let t = qwenPayloadText(o);
      if (!t && !snap) t = qwenCnDeepExtractAssistantText(o.data || o);
      if (t) n += qwenCnApplySnapshotDelta(st, t, onDelta);
    }
    st.sseEvent = "";
    return n;
  }
  const t2 = qwenSseDelta(trimmed);
  if (t2) {
    onDelta(t2);
    n++;
  }
  return n;
};

/** 从整段原始缓冲里扫描所有 `data:` 块并尝试解析（换行不规范/多段 JSON 时兜底） */
const qwenCnScavengeAllDataBlocks = (raw, st, onDelta) => {
  let n = 0;
  const s = String(raw || "");
  let pos = 0;
  while (pos < s.length) {
    const idx = s.indexOf("data:", pos);
    if (idx < 0) break;
    const rest = s.slice(idx + 5).trimStart();
    const slice = qwenCnBalancedJsonSlice(rest);
    if (slice) {
      try {
        const o = JSON.parse(slice);
        let snap = qwenCnSnapshotFromPayload(o) || qwenPayloadText(o);
        if (!snap) snap = qwenCnDeepExtractAssistantText(o.data || o);
        if (snap) n += qwenCnApplySnapshotDelta(st, snap, onDelta);
      } catch {
        /* noop */
      }
    }
    pos = idx + 5;
  }
  return n;
};
const qwenScavengeRawCn = (raw, st, onDelta) => {
  let k = 0;
  for (const ln of String(raw).replace(/^\uFEFF/, "").split(/\r?\n/)) {
    k += qwenFeedSseLineCn(ln.trim(), st, onDelta);
  }
  if (!k) k += qwenCnScavengeAllDataBlocks(raw, st, onDelta);
  return k;
};
const qwenSsePayload = (s) => {
  const t = String(s ?? "").trim();
  const m = t.match(/^data:\s*(.*)$/i);
  return m ? m[1].trim() : t;
};
const qwenSseDelta = (line) => {
  let s = String(line || "").trim();
  if (!s || s.startsWith(":")) return "";
  if (/^event:/i.test(s)) return "";
  s = qwenSsePayload(s);
  if (!s || s === "[DONE]") return "";
  try {
    const o = JSON.parse(s);
    if (!o || typeof o !== "object") return "";
    const pt = qwenPayloadText(o);
    if (pt) return pt;
    const tail = o.delta ?? (typeof o.v === "string" ? o.v : "");
    return typeof tail === "string" && tail ? tail : "";
  } catch { return ""; }
};
const qwenFeedSseLine = (trimmed, st, onDelta) => {
  let n = 0;
  if (!trimmed) {
    st.sseEvent = "";
    return n;
  }
  if (trimmed.startsWith(":")) return n;
  const em = trimmed.match(/^event:\s*(.*)$/i);
  if (em) {
    st.sseEvent = em[1].trim();
    return n;
  }
  const dm = trimmed.match(/^data:\s*(.*)$/i);
  if (dm) {
    const payload = dm[1].trim();
    if (!payload || payload === "[DONE]") return n;
    try {
      const o = JSON.parse(payload);
      const t = qwenPayloadText(o);
      if (t) {
        onDelta(t);
        n++;
      }
    } catch {
      const fb = qwenSseDelta(`data: ${payload}`);
      if (fb) {
        onDelta(fb);
        n++;
      }
    }
    st.sseEvent = "";
    return n;
  }
  const t2 = qwenSseDelta(trimmed);
  if (t2) {
    onDelta(t2);
    n++;
  }
  return n;
};
const qwenScavengeRaw = (raw, onDelta) => {
  let k = 0;
  const st = { sseEvent: "" };
  for (const ln of String(raw).replace(/^\uFEFF/, "").split(/\r?\n/)) {
    k += qwenFeedSseLine(ln.trim(), st, onDelta);
  }
  if (k) return k;
  for (const seg of String(raw).split(/\r?\n/)) {
    const pl = qwenSsePayload(seg);
    if (!pl || pl === "[DONE]") continue;
    try {
      const o = JSON.parse(pl);
      const t = qwenPayloadText(o);
      if (t) {
        onDelta(t);
        k++;
      }
    } catch {}
  }
  return k;
};
const qwenUpstreamModel = (m) => (m === "qwen-web" || !m || m === "qwen-max" ? "qwen3.5-plus" : m);
const streamQwen = async (messages, model, onDelta) => {
  const c = credQwen();
  const chatId = await qwenCreateChat(c);
  const fid = crypto.randomUUID?.() || `f-${Date.now()}`;
  const um = qwenUpstreamModel(model);
  const body = {
    stream: true,
    version: "2.1",
    incremental_output: true,
    chat_id: chatId,
    chat_mode: "normal",
    model: um,
    parent_id: null,
    messages: [{
      fid,
      parentId: null,
      childrenIds: [],
      role: "user",
      content: msgText((messages || []).at?.(-1) || {}),
      user_action: "chat",
      files: [],
      timestamp: Math.floor(Date.now() / 1000),
      models: [um],
      chat_type: "t2t",
      feature_config: { thinking_enabled: true, output_schema: "phase" },
    }],
  };
  const url = `${qwenBase}/api/v2/chat/completions?chat_id=${chatId}`;
  const r = await fetch(url, { method: "POST", headers: qwenHeaders(c), body: j(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status}: ${(await r.text()).slice(0, 600)}`);
  const td = new TextDecoder("utf-8");
  let buf = "";
  let rawFull = "";
  let n = 0;
  let qDbg = "";
  const qSt = { sseEvent: "" };
  const qFeed = (ln) => {
    const t = String(ln ?? "").trimEnd().trim();
    if (Z.streamDbg && t && qDbg.length < 800) qDbg += `${t.slice(0, 200)}|`;
    n += qwenFeedSseLine(t, qSt, onDelta);
  };
  for await (const chunk of r.body) {
    const dec = td.decode(chunk, { stream: true });
    rawFull += dec;
    buf += dec;
    const parts = buf.split(/\r?\n/);
    buf = parts.pop() || "";
    for (const ln of parts) qFeed(ln);
  }
  const qFin = td.decode();
  buf += qFin;
  rawFull += qFin;
  for (const ln of buf.split(/\r?\n/)) qFeed(ln);
  if (!n) n += qwenScavengeRaw(rawFull, onDelta);
  if (!n) {
    const peek = rawFull.replace(/\s+/g, " ").slice(0, 280);
    throw new Error(
      `[Qwen] 未解析到流式内容：请检查 qwen_auth.json；响应片段(前280字)：${peek || "(空)"}${Z.streamDbg ? ` dbg=${qDbg.slice(0, 500)}` : ""}`,
    );
  }
};

const qwenCnBase = "https://chat2.qianwen.com";
const qwenCnHeaders = (c) =>
  clean({
    "Content-Type": "application/json",
    Accept: "text/event-stream, text/plain, */*",
    Cookie: c.cookie,
    "User-Agent": c.userAgent || "Mozilla/5.0",
    "x-xsrf-token": c.xsrfToken || "",
    "x-deviceid": c.deviceId || c.ut || "pc",
    "x-platform": "pc_tongyi",
    Referer: "https://www.qianwen.com/",
    Origin: qwenCnBase,
  });
const streamQwenCn = async (messages, model, onDelta) => {
  const c = credQwenCn();
  const sessionId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const ts = Date.now();
  const nonce = Math.random().toString(36).slice(2);
  const qs = `biz_id=ai_qwen&chat_client=h5&device=pc&fr=pc&pr=qwen&nonce=${nonce}&timestamp=${ts}&ut=${encodeURIComponent(c.ut || "")}`;
  const url = `${qwenCnBase}/api/v2/chat?${qs}`;
  const body = {
    model: model === "qwen-cn-web" ? "Qwen3.5-Plus" : model || "Qwen3.5-Plus",
    messages: [{ content: msgText((messages || []).at?.(-1) || {}), mime_type: "text/plain", meta_data: { ori_query: msgText((messages || []).at?.(-1) || {}) } }],
    session_id: sessionId,
    parent_req_id: "0",
    deep_search: "0",
    req_id: "req-" + Math.random().toString(36).slice(2),
    scene: "chat",
    sub_scene: "chat",
    temporary: false,
    from: "default",
    scene_param: "first_turn",
    chat_client: "h5",
    client_tm: String(ts),
    protocol_version: "v2",
    biz_id: "ai_qwen",
  };
  const r = await fetch(url, { method: "POST", headers: qwenCnHeaders(c), body: j(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status}: ${(await r.text()).slice(0, 600)}`);
  const td = new TextDecoder("utf-8");
  let buf = "";
  let rawFull = "";
  let n = 0;
  let cnDbg = "";
  const cnSt = { sseEvent: "", cnAcc: "" };
  const cnFeed = (ln) => {
    const t = String(ln ?? "").trimEnd().trim();
    if (Z.streamDbg && t && cnDbg.length < 800) cnDbg += `${t.slice(0, 200)}|`;
    n += qwenFeedSseLineCn(t, cnSt, onDelta);
  };
  for await (const chunk of r.body) {
    const dec = td.decode(chunk, { stream: true });
    rawFull += dec;
    buf += dec;
    const parts = buf.split(/\r?\n/);
    buf = parts.pop() || "";
    for (const ln of parts) cnFeed(ln);
  }
  const cnFin = td.decode();
  buf += cnFin;
  rawFull += cnFin;
  for (const ln of buf.split(/\r?\n/)) cnFeed(ln);
  if (!n) n += qwenScavengeRawCn(rawFull, { sseEvent: "", cnAcc: "" }, onDelta);
  if (!n) {
    const peek = rawFull.replace(/\s+/g, " ").slice(0, 280);
    throw new Error(
      `[Qwen CN] 未解析到流式内容：请检查 qwen_cn_auth.json。片段：${peek || "(空)"}${Z.streamDbg ? ` dbg=${cnDbg.slice(0, 500)}` : ""}`,
    );
  }
};

const kimiBase = "https://www.kimi.com";
const kimiHeaders = (c) =>
  clean({
    "Content-Type": "application/connect+json",
    "Connect-Protocol-Version": "1",
    Accept: "*/*",
    Origin: kimiBase,
    Referer: `${kimiBase}/`,
    "X-Language": "zh-CN",
    "X-Msh-Platform": "web",
    Authorization: `Bearer ${c.kimiAuth}`,
    "User-Agent": c.userAgent || "Mozilla/5.0",
  });
const kimiConnectBody = (message, scenario) => {
  const req = { scenario, message: { role: "user", blocks: [{ message_id: "", text: { content: message } }], scenario }, options: { thinking: false } };
  const enc = Buffer.from(JSON.stringify(req), "utf8");
  const buf = Buffer.allocUnsafe(5 + enc.length);
  buf[0] = 0x00;
  buf.writeUInt32BE(enc.length, 1);
  enc.copy(buf, 5);
  return buf;
};
const streamKimi = async (messages, model, onDelta) => {
  const c = credKimi();
  const scenario = "SCENARIO_K2";
  const body = kimiConnectBody(msgText((messages || []).at?.(-1) || {}), scenario);
  const url = `${kimiBase}/apiv2/kimi.gateway.chat.v1.ChatService/Chat`;
  const r = await fetch(url, { method: "POST", headers: kimiHeaders(c), body });
  if (!r.ok) throw new Error(`${url} -> ${r.status}: ${(await r.text()).slice(0, 500)}`);
  const arr = await r.arrayBuffer();
  const u8 = new Uint8Array(arr);
  let o = 0;
  let n = 0;
  while (o + 5 <= u8.length) {
    const len = new DataView(u8.buffer, u8.byteOffset + o + 1, 4).getUint32(0, false);
    if (o + 5 + len > u8.length) break;
    const chunk = u8.slice(o + 5, o + 5 + len);
    try {
      const obj = JSON.parse(new TextDecoder().decode(chunk));
      if (obj.error) throw new Error(obj.error.message || obj.error.code || JSON.stringify(obj.error).slice(0, 200));
      if (obj.block?.text?.content && ["set", "append"].includes(String(obj.op || ""))) { n++; onDelta(obj.block.text.content); }
      if (obj.done) break;
    } catch (e) { if (e?.message && !e.message.startsWith("[")) throw e; }
    o += 5 + len;
  }
  if (!n) throw new Error("[Kimi] 未解析到内容，请检查 kimi_auth.json (kimi-auth)");
};

const deepseekCompletion = async (messages, model) => {
  const c = cred();
  let sid;
  try {
    sid = await createSession(c);
  } catch (e) {
    throw new Error(`deepseek sessionCreate failed: ${String(e?.message || e)}`);
  }
  const prompt = msgText(messages?.at?.(-1) || {});
  let ch;
  try {
    ch = await createPow(c, C.api.completion);
  } catch (e) {
    throw new Error(`deepseek powCreate failed: ${String(e?.message || e)}`);
  }
  const ans = await solvePow(ch);
  const pow = b64(j({ ...ch, answer: ans, target_path: C.api.completion }));
  const body = {
    chat_session_id: sid,
    parent_message_id: null,
    prompt,
    ref_file_ids: [],
    thinking_enabled: thinkingEnabled(model || "deepseek-chat"),
    search_enabled: true,
    preempt: false,
  };
  const url = `${C.base}${C.api.completion}`;
  const r = await fetch(url, { method: "POST", headers: clean({ ...h(c), "x-ds-pow-response": pow }), body: j(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${(await r.text()).slice(0, 800)}`);
  const out = [];
  for await (const chunk of r.body) out.push(Buffer.from(chunk));
  return sseText(Buffer.concat(out).toString("utf8"));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let s = "";
    req.setEncoding("utf8");
    req.on("data", (c) => (s += c));
    req.on("end", () => resolve(s));
    req.on("error", reject);
  });

const ok = (res, code, obj) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(j(obj));
};

const err = (res, e) => ok(res, 500, { error: { message: String(e?.message || e), type: "copaw_zero_token_error" } });

const sse = (res, obj) => res.write(`data: ${j(obj)}\n\n`);
const done = (res) => res.end("data: [DONE]\n\n");
const sseBindingDelta = (ln) => {
  try {
    const s = String(ln || "").trim();
    if (!s.startsWith("data:")) return "";
    const p = s.slice(5).trim();
    if (!p || p === "[DONE]") return "";
    const o = JSON.parse(p);
    if (typeof o?.text === "string" && o.text) return o.text;
    const em = o?.error?.message;
    return typeof em === "string" && em ? `[页面] ${em}` : "";
  } catch {
    return "";
  }
};

// ---- ChatGPT Web (CDP, no deps) ----
const CDP = {
  http: process.env.COPAW_CHATGPT_CDP_URL || process.env.ICLAW_CHATGPT_CDP_URL || "http://127.0.0.1:9222",
  page: process.env.COPAW_CHATGPT_PAGE_URL || process.env.ICLAW_CHATGPT_PAGE_URL || "https://chatgpt.com/",
};
const cdpNewUrl = (prefer) =>
  prefer === "doubao.com"
    ? "https://www.doubao.com/chat/"
    : prefer === "chatglm.cn"
      ? "https://chatglm.cn"
      : prefer === "chat.z.ai"
        ? "https://chat.z.ai/"
        : prefer === "gemini.google.com"
          ? "https://gemini.google.com/app"
          : CDP.page;
const cdpWs = async (prefer = "") => {
  const base = CDP.http.replace(/\/+$/, "");
  const ls = await (await fetch(`${base}/json/list`)).json();
  const rows = Array.isArray(ls) ? ls : [];
  const pick = (sub) => rows.find((x) => String(x?.url || "").includes(sub));
  const p = (prefer && pick(prefer)) || pick("chatgpt.com") || rows[0];
  if (p?.webSocketDebuggerUrl) return String(p.webSocketDebuggerUrl);
  const target = encodeURIComponent(cdpNewUrl(prefer));
  const nu = await (
    await fetch(`${base}/json/new?${target}`, { method: "PUT" })
  ).json().catch(() => null);
  if (nu?.webSocketDebuggerUrl) return String(nu.webSocketDebuggerUrl);
  throw new Error(`[cdp] 找不到可用调试页。请先 copaw zero-token onboard chrome-debug 并打开 ${cdpNewUrl(prefer) || CDP.page}`);
};
const wsConnect = (url) =>
  new Promise((resolve, reject) => {
    const WS = globalThis.WebSocket;
    if (!WS) return reject(new Error("[chatgpt-web] 当前 Node 版本无 WebSocket，请使用 Node 22+"));
    const ws = new WS(url);
    ws.addEventListener("open", () => resolve(ws), { once: true });
    ws.addEventListener("error", (e) => reject(e?.error || new Error("[chatgpt-web] ws error")), { once: true });
  });
/** 对齐 openclaw-zero-token DoubaoWebClientBrowser：调试 Chrome 页内 fetch + credentials */
const streamDoubaoCdp = async (messages, onDelta, c, k, st) => {
  const cfg = doubaoCfgFromCred(c);
  const url = `https://www.doubao.com/samantha/chat/completion?${doubaoBuildQs(cfg)}`;
  const body = doubaoBuildChatBody(c, messages, st);
  const ws = await wsConnect(await cdpWs("doubao.com"));
  let id = 0;
  const pend = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pend.set(mid, { resolve, reject });
      ws.send(j({ id: mid, method, params }));
    });
  const q = [];
  ws.addEventListener("message", (ev) => {
    let m;
    try {
      m = JSON.parse(String(ev.data || ""));
    } catch {
      return;
    }
    if (m?.id && pend.has(m.id)) {
      const p = pend.get(m.id);
      pend.delete(m.id);
      return m.error ? p.reject(new Error(m.error.message || j(m.error))) : p.resolve(m.result);
    }
    if (m?.method === "Runtime.bindingCalled" && m?.params?.name === "copawEmit")
      q.push(String(m?.params?.payload || ""));
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Runtime.addBinding", { name: "copawEmit" });
  try {
    await send("Network.enable");
    // Do not blindly override live browser session cookies.
    // If current debug profile already has doubao sessionid, keep it.
    const got = await send("Network.getCookies", { urls: ["https://www.doubao.com/chat/"] }).catch(() => null);
    const cookies = Array.isArray(got?.cookies) ? got.cookies : [];
    const hasLiveSid = cookies.some((x) => String(x?.name || "") === "sessionid" && String(x?.value || "").trim() !== "");
    if (!hasLiveSid) {
      const ck = c.cookie || (c.ttwid ? `sessionid=${c.sessionid}; ttwid=${decodeURIComponent(String(c.ttwid))}` : `sessionid=${c.sessionid}`);
      for (const pair of parseCookieKV(ck)) {
        const name = pair[0];
        const value = pair[1];
        if (!name) continue;
        try {
          await send("Network.setCookie", { name, value, domain: ".doubao.com", path: "/" });
        } catch {}
      }
    }
  } catch {}
  const expr = `(()=>{const emit=(s)=>globalThis.copawEmit(String(s||""));const url=${JSON.stringify(url)};const body=${JSON.stringify(body)};const run=async()=>{const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Accept:"text/event-stream",Referer:"https://www.doubao.com/chat/",Origin:"https://www.doubao.com","Agw-js-conv":"str"},body:JSON.stringify(body),credentials:"include"});if(!res.ok){const t=await res.text().catch(()=>"");emit("data: "+JSON.stringify({error:{message:"Doubao HTTP "+res.status+": "+t.slice(0,600)}})+"\\n\\n");emit("data: [DONE]\\n\\n");return;}const rd=res.body&&res.body.getReader();if(!rd){emit("data: "+JSON.stringify({error:{message:"Doubao: no response body"}})+"\\n\\n");emit("data: [DONE]\\n\\n");return;}const dec=new TextDecoder();for(;;){const {done,value}=await rd.read();if(done)break;emit(dec.decode(value,{stream:true}))}emit("data: [DONE]\\n\\n");};run().catch(e=>{emit("data: "+JSON.stringify({error:{message:String(e&&e.message||e)}})+"\\n\\n");emit("data: [DONE]\\n\\n");});})();`;
  await send("Runtime.evaluate", { expression: expr, awaitPromise: false, returnByValue: true });
  const parser = doubaoCreateSseParser(onDelta, st);
  let acc = "";
  const t0 = Date.now();
  try {
    while (Date.now() - t0 < 180000) {
      while (q.length) {
        const s = q.shift();
        if (!s) continue;
        acc += s;
        parser.push(s);
        if (acc.includes("[DONE]")) {
          parser.finalize();
          return;
        }
      }
      await sleep(50);
    }
    throw new Error(
      "[Doubao/CDP] 超时（180s）。请先 copaw zero-token onboard chrome-debug，在调试浏览器打开 https://www.doubao.com/chat/ 并登录；或设 COPAW_DOUBAO_USE_CDP=0 仅用 Node 请求。",
    );
  } finally {
    try {
      ws.close();
    } catch {}
    if (st.cid) doubaoConvByKey.set(k, st);
  }
};
const streamDoubao = async (messages, model, onDelta) => {
  const c = credDoubao();
  const k = doubaoSessKey(c);
  let st = doubaoConvByKey.get(k);
  if (!st) st = { cid: null };
  if (process.env.COPAW_DOUBAO_USE_CDP === "0") {
    await streamDoubaoNode(messages, model, onDelta, c, k, st);
    return;
  }
  let cdpErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await streamDoubaoCdp(messages, onDelta, c, k, st);
      return;
    } catch (e) {
      cdpErr = e;
      if (attempt === 0) await sleep(400);
    }
  }
  /** CDP 失败后：不自动 webauth/start（由控制台弹窗引导用户点击一键授权）；可选 Node 回退 */
  const allowNodeFallback = process.env.COPAW_DOUBAO_CDP_FALLBACK === "1";
  if (allowNodeFallback) {
    try {
      await streamDoubaoNode(messages, model, onDelta, c, k, st);
      return;
    } catch (e) {
      throw new Error(
        `[Doubao] CDP 与 Node 回退均失败。请在控制台聊天页点击「一键授权」后按提示在浏览器完成登录。 [COPAW_ZT_NEED_WEBAUTH:target=doubao] 首次CDP=${String(cdpErr?.message || cdpErr)} | Node=${String(e?.message || e)}`,
      );
    }
  }
  throw new Error(
    `[Doubao] CDP 失败。请在控制台聊天页点击「一键授权」后按提示在浏览器完成登录，再重试发消息。 [COPAW_ZT_NEED_WEBAUTH:target=doubao] 首次CDP=${String(cdpErr?.message || cdpErr)}。未启用 Node 回退时可设 COPAW_DOUBAO_CDP_FALLBACK=1。`,
  );
};
const streamChatGPTWeb = async (messages, model, onDelta) => {
  const ws = await wsConnect(await cdpWs("chatgpt.com"));
  let id = 0;
  const pend = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pend.set(mid, { resolve, reject });
      ws.send(j({ id: mid, method, params }));
    });
  const chunks = [];
  ws.addEventListener("message", (ev) => {
    let m;
    try {
      m = JSON.parse(String(ev.data || ""));
    } catch {
      return;
    }
    if (m?.id && pend.has(m.id)) {
      const p = pend.get(m.id);
      pend.delete(m.id);
      return m.error ? p.reject(new Error(m.error.message || j(m.error))) : p.resolve(m.result);
    }
    if (m?.method === "Runtime.bindingCalled" && m?.params?.name === "copawEmit") chunks.push(String(m?.params?.payload || ""));
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Runtime.addBinding", { name: "copawEmit" });
  let chatgptKV = null;
  try {
    const c = credChatGPT();
    const kv = parseCookieKV(c.cookie);
    const has = kv.some(([n]) => n.includes("next-auth.session-token"));
    if (has) chatgptKV = kv;
  } catch {}
  if (chatgptKV) {
    try {
      await send("Network.enable");
      for (const [name, value] of chatgptKV) {
        try {
          await send("Network.setCookie", {
            name,
            value,
            domain: "chatgpt.com",
            path: "/",
            secure: true,
            httpOnly: false,
          });
        } catch {}
      }
    } catch {}
  }
  const prompt = msgText((messages || []).at?.(-1) || {});
  const slug = model && model !== "chatgpt-web" ? model : "gpt-4";
  const expr = `(()=>{const emit=(s)=>globalThis.copawEmit(String(s||""));const clean=(t)=>String(t||"").replace(/[\\u200B-\\u200D\\uFEFF]/g,"");const domFallback=async(msg)=>{const sels=["#prompt-textarea","textarea[placeholder]","textarea",'[contenteditable="true"][data-placeholder]',"[contenteditable='true']"];let el=null;for(const s of sels){el=document.querySelector(s);if(el&&el.offsetParent!==null)break}if(!el)throw new Error("找不到输入框");el.focus();if(el.tagName==="TEXTAREA"||el.tagName==="INPUT"){el.value=msg;el.dispatchEvent(new Event("input",{bubbles:true}))}else{el.textContent=msg;el.dispatchEvent(new Event("input",{bubbles:true}))}const bs=["#composer-submit-button",'button[data-testid="send-button"]','button[aria-label*="Send"]','button[type="submit"]',"form button[type=submit]"];let b=null;for(const s of bs){b=document.querySelector(s);if(b&&!b.disabled)break}if(!b)throw new Error("找不到发送按钮");b.click();let last="",stable=0;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,2000));const els=document.querySelectorAll('div[data-message-author-role="assistant"],[data-message-author-role="assistant"]');const x=els.length?els[els.length-1]:null;const t=x?clean(x.textContent||"").trim():"";const stop=document.querySelector('[aria-label*="Stop"],button.bg-black .icon-lg');const streaming=!!stop;if(t&&t!==last){last=t;stable=0}else if(t){stable++;if(!streaming&&stable>=2)break}}if(!last)throw new Error("DOM 模拟：未检测到回复");emit("data: "+JSON.stringify({message:{id:"dom-fallback",content:{parts:[last]}}})+"\\n\\n");emit("data: [DONE]\\n\\n");};const run=async()=>{const pageUrl=location.href||"https://chatgpt.com/";const getSession=async()=>{const r=await fetch("https://chatgpt.com/api/auth/session",{credentials:"include"}).catch(()=>null);return r&&r.ok?await r.json():null};const baseH=(at,did)=>({"Content-Type":"application/json",Accept:"text/event-stream","oai-device-id":did,"oai-language":"en-US",Referer:pageUrl,...(at?{Authorization:"Bearer "+at}:{})});const warm=async(at,did)=>{const h=baseH(at,did);for(const u of ["conversation/init","sentinel/chat-requirements/prepare","sentinel/chat-requirements/finalize"]){fetch("https://chatgpt.com/backend-api/"+u,{method:"POST",headers:h,body:"{}",credentials:"include"}).catch(()=>{})}};const sess=await getSession();const at=sess?.accessToken;const did=sess?.oaiDeviceId||globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2);await warm(at,did);const body={action:"next",messages:[{id:crypto.randomUUID(),author:{role:"user"},content:{content_type:"text",parts:[${JSON.stringify(prompt)}]}}],parent_message_id:crypto.randomUUID(),model:${JSON.stringify(slug)},timezone_offset_min:new Date().getTimezoneOffset(),history_and_training_disabled:false,conversation_mode:{kind:"primary_assistant",plugin_ids:null},force_use_sse:true};const scripts=Array.from(document.scripts);const src=scripts.map(s=>s.src).find(s=>s&&s.includes("oaistatic.com")&&s.endsWith(".js"))||"https://cdn.oaistatic.com/assets/i5bamk05qmvsi6c3.js";let res=null,senErr="";try{const g=await import(src);if(typeof g?.bk==="function"&&typeof g?.fX==="function"){const z=await g.bk();const key=z?.turnstile?.bx??z?.turnstile?.dx;const r=key?await g.bi(key):null;let ark=null;try{ark=await g.bl?.getEnforcementToken?.(z)}catch{}let p=null;try{p=await g.bm?.getEnforcementToken?.(z)}catch{}const eh=await g.fX(z,ark,r,p,null);const headers={...baseH(at,did),...(typeof eh==="object"?eh:{})};res=await fetch("https://chatgpt.com/backend-api/conversation",{method:"POST",headers,body:JSON.stringify(body),credentials:"include"})}else{senErr="Sentinel asset missing bk/fX"}}catch(e){senErr=String(e?.message||e||"Sentinel import failed")}if(!res)res=await fetch("https://chatgpt.com/backend-api/conversation",{method:"POST",headers:baseH(at,did),body:JSON.stringify(body),credentials:"include"});if(!res.ok){if(res.status===403) return domFallback(${JSON.stringify(prompt)});const t=await res.text().catch(()=>\"\");throw new Error("ChatGPT API "+res.status+": "+t.slice(0,200)+(senErr?(" Sentinel: "+senErr):\"\"))}const rd=res.body?.getReader();if(!rd)throw new Error("No response body");const dec=new TextDecoder();for(;;){const {done,value}=await rd.read();if(done)break;emit(dec.decode(value,{stream:true}))}emit("");};run().catch(e=>{emit("data: "+JSON.stringify({error:{message:String(e?.message||e)}})+"\\n\\n");emit("data: [DONE]\\n\\n")});})();`;
  await send("Runtime.evaluate", { expression: expr, awaitPromise: false, returnByValue: true });
  const td = new TextDecoder("utf-8");
  let buf = "";
  let n = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    while (chunks.length) {
      const s = chunks.shift();
      if (!s) continue;
      buf += s;
      const parts = buf.split(/\r?\n/);
      buf = parts.pop() || "";
      for (const ln of parts) {
        const t = claudeDelta(claudeJsonLine(ln)) || qwenSseDelta(ln) || (() => { try { const s=String(ln||"").trim(); if(!s.startsWith("data:")) return ""; const p=s.slice(5).trim(); if(!p||p==="[DONE]") return ""; const o=JSON.parse(p); return typeof o?.text==="string"?o.text:""; } catch { return ""; } })();
        if (t) {
          n++;
          onDelta(t);
        }
      }
      if (s.includes("[DONE]")) {
        ws.close();
        if (!n) throw new Error("[chatgpt-web] 收到响应但未解析出文本：请确认已登录 chatgpt.com 且未触发验证码");
        return;
      }
    }
    await sleep(50);
  }
  ws.close();
  throw new Error("[chatgpt-web] 超时：未收到 [DONE]");
};

const streamGeminiWeb = async (messages, _model, onDelta) => {
  const c = credGemini();
  const ws = await wsConnect(await cdpWs("gemini.google.com"));
  let id = 0;
  const pend = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pend.set(mid, { resolve, reject });
      ws.send(j({ id: mid, method, params }));
    });
  const chunks = [];
  ws.addEventListener("message", (ev) => {
    let m;
    try { m = JSON.parse(String(ev.data || "")); } catch { return; }
    if (m?.id && pend.has(m.id)) {
      const p = pend.get(m.id); pend.delete(m.id);
      return m.error ? p.reject(new Error(m.error.message || j(m.error))) : p.resolve(m.result);
    }
    if (m?.method === "Runtime.bindingCalled" && m?.params?.name === "copawEmit") chunks.push(String(m?.params?.payload || ""));
  });
  await send("Runtime.enable"); await send("Page.enable"); await send("Runtime.addBinding", { name: "copawEmit" });
  const prompt = msgText((messages || []).at?.(-1) || {});
  const expr = `(()=>{const emit=(s)=>globalThis.copawEmit(String(s||""));const clean=(t)=>String(t||"").replace(/[\\u200B-\\u200D\\uFEFF]/g,"").trim();const go=async()=>{try{if(!location.href.includes("gemini.google.com")) location.href="https://gemini.google.com/app";}catch{};await new Promise(r=>setTimeout(r,1500));const setCookie=(${JSON.stringify(String(c.cookie||""))});try{if(setCookie&&setCookie.includes("=")){} }catch{};const q=(sels)=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.offsetParent!==null) return e}return null};const input=q(['[placeholder*="Gemini"]','[placeholder*="问问"]','[data-placeholder*="Gemini"]','[contenteditable="true"]','div[role="textbox"]',"textarea"]);if(!input) throw new Error("找不到输入框");input.focus();if(input.tagName==="TEXTAREA"||input.tagName==="INPUT"){input.value=${JSON.stringify(prompt)};input.dispatchEvent(new Event("input",{bubbles:true}))}else{input.innerText=${JSON.stringify(prompt)};input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}))}const sendBtn=q(['button[aria-label*="Send"]','button[aria-label*="send"]','button[aria-label*="提交"]','button[aria-label*="发送"]','button[type="submit"]','button[data-icon="send"]','button[data-testid*="send"]',"form button[type=submit]"]);if(sendBtn&&!sendBtn.disabled) sendBtn.click(); else input.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",keyCode:13,which:13,bubbles:true}));let last="",stable=0;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,2000));const stop=document.querySelector('[aria-label*="Stop"],[aria-label*="stop"]');const streaming=!!stop;const main=document.querySelector("main")||document.querySelector('[role="main"]')||document.body;const scoped=main===document.body?document:main;let text="";for(const sel of ['[data-message-author=\"model\"]','[data-sender=\"model\"]','[class*=\"assistant\"]','[class*=\"markdown\"]',"article"]){const els=scoped.querySelectorAll(sel);for(let j=els.length-1;j>=0;j--){const t=clean(els[j].textContent||\"\"); if(t.length>=40){text=t;break}} if(text) break}if(text&&text!==last){last=text;stable=0}else if(text){stable++; if(!streaming&&stable>=2) break}}if(!last) throw new Error("Gemini 未检测到回复");emit("data: "+JSON.stringify({text:last})+"\\n\\n");emit("data: [DONE]\\n\\n")}catch(e){emit("data: "+JSON.stringify({error:{message:String(e?.message||e)}})+"\\n\\n");emit("data: [DONE]\\n\\n")}};go();})();`;
  await send("Runtime.evaluate", { expression: expr, awaitPromise: false, returnByValue: true });
  let buf = "";
  let n = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 130000) {
    while (chunks.length) {
      const s = chunks.shift(); if (!s) continue;
      buf += s;
      const parts = buf.split(/\r?\n/); buf = parts.pop() || "";
      for (const ln of parts) {
        const t = (() => { try { const s=String(ln||"").trim(); if(!s.startsWith("data:")) return ""; const p=s.slice(5).trim(); if(!p||p==="[DONE]") return ""; const o=JSON.parse(p); return typeof o?.text==="string"?o.text:""; } catch { return ""; } })();
        if (t) { n++; onDelta(t); }
      }
      if (s.includes("[DONE]")) { ws.close(); if(!n) throw new Error("[gemini-web] 未解析到内容：请确认已登录 gemini.google.com"); return; }
    }
    await sleep(50);
  }
  ws.close();
  throw new Error("[gemini-web] 超时：未收到 [DONE]");
};

// ---- GLM 国内站：与 openclaw-zero-token 一致，走 HTTPS /assistant/stream（非 CDP 页面模拟）----
const GLM_SIGN_SECRET = "8a1317a7468aa3ad86e997d08f3f31cb";
const GLM_DEFAULT_ASSISTANT_ID = "65940acff94777010aa6b796";
const GLM_X_EXP_GROUPS =
  "na_android_config:exp:NA,na_4o_config:exp:4o_A,tts_config:exp:tts_config_a," +
  "na_glm4plus_config:exp:open,mainchat_server_app:exp:A,mobile_history_daycheck:exp:a," +
  "desktop_toolbar:exp:A,chat_drawing_server:exp:A,drawing_server_cogview:exp:cogview4," +
  "app_welcome_v2:exp:A,chat_drawing_streamv2:exp:A,mainchat_rm_fc:exp:add," +
  "mainchat_dr:exp:open,chat_auto_entrance:exp:A,drawing_server_hi_dream:control:A," +
  "homepage_square:exp:close,assistant_recommend_prompt:exp:3,app_home_regular_user:exp:A," +
  "memory_common:exp:enable,mainchat_moe:exp:300,assistant_greet_user:exp:greet_user," +
  "app_welcome_personalize:exp:A,assistant_model_exp_group:exp:glm4.5," +
  "ai_wallet:exp:ai_wallet_enable";

const glmParseCookie = (cookieStr) => {
  const m = Object.create(null);
  for (const x of String(cookieStr || "").split(";")) {
    const t = x.trim();
    const i = t.indexOf("=");
    if (i > 0) m[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return m;
};
const glmGenerateSign = () => {
  const e = Date.now();
  const A = e.toString();
  const t = A.length;
  const o = A.split("").map((c) => Number(c));
  const i = o.reduce((acc, v) => acc + v, 0) - o[t - 2];
  const a = i % 10;
  const timestamp = A.substring(0, t - 2) + a + A.substring(t - 1, t);
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const sign = crypto.createHash("md5").update(`${timestamp}-${nonce}-${GLM_SIGN_SECRET}`).digest("hex");
  return { timestamp, nonce, sign };
};
const glmRefreshAccessToken = async (c) => {
  const cookies = glmParseCookie(c.cookie);
  const refreshToken = cookies.chatglm_refresh_token;
  if (!refreshToken) return null;
  const sign = glmGenerateSign();
  const requestId = crypto.randomUUID().replace(/-/g, "");
  const deviceId = crypto.randomUUID().replace(/-/g, "");
  const r = await fetch("https://chatglm.cn/chatglm/user-api/user/refresh", {
    method: "POST",
    headers: clean({
      "Content-Type": "application/json",
      Cookie: c.cookie || "",
      Authorization: `Bearer ${refreshToken}`,
      "App-Name": "chatglm",
      "X-App-Platform": "pc",
      "X-App-Version": "0.0.1",
      "X-Device-Id": deviceId,
      "X-Request-Id": requestId,
      "X-Sign": sign.sign,
      "X-Nonce": sign.nonce,
      "X-Timestamp": sign.timestamp,
      "User-Agent": c.userAgent || C.ua,
    }),
    body: "{}",
  });
  const data = await r.json().catch(() => ({}));
  return data?.result?.access_token ?? data?.result?.accessToken ?? data?.accessToken ?? null;
};
const glmGetAccessToken = async (c) => {
  const cookies = glmParseCookie(c.cookie);
  if (cookies.chatglm_token) return cookies.chatglm_token;
  return glmRefreshAccessToken(c);
};

const streamGlmWeb = async (messages, _model, onDelta) => {
  const c = credGlm();
  let accessToken = await glmGetAccessToken(c);
  const deviceId = crypto.randomUUID().replace(/-/g, "");
  const prompt = msgText((messages || []).at?.(-1) || {});
  const body = {
    assistant_id: GLM_DEFAULT_ASSISTANT_ID,
    conversation_id: "",
    project_id: "",
    chat_type: "user_chat",
    meta_data: {
      cogview: { rm_label_watermark: false },
      is_test: false,
      input_question_type: "xxxx",
      channel: "",
      draft_id: "",
      chat_mode: "zero",
      is_networking: false,
      quote_log_id: "",
      platform: "pc",
    },
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  };
  const fetchTimeoutMs = Number(
    process.env.COPAW_GLM_STREAM_MS || process.env.ICLAW_GLM_STREAM_MS || 180000,
  );
  const doFetch = async (token) => {
    const sign = glmGenerateSign();
    const requestId = crypto.randomUUID().replace(/-/g, "");
    const headers = clean({
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "App-Name": "chatglm",
      Origin: "https://chatglm.cn",
      Referer: "https://chatglm.cn/",
      "X-App-Platform": "pc",
      "X-App-Version": "0.0.1",
      "X-App-fr": "default",
      "X-Device-Brand": "",
      "X-Device-Id": deviceId,
      "X-Device-Model": "",
      "X-Exp-Groups": GLM_X_EXP_GROUPS,
      "X-Lang": "zh",
      "X-Nonce": sign.nonce,
      "X-Request-Id": requestId,
      "X-Sign": sign.sign,
      "X-Timestamp": sign.timestamp,
      Cookie: c.cookie || "",
      "User-Agent": c.userAgent || C.ua,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), fetchTimeoutMs);
    try {
      return await fetch("https://chatglm.cn/chatglm/backend-api/assistant/stream", {
        method: "POST",
        headers,
        body: j(body),
        signal: ac.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };
  let r = await doFetch(accessToken);
  if (r.status === 401) {
    accessToken = await glmRefreshAccessToken(c);
    r = await doFetch(accessToken);
  }
  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(`[glm-web] HTTP ${r.status}: ${errText.slice(0, 500)}`);
  }
  const reader = r.body?.getReader();
  if (!reader) throw new Error("[glm-web] 无响应体");
  const decoder = new TextDecoder();
  let buffer = "";
  let n = 0;
  let lastFull = "";
  const processLine = (line) => {
    const s = String(line || "").trim();
    if (!s.startsWith("data:")) return;
    const dataStr = s.slice(5).trim();
    if (!dataStr || dataStr === "[DONE]") return;
    let delta = "";
    try {
      const data = JSON.parse(dataStr);
      if (data.parts && Array.isArray(data.parts)) {
        for (const part of data.parts) {
          const content = part?.content;
          if (Array.isArray(content)) {
            for (const cc of content) {
              if (cc?.type === "text" && typeof cc.text === "string") {
                delta = cc.text;
                break;
              }
            }
          }
          if (delta) break;
        }
      }
      if (!delta) {
        delta =
          (typeof data.text === "string" ? data.text : "") ||
          (typeof data.content === "string" ? data.content : "") ||
          (typeof data.delta === "string" ? data.delta : "");
      }
    } catch {
      return;
    }
    if (typeof delta !== "string" || !delta) return;
    let piece = delta;
    if (lastFull && delta.startsWith(lastFull)) piece = delta.slice(lastFull.length);
    lastFull = delta;
    if (piece) {
      n++;
      onDelta(piece);
    }
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() || "";
    for (const part of parts) processLine(part.trim());
  }
  if (buffer.trim()) processLine(buffer.trim());
  if (!n) throw new Error("[glm-web] 未解析到内容：请确认已登录 chatglm.cn 且 glm_auth.json 有效");
};

const streamGlmIntlWeb = async (messages, _model, onDelta) => {
  const c = credGlmIntl();
  const ws = await wsConnect(await cdpWs("chat.z.ai"));
  let id = 0;
  const pend = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pend.set(mid, { resolve, reject });
      ws.send(j({ id: mid, method, params }));
    });
  const chunks = [];
  ws.addEventListener("message", (ev) => {
    let m;
    try { m = JSON.parse(String(ev.data || "")); } catch { return; }
    if (m?.id && pend.has(m.id)) {
      const p = pend.get(m.id); pend.delete(m.id);
      return m.error ? p.reject(new Error(m.error.message || j(m.error))) : p.resolve(m.result);
    }
    if (m?.method === "Runtime.bindingCalled" && m?.params?.name === "copawEmit") chunks.push(String(m?.params?.payload || ""));
  });
  await send("Runtime.enable"); await send("Page.enable"); await send("Runtime.addBinding", { name: "copawEmit" });
  const prompt = msgText((messages || []).at?.(-1) || {});
  const expr = `(()=>{const emit=(s)=>globalThis.copawEmit(String(s||""));const clean=(t)=>String(t||"").replace(/[\\u200B-\\u200D\\uFEFF]/g,"").trim();const go=async()=>{try{if(!location.href.includes("chat.z.ai")) location.href="https://chat.z.ai/";}catch{};await new Promise(r=>setTimeout(r,1500));const q=(sels)=>{for(const s of sels){const e=document.querySelector(s);if(e&&e.offsetParent!==null) return e}return null};const input=q(["textarea",'[contenteditable=\"true\"]','div[role=\"textbox\"]','input[type=\"text\"]']);if(!input) throw new Error("找不到输入框");input.focus();if(input.tagName==="TEXTAREA"||input.tagName==="INPUT"){input.value=${JSON.stringify(prompt)};input.dispatchEvent(new Event("input",{bubbles:true}))}else{input.textContent=${JSON.stringify(prompt)};input.dispatchEvent(new Event("input",{bubbles:true}))}const sendBtn=q(['button.sendMessageButton','button[aria-label*=\"Send\"]','button[aria-label*=\"发送\"]','button[type=\"submit\"]',"form button[type=submit]"]);if(sendBtn&&!sendBtn.disabled) sendBtn.click(); else input.dispatchEvent(new KeyboardEvent("keydown",{key:\"Enter\",code:\"Enter\",keyCode:13,which:13,bubbles:true}));let last=\"\",stable=0;for(let i=0;i<140;i++){await new Promise(r=>setTimeout(r,900));const els=document.querySelectorAll(\".chat-assistant,[data-message-author-role=assistant],[class*='assistant']\");const el=els.length?els[els.length-1]:null;const text=clean(el?el.textContent||\"\":\"\");if(text&&text===last) stable++; else {stable=0; last=text} if(last&&stable>=3) break}if(!last) throw new Error(\"GLM Intl 未检测到回复\");emit(\"data: \"+JSON.stringify({text:last})+\"\\n\\n\");emit(\"data: [DONE]\\n\\n\")}catch(e){emit(\"data: \"+JSON.stringify({error:{message:String(e?.message||e)}})+\"\\n\\n\");emit(\"data: [DONE]\\n\\n\")}};go();})();`;
  await send("Runtime.evaluate", { expression: expr, awaitPromise: false, returnByValue: true });
  let buf = ""; let n = 0; const t0 = Date.now();
  while (Date.now() - t0 < 140000) {
    while (chunks.length) {
      const s = chunks.shift(); if(!s) continue;
      buf += s;
      const parts = buf.split(/\r?\n/); buf = parts.pop() || "";
      for (const ln of parts) {
        const t = sseBindingDelta(ln);
        if (t) { n++; onDelta(t); }
      }
      if (s.includes("[DONE]")) { ws.close(); if(!n) throw new Error("[glm-intl-web] 未解析到内容：请确认已登录 chat.z.ai"); return; }
    }
    await sleep(50);
  }
  ws.close();
  throw new Error("[glm-intl-web] 超时：未收到 [DONE]");
};

const streamDeepSeek = async (messages, model, onDelta) => {
  const c = cred();
  const sid = await createSession(c);
  const ch = await createPow(c, C.api.completion);
  const ans = await solvePow(ch);
  const pow = b64(j({ ...ch, answer: ans, target_path: C.api.completion }));
  const body = {
    chat_session_id: sid,
    parent_message_id: null,
    prompt: msgText(messages?.at?.(-1) || {}),
    ref_file_ids: [],
    thinking_enabled: thinkingEnabled(model || "deepseek-chat"),
    search_enabled: true,
    preempt: false,
  };
  const url = `${C.base}${C.api.completion}`;
  const r = await fetch(url, { method: "POST", headers: clean({ ...h(c), "x-ds-pow-response": pow }), body: j(body) });
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${r.statusText}: ${(await r.text()).slice(0, 800)}`);
  const td = new TextDecoder("utf-8");
  let buf = "";
  for await (const chunk of r.body) {
    buf += td.decode(chunk, { stream: true });
    const parts = buf.split(/\r?\n/);
    buf = parts.pop() || "";
    for (const ln of parts) {
      if (!ln.startsWith("data: ")) continue;
      const p = ln.slice(6).trim();
      if (!p || p === "[DONE]") continue;
      try {
        const o = JSON.parse(p);
        const v = o && typeof o === "object" && typeof o.v === "string" ? o.v : "";
        if (v) onDelta(v);
      } catch {}
    }
  }
  if (buf) {
    for (const ln of buf.split(/\r?\n/)) {
      if (!ln.startsWith("data: ")) continue;
      const p = ln.slice(6).trim();
      if (!p || p === "[DONE]") continue;
      try {
        const o = JSON.parse(p);
        const v = o && typeof o === "object" && typeof o.v === "string" ? o.v : "";
        if (v) onDelta(v);
      } catch {}
    }
  }
};

const WEB_ONLY = new Set(MODELS.map((x) => x.id));

/** 网关 model id → CoPaw `zero_token` 通道名（与 `/api/zero-token/<target>/webauth/start` 一致） */
const webauthTargetForModel = (m) => {
  switch (m) {
    case "doubao-web":
      return "doubao";
    case "claude-web":
      return "claude";
    case "qwen-web":
      return "qwen";
    case "qwen-cn-web":
      return "qwen-cn";
    case "kimi-web":
      return "kimi";
    case "chatgpt-web":
      return "chatgpt";
    case "gemini-web":
      return "gemini";
    case "glm-web":
      return "glm";
    case "glm-intl-web":
      return "glm-intl";
    case "deepseek-chat":
      return "deepseek";
    default:
      return null;
  }
};

/** 疑似 CDP / 调试连接瞬时失败：可重试一次完整上游再决定是否弹一键授权说明 */
const _isLikelyCdpTransientError = (msg) => {
  const s = String(msg || "");
  if (s.includes("[COPAW_ZT_NEED_WEBAUTH:target=")) return false;
  return (
    /\[cdp\]/i.test(s) ||
    /\/CDP[】\]\)]|CDP[）\s]/i.test(s) ||
    /找不到可用调试页/.test(s) ||
    /9222/.test(s) ||
    /WebSocket|ws error/i.test(s) ||
    /ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(s) ||
    /chrome-debug|调试页|调试浏览器/i.test(s)
  );
};

/**
 * 上游（CDP/直连）失败：不自动调用 webauth/start，由控制台弹窗引导用户点击一键授权。
 * 错误正文附带 `[COPAW_ZT_NEED_WEBAUTH:target=...]` 供前端检测。
 * 对疑似 CDP/连接类错误会先重试一次完整上游，再附加 NEED_WEBAUTH。
 */
const withWebauthOnUpstreamFailure = async (model, run) => {
  const runOnce = () => run();
  try {
    return await runOnce();
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("[COPAW_ZT_NEED_WEBAUTH:target=")) throw e;
    const target = webauthTargetForModel(model);
    if (!target) throw e;
    if (_isLikelyCdpTransientError(msg)) {
      try {
        await sleep(400);
        return await runOnce();
      } catch (e2) {
        const msg2 = String(e2?.message || e2);
        if (msg2.includes("[COPAW_ZT_NEED_WEBAUTH:target=")) throw e2;
        throw new Error(`${msg2} [COPAW_ZT_NEED_WEBAUTH:target=${target}]`);
      }
    }
    throw new Error(`${msg} [COPAW_ZT_NEED_WEBAUTH:target=${target}]`);
  }
};

// Align with openclaw-zero-token openresponses applyToolChoice semantics:
// - tool_choice="none" => hide tools
// - tool_choice="required" => require a tool call (only if tools exist)
// - tool_choice={type:"function",function:{name}} => restrict tool list + require
const _resolveToolChoice = (toolChoice, tools) => {
  const allTools = Array.isArray(tools) ? tools : [];
  if (!toolChoice) return { tools: allTools, requireTool: false, extraPrompt: "" };

  if (toolChoice === "none") {
    return { tools: [], requireTool: false, extraPrompt: "" };
  }

  if (toolChoice === "required") {
    if (allTools.length === 0) throw new Error("tool_choice=required but no tools were provided");
    return { tools: allTools, requireTool: true, extraPrompt: "You must call one of the available tools before responding." };
  }

  if (toolChoice && typeof toolChoice === "object" && toolChoice.type === "function") {
    const target = toolChoice.function && typeof toolChoice.function.name === "string" ? toolChoice.function.name.trim() : "";
    if (!target) throw new Error("tool_choice.function.name is required");
    const matched = allTools.filter((t) => t && t.type === "function" && t.function && String(t.function.name || "") === target);
    if (matched.length === 0) throw new Error(`tool_choice requested unknown tool: ${target}`);
    return { tools: matched, requireTool: true, extraPrompt: `You must call the ${target} tool before responding.` };
  }

  return { tools: allTools, requireTool: false, extraPrompt: "" };
};

/** Prefer examples matching tool_choice.function.name, else single-tool list. */
const _forcedExampleToolFromRequest = (toolChoice, tools) => {
  if (toolChoice && typeof toolChoice === "object" && toolChoice.type === "function" && toolChoice.function?.name) {
    return String(toolChoice.function.name).trim();
  }
  if (Array.isArray(tools) && tools.length === 1) {
    const n = tools[0]?.function?.name;
    return n ? String(n).trim() : "";
  }
  return "";
};

const chatCompletions = async (req, res) => {
  const b = JSON.parse((await readBody(req)) || "{}");
  const id = `chatcmpl_${Date.now().toString(36)}`;
  const model = b.model || "deepseek-chat";
  const isDoubao = model === "doubao-web";
  const isClaude = model === "claude-web";
  const isQwen = model === "qwen-web";
  const isQwenCn = model === "qwen-cn-web";
  const isKimi = model === "kimi-web";
  const isDeepSeek = model === "deepseek-chat";
  const isChatGPT = model === "chatgpt-web";
  const isGemini = model === "gemini-web";
  const isGlm = model === "glm-web";
  const isGlmIntl = model === "glm-intl-web";
  const supported = WEB_ONLY.has(model);
  if (!supported) return err(res, new Error(`model '${model}' 暂不支持 (仅 Web 通道: ${[...WEB_ONLY].join(", ")})`));

  // IMPORTANT: many web backends only use the last message; pass a merged prompt
  // so system prompt + history are not dropped.
  // Align openclaw semantics: tools can be present every turn, but a tool call
  // is only REQUIRED when the client explicitly asks via tool_choice.
  let resolved = { tools: Array.isArray(b.tools) ? b.tools : [], requireTool: false, extraPrompt: "" };
  try {
    resolved = _resolveToolChoice(b.tool_choice, b.tools);
  } catch (e) {
    return err(res, e);
  }
  const forcedExampleTool = _forcedExampleToolFromRequest(b.tool_choice, resolved.tools);
  const merged = mergeOpenAIMessages(b.messages || [], resolved.tools, {
    requireTool: resolved.requireTool,
    extraSystemPrompt: resolved.extraPrompt,
    forcedExampleTool: forcedExampleTool || undefined,
  });
  const upstreamMessages = [{ role: "user", content: merged }];
  if (Z.streamDbg) {
    const toolsCount = Array.isArray(resolved.tools) ? resolved.tools.length : 0;
    const sysCount = Array.isArray(b.messages)
      ? b.messages.filter((m) => String(m?.role || "") === "system").length
      : 0;
    const toolRoleCount = Array.isArray(b.messages)
      ? b.messages.filter((m) => String(m?.role || "") === "tool").length
      : 0;
    const mergedStr = String(merged || "");
    const headPreview = mergedStr.slice(0, 800).replace(/\r?\n/g, "\\n");
    const tailPreview = mergedStr.slice(Math.max(0, mergedStr.length - 800)).replace(/\r?\n/g, "\\n");
    const hasToolInstr = mergedStr.includes("## Tool Use Instructions");
    console.log(
      `[zero-token dbg] model=${model} tools=${toolsCount} system_msgs=${sysCount} tool_msgs=${toolRoleCount} merged_len=${mergedStr.length} has_tool_instructions=${hasToolInstr} head=${headPreview} tail=${tailPreview}`,
    );
  }

  if (b.stream) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    sse(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: { role: "assistant", content: "" }, finish_reason: null }] });
    try {
      let outDbg = "";
      let outAll = "";
      const run = isChatGPT
        ? streamChatGPTWeb
        : isGemini
          ? streamGeminiWeb
          : isGlm
            ? streamGlmWeb
            : isGlmIntl
              ? streamGlmIntlWeb
              : isDoubao
                ? streamDoubao
                : isClaude
                  ? streamClaude
                  : isQwen
                    ? streamQwen
                    : isQwenCn
                      ? streamQwenCn
                      : isKimi
                        ? streamKimi
                        : streamDeepSeek;
      // Deterministic tool calling: collect full text first, then emit either a
      // structured tool_calls chunk or a single content chunk. This avoids
      // streaming partial/malformed tool_call text that breaks the loop.
      const runOnce = async (msgs) => {
        outAll = "";
        outDbg = "";
        await withWebauthOnUpstreamFailure(model, async () => {
          await run(msgs, model, (t) => {
            if (t) {
              outAll += t;
              if (Z.streamDbg && outDbg.length < 2000) outDbg += t;
            }
          });
        });
      };

      await runOnce(upstreamMessages);
      let parsed = _extractToolCallsStrict(outAll);
      const noToolParsed = !parsed.ok || parsed.toolCalls.length === 0;
      if (noToolParsed && resolved.requireTool) {
        await runOnce([...upstreamMessages, { role: "user", content: _STRICT_TOOL_RETRY_USER }]);
        parsed = _extractToolCallsStrict(outAll);
      }
      if (Z.streamDbg) {
        const hasToolCallTag = outDbg.includes("<tool_call");
        const peek = outDbg.slice(0, 400).replace(/\r?\n/g, "\\n");
        console.log(`[zero-token dbg] model=${model} has_tool_call_tag=${hasToolCallTag} out_peek=${peek}`);
      }
      if (parsed.ok && parsed.toolCalls.length > 0) {
        const base = `call_${Date.now().toString(36)}`;
        sse(res, {
          id,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [
            {
              index: 0,
              delta: {
                tool_calls: parsed.toolCalls.map((tc, i) => ({
                  index: i,
                  id: `${base}_${i}`,
                  type: "function",
                  function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
                })),
              },
              finish_reason: null,
            },
          ],
        });
        sse(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "tool_calls" }] });
      } else {
        if (resolved.requireTool) {
          sse(res, {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [
              {
                index: 0,
                delta: { content: "[zero-token error] expected strict <tool_call>{...}</tool_call> output but got non-tool text." },
                finish_reason: null,
              },
            ],
          });
          sse(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
          done(res);
          return;
        }
        // Normal assistant text.
        sse(res, {
          id,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [{ index: 0, delta: { content: outAll }, finish_reason: null }],
        });
        sse(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
      }
      done(res);
    } catch (e) {
      sse(res, { id, object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, delta: { content: `\n[zero-token error] ${String(e?.message || e)}` }, finish_reason: "stop" }] });
      done(res);
    }
    return;
  }
  const collect = (streamFn, msgs) => (async () => { let out = ""; await streamFn(msgs, model, (t) => (out += t)); return out; })();
  const runTextOnce = async (msgs) =>
    withWebauthOnUpstreamFailure(model, async () =>
      isChatGPT
        ? await collect(streamChatGPTWeb, msgs)
        : isGemini
          ? await collect(streamGeminiWeb, msgs)
          : isGlm
            ? await collect(streamGlmWeb, msgs)
            : isGlmIntl
              ? await collect(streamGlmIntlWeb, msgs)
              : isDoubao
                ? await collect(streamDoubao, msgs)
                : isClaude
                  ? await collect(streamClaude, msgs)
                  : isQwen
                    ? await collect(streamQwen, msgs)
                    : isQwenCn
                      ? await collect(streamQwenCn, msgs)
                      : isKimi
                        ? await collect(streamKimi, msgs)
                        : await deepseekCompletion(msgs, model),
    );

  let text = await runTextOnce(upstreamMessages);
  let parsed = _extractToolCallsStrict(text);
  const noToolParsedNs = !parsed.ok || parsed.toolCalls.length === 0;
  if (noToolParsedNs && resolved.requireTool) {
    text = await runTextOnce([...upstreamMessages, { role: "user", content: _STRICT_TOOL_RETRY_USER }]);
    parsed = _extractToolCallsStrict(text);
  }
  if (parsed.ok && parsed.toolCalls.length > 0) {
    const base = `call_${Date.now().toString(36)}`;
    ok(res, 200, {
      id,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "",
            tool_calls: parsed.toolCalls.map((tc, i) => ({
              id: `${base}_${i}`,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
            })),
          },
          finish_reason: "tool_calls",
        },
      ],
    });
  } else {
    if (requireTool) {
      ok(res, 200, {
        id,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "[zero-token error] expected strict <tool_call>{...}</tool_call> output but got non-tool text." },
            finish_reason: "stop",
          },
        ],
      });
      return;
    }
    ok(res, 200, { id, object: "chat.completion", created: Math.floor(Date.now() / 1000), model, choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }] });
  }
};

http
  .createServer((req, res) => {
    const u = new URL(req.url || "/", `http://${req.headers.host || `${C.host}:${C.port}`}`);
    if (req.method === "GET" && u.pathname === `${C.openai.apiPrefix}/models`) {
      return ok(res, 200, { object: "list", data: MODELS.map((m) => ({ id: m.id, object: "model", created: 0, owned_by: m.owned_by })) });
    }
    if (req.method === "POST" && u.pathname === C.openai.chatCompletions) return chatCompletions(req, res).catch((e) => err(res, e));
    ok(res, 404, { error: { message: "not found" } });
  })
  .listen(C.port, C.host, () => process.stdout.write(`copaw-zero-token listening on http://${C.host}:${C.port}\n`));

