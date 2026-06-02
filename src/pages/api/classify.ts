import type { APIRoute } from "astro";
import { callCached, repair, parseJson } from "../../lib/anthropic";
import { readDemo, consumeDemo } from "../../lib/rate-limit";
import { HOOK_SHEET_SYSTEM_PROMPT } from "../../prompts/system";
import type { HookResult } from "../../lib/hook-types";
import type { ApiResponse } from "../../lib/types";
import {
  validateHookModelOutput,
  computeDistribution,
  reconcileBlindSpots,
} from "../../lib/validate";

export const prerender = false;

const MAX_TOKENS = 4500;

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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json<HookResult>({
      ok: false,
      error: "invalid_input",
      message: "Body must be JSON with `clientNiche` and `topHooks` fields.",
    });
  }
  // Guard against non-object bodies (null, number, array, string) and
  // wrong-typed fields (e.g. a number where a string is expected) — coercing
  // a non-string with .trim() would otherwise throw a 500.
  const fields = (body && typeof body === "object" ? body : {}) as {
    clientNiche?: unknown;
    topHooks?: unknown;
  };
  const clientNiche = typeof fields.clientNiche === "string" ? fields.clientNiche.trim() : "";
  const topHooks = typeof fields.topHooks === "string" ? fields.topHooks.trim() : "";
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
  let stopReason: string | null;
  try {
    const result = await callCached({
      systemPrompt: HOOK_SHEET_SYSTEM_PROMPT,
      userInput,
      maxTokens: MAX_TOKENS,
    });
    raw = result.text;
    stopReason = result.stopReason;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.includes("ANTHROPIC_API_KEY")
      ? "missing_api_key"
      : "anthropic_error";
    return json<HookResult>({ ok: false, error: code, message: msg });
  }

  if (stopReason === "max_tokens") {
    return json<HookResult>({
      ok: false,
      error: "truncated",
      message: "That input produced a response too long to finish. Trim to 5–10 hooks and try again.",
    });
  }

  // Step 4 — parse + validate; one corrective re-prompt if the model drifted
  let data = tryParse(raw);
  let violations = data
    ? validateHookModelOutput(data, topHooks)
    : [{ code: "json", message: "Return valid strict JSON only, matching the schema exactly." }];

  if (violations.length > 0) {
    try {
      const fixed = await repair({
        systemPrompt: HOOK_SHEET_SYSTEM_PROMPT,
        userInput,
        priorRaw: raw,
        violations: violations.map((v) => v.message),
        maxTokens: MAX_TOKENS,
      });
      if (fixed.stopReason !== "max_tokens") {
        const repaired = tryParse(fixed.text);
        if (repaired && Array.isArray(repaired.ranked) && Array.isArray(repaired.new_hooks)) {
          const v2 = validateHookModelOutput(repaired, topHooks);
          // Accept the repair only if it didn't make things worse.
          if (v2.length <= violations.length) {
            data = repaired;
            violations = v2;
          }
        }
      }
    } catch {
      // Swallow — deterministic post-processing below still salvages a usable result.
    }
  }

  // Step 5 — the model-judgment fields are required; everything else we fix deterministically
  if (
    !data ||
    !Array.isArray(data.ranked) ||
    data.ranked.length === 0 ||
    !Array.isArray(data.new_hooks) ||
    data.new_hooks.length === 0
  ) {
    return json<HookResult>({
      ok: false,
      error: "incomplete_output",
      message: "The tool returned an incomplete result. Please try again.",
    });
  }

  // Step 6 — deterministic post-processing (authoritative — the model can't drift these)
  data.pattern_distribution = computeDistribution(data.ranked);
  data.blind_spots = reconcileBlindSpots(data.blind_spots, data.ranked);
  if (data.new_hooks.length > 20) data.new_hooks = data.new_hooks.slice(0, 20);

  // Step 7 — consume one demo credit
  await consumeDemo(request);
  const remaining =
    usage.remaining === Infinity ? -1 : Math.max(0, usage.remaining - 1);

  return json<HookResult>({ ok: true, data, remaining });
};

function tryParse(raw: string): HookResult | null {
  try {
    return parseJson<HookResult>(raw);
  } catch {
    return null;
  }
}

function json<T>(payload: ApiResponse<T>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
