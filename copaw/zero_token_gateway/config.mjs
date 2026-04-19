import os from "node:os";
import path from "node:path";

const e = (a, b) => process.env[a] || process.env[b];
export const C = {
  host: e("COPAW_ZERO_TOKEN_HOST", "ICLAW_ZERO_TOKEN_HOST") || "127.0.0.1",
  port: Number(e("COPAW_ZERO_TOKEN_PORT", "ICLAW_ZERO_TOKEN_PORT") || 3002),
  base: "https://chat.deepseek.com",
  ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  stateDir: e("COPAW_ZERO_TOKEN_STATE_DIR", "ICLAW_ZERO_TOKEN_STATE_DIR") || ".copaw-zero-state",
  authFile: e("COPAW_ZERO_TOKEN_AUTH_FILE", "ICLAW_ZERO_TOKEN_AUTH_FILE") || "deepseek_auth.json",
  api: {
    sessionCreate: "/api/v0/chat_session/create",
    powCreate: "/api/v0/chat/create_pow_challenge",
    completion: "/api/v0/chat/completion",
  },
  openai: { apiPrefix: "/v1", chatCompletions: "/v1/chat/completions" },
};

export const authPath = () => path.join(os.homedir(), C.stateDir, C.authFile);

export const Z = { streamDbg: e("COPAW_ZERO_TOKEN_STREAM_DEBUG", "ICLAW_ZERO_TOKEN_STREAM_DEBUG") === "1" };

