import type { APIRoute } from "astro";
import { callCached, parseJson } from "../../lib/anthropic";
import { readDemo, consumeDemo } from "../../lib/rate-limit";
import { HOOK_SHEET_SYSTEM_PROMPT } from "../../prompts/system";
import type { HookResult } from "../../lib/hook-types";
import type { ApiResponse } from "../../lib/types";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Step 1 — rate limit
  const usage = await readDemo(request);
  if (usage.exceeded) {
    return json<HookResult>({
      ok: false,
      error: "rate_limit_exceeded",
      message: "Demo limit reached. Fork the repo to keep using.",
    });
  }

  // Step 2 — validate input
  let body: { clientNiche?: string; topHooks?: string };
  try {
    body = await request.json();
  } catch {
    return json<HookResult>({
      ok: false,
      error: "invalid_input",
      message: "Body must be JSON with `clientNiche` and `topHooks` fields.",
    });
  }
  const clientNiche = (body.clientNiche ?? "").trim();
  const topHooks = (body.topHooks ?? "").trim();
  if (!clientNiche || !topHooks) {
    return json<HookResult>({
      ok: false,
      error: "invalid_input",
      message: "Provide both the client niche and 5–10 top hooks (one per line).",
    });
  }
  const hookCount = topHooks.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
  if (hookCount < 3) {
    return json<HookResult>({
      ok: false,
      error: "invalid_input",
      message: "Paste at least 3 hooks (one per line). 5–10 gives the sharpest output.",
    });
  }
  if (clientNiche.length > 800 || topHooks.length > 6000) {
    return json<HookResult>({
      ok: false,
      error: "invalid_input",
      message: "Inputs too long. Niche ≤800 chars, hooks ≤6k chars.",
    });
  }

  // Step 3 — call Claude
  const userInput = `CLIENT NICHE:\n${clientNiche}\n\n---\n\nTOP HOOKS (one per line, optionally with [view counts] in brackets):\n${topHooks}`;
  let raw: string;
  try {
    const result = await callCached({
      systemPrompt: HOOK_SHEET_SYSTEM_PROMPT,
      userInput,
      maxTokens: 4500,
    });
    raw = result.text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.includes("ANTHROPIC_API_KEY")
      ? "missing_api_key"
      : "anthropic_error";
    return json<HookResult>({ ok: false, error: code, message: msg });
  }

  // Step 4 — parse JSON
  let data: HookResult;
  try {
    data = parseJson<HookResult>(raw);
  } catch {
    return json<HookResult>({
      ok: false,
      error: "parse_error",
      message: "Claude returned non-JSON. Try again.",
    });
  }

  // Step 5 — consume one demo credit
  await consumeDemo(request);
  const remaining =
    usage.remaining === Infinity ? -1 : Math.max(0, usage.remaining - 1);

  return json<HookResult>({ ok: true, data, remaining });
};

function json<T>(payload: ApiResponse<T>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
