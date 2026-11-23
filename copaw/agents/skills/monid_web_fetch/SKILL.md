---
name: monid_web_fetch
description: "When the user explicitly asks to fetch a public web page through Monid, read the page and summarize it with its source URL."
---

# Fetch a Web Page with Monid

Monid is an API for accessing data from multiple providers with one API key.

## How to Use

1. Import this skill into the skill pool and enable it for your agent.
2. Set `MONID_API_KEY` in the environment that runs iClaw.
3. Ask the agent “Fetch and summarize https://example.com/ through Monid.”
   Use the public URL from the user's request. Save the snippet as
   `monid_web_fetch.py` and run it with `execute_shell_command`, passing the
   URL as one shell-quoted argument. For the example above, run
   `python monid_web_fetch.py "https://example.com/"`.
4. Summarize the returned page and include its source URL. If the command
   reports an error, relay it to the user.

```python
import json
import os
import sys
import time

import httpx

MONID_API = "https://api.monid.ai"
TOKEN_BUDGET = 10_000

key = os.getenv("MONID_API_KEY")
if not key:
    sys.exit("Set MONID_API_KEY to fetch pages through Monid.")
if len(sys.argv) != 2:
    sys.exit("Usage: python monid_web_fetch.py PUBLIC_URL")

headers = {"Authorization": f"Bearer {key}"}
payload = {
    "provider": "litescrape",
    "endpoint": "/web/fetch",
    "input": {"body": {"url": sys.argv[1], "respond_with": "markdown", "token_budget": TOKEN_BUDGET}},
}

try:
    response = httpx.post(
        f"{MONID_API}/v1/run",
        headers={**headers, "Content-Type": "application/json; charset=utf-8"},
        content=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        timeout=60,
    )
    response.raise_for_status()
    run = response.json()
    if response.status_code == 202:
        run_id = run["runId"]
        deadline = time.monotonic() + 60
        while (remaining := deadline - time.monotonic()) > 2:
            time.sleep(2)
            response = httpx.get(
                f"{MONID_API}/v1/runs/{run_id}", headers=headers, timeout=remaining - 2
            )
            response.raise_for_status()
            run = response.json()
            if run.get("status") in ("COMPLETED", "FAILED", "TIMED_OUT", "STOPPED", "BLOCKED"):
                break
        if run.get("status") != "COMPLETED":
            sys.exit(f"Monid run did not complete: {run.get('status', 'polling timed out')}")
except httpx.HTTPStatusError as exc:
    sys.exit(f"Monid HTTP {exc.response.status_code}: {exc.response.text}")
except httpx.RequestError as exc:
    sys.exit(f"Monid request failed: {exc}")

provider_response = run.get("providerResponse") or {}
if provider_response.get("httpStatus", 200) >= 400:
    sys.exit(f"Litescrape HTTP {provider_response['httpStatus']}: {provider_response.get('error')}")
print(json.dumps(run["output"], ensure_ascii=False))
```

[Monid documentation](https://docs.monid.ai)
