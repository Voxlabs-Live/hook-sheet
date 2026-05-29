/**
 * Runtime validation + deterministic post-processing for Hook Sheet output.
 *
 * Why this exists: the eval suite (vibe-kit-eval) proved the prompt produces
 * valid output on a single run, but a B2B-client consistency probe showed two
 * fields drifting on real input across repeated runs:
 *   - `pattern_distribution` (LLM-tallied) disagreed with the classification
 *     chips in 2 of 3 runs — the model miscounts.
 *   - `blind_spots` named a pattern the client was actually using in 2 of 3
 *     runs (once it flagged the client's MOST-used pattern).
 *
 * Fix doctrine (mirrors the Brand Voice Checker overhaul): the LLM does
 * judgment (classification, niche-fit), the code does arithmetic and
 * enforcement. `pattern_distribution` is no longer requested from the model —
 * it's computed here from `ranked`. `blind_spots` is validated to be disjoint
 * from the used set, with a deterministic safety net.
 *
 * The PTCA vocabulary is duplicated from the system prompt (and from
 * vibe-kit-eval/check.ts) on purpose — the three live in different repos. If
 * the 26-enum canon changes, update all three.
 */
import type { HookResult, RankedHook, PatternCount } from "./hook-types";

export const PTCA_HOOK_PATTERNS: ReadonlySet<string> = new Set([
  "curiosity_gap",
  "shock_open",
  "pov_immersion",
  "question_hook",
  "number_promise",
  "controversial_claim",
  "unusual_action",
  "relatability",
  "before_after",
  "cliffhanger_wait_for_it",
  "authority_credential",
  "transformation_process",
  "trend_format",
  "direct_address_you",
  "negative_framing",
  "scare_tactic",
  "cuteness",
  "physical_fail",
  "asmr_sensory",
  "visual_spectacle",
  "status_flex",
  "mystery_object",
  "rapid_cut_montage",
  "voiceover_narration",
  "text_only_hook",
  "silent_visual",
]);

/** Every pattern the client is actually using (primary + secondary across all ranked hooks). */
export function patternsUsed(ranked: RankedHook[]): Set<string> {
  const used = new Set<string>();
  for (const r of ranked ?? []) {
    if (typeof r?.primary_pattern === "string") used.add(r.primary_pattern);
    for (const sp of r?.secondary_patterns ?? []) {
      if (typeof sp === "string") used.add(sp);
    }
  }
  return used;
}

/**
 * Authoritative pattern distribution — tally primary + secondary across ranked,
 * sorted by count desc. Replaces the LLM-produced field so the bars can never
 * contradict the chips above them.
 */
export function computeDistribution(ranked: RankedHook[]): PatternCount[] {
  const tally = new Map<string, number>();
  for (const r of ranked ?? []) {
    if (typeof r?.primary_pattern === "string") {
      tally.set(r.primary_pattern, (tally.get(r.primary_pattern) ?? 0) + 1);
    }
    for (const sp of r?.secondary_patterns ?? []) {
      if (typeof sp === "string") tally.set(sp, (tally.get(sp) ?? 0) + 1);
    }
  }
  return [...tally.entries()]
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern));
}

/** PTCA patterns the client is NOT using — the legal candidate pool for blind spots. */
export function unusedPatterns(ranked: RankedHook[]): string[] {
  const used = patternsUsed(ranked);
  return [...PTCA_HOOK_PATTERNS].filter((p) => !used.has(p));
}

/**
 * Deterministic safety net: keep only proposed blind spots that are valid PTCA
 * patterns AND genuinely unused, deduped, capped at 4. Backfill to a minimum of
 * 2 from the unused pool if the model's surviving picks fall short (rare — the
 * repair pass usually fixes this first).
 */
export function reconcileBlindSpots(proposed: unknown, ranked: RankedHook[]): string[] {
  const used = patternsUsed(ranked);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of Array.isArray(proposed) ? proposed : []) {
    if (typeof b === "string" && PTCA_HOOK_PATTERNS.has(b) && !used.has(b) && !seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  if (out.length < 2) {
    for (const p of unusedPatterns(ranked)) {
      if (out.length >= 2) break;
      if (!seen.has(p)) {
        seen.add(p);
        out.push(p);
      }
    }
  }
  return out.slice(0, 4);
}

export interface Violation {
  code: string;
  /** Phrased as a correction instruction — fed verbatim into the repair pass. */
  message: string;
}

/**
 * Validate the MODEL's output (before deterministic post-processing). Returns
 * the list of violations to feed into a single corrective re-prompt. Note:
 * `pattern_distribution` is intentionally NOT validated — the model no longer
 * produces it.
 */
export function validateHookModelOutput(
  data: Partial<HookResult>,
  inputHooks: string,
): Violation[] {
  const v: Violation[] = [];

  // ── ranked ──
  if (!Array.isArray(data.ranked) || data.ranked.length === 0) {
    v.push({ code: "ranked", message: "`ranked` must be a non-empty array, one entry per input hook." });
  } else {
    const shapeOk = data.ranked.every(
      (r) =>
        typeof r?.hook === "string" &&
        typeof r?.rank === "number" &&
        typeof r?.primary_pattern === "string" &&
        Array.isArray(r?.secondary_patterns) &&
        typeof r?.why_it_works === "string",
    );
    if (!shapeOk) {
      v.push({ code: "ranked_shape", message: "Each `ranked` entry needs hook, rank, primary_pattern, secondary_patterns[] and why_it_works." });
    }

    const bad = new Set<string>();
    for (const r of data.ranked) {
      if (typeof r?.primary_pattern === "string" && !PTCA_HOOK_PATTERNS.has(r.primary_pattern)) bad.add(r.primary_pattern);
      for (const sp of r?.secondary_patterns ?? []) {
        if (typeof sp === "string" && !PTCA_HOOK_PATTERNS.has(sp)) bad.add(sp);
      }
    }
    if (bad.size) {
      v.push({ code: "ranked_enum", message: `These patterns are not in the 26-enum taxonomy — use only valid enums: ${[...bad].join(", ")}.` });
    }

    const inputClean = inputHooks.replace(/\[[^\]]*\]/g, "").toLowerCase();
    const nonsub = data.ranked
      .filter((r) => typeof r?.hook === "string" && !inputClean.includes(r.hook.toLowerCase()))
      .map((r) => r.hook as string);
    if (nonsub.length) {
      v.push({ code: "ranked_substring", message: `These ranked hooks are not copied verbatim from the input — use the exact input text: ${nonsub.map((h) => `"${h.slice(0, 40)}…"`).join(", ")}.` });
    }
  }

  // ── blind_spots (must be disjoint from used patterns) ──
  const ranked = Array.isArray(data.ranked) ? (data.ranked as RankedHook[]) : [];
  if (!Array.isArray(data.blind_spots)) {
    v.push({ code: "blind_spots", message: "`blind_spots` must be an array of 2-4 patterns the client is NOT using." });
  } else {
    const used = patternsUsed(ranked);
    const badEnum = data.blind_spots.filter((b) => typeof b !== "string" || !PTCA_HOOK_PATTERNS.has(b as string));
    const contradict = data.blind_spots.filter((b) => typeof b === "string" && used.has(b));
    const valid = data.blind_spots.filter((b) => typeof b === "string" && PTCA_HOOK_PATTERNS.has(b) && !used.has(b));
    const allowed = unusedPatterns(ranked);
    if (badEnum.length) {
      v.push({ code: "blind_enum", message: `blind_spots contains invalid patterns: ${badEnum.join(", ")}. Choose 2-4 ONLY from: ${allowed.join(", ")}.` });
    }
    if (contradict.length) {
      v.push({ code: "blind_contradict", message: `blind_spots must be patterns that do NOT appear in your ranked classifications. Remove ${contradict.join(", ")} and choose 2-4 ONLY from: ${allowed.join(", ")}.` });
    }
    if (!badEnum.length && !contradict.length && (valid.length < 2 || valid.length > 4)) {
      v.push({ code: "blind_count", message: `Provide 2-4 blind_spots. Choose ONLY from: ${allowed.join(", ")}.` });
    }
  }

  // ── new_hooks (exactly 20) ──
  if (!Array.isArray(data.new_hooks)) {
    v.push({ code: "new_hooks", message: "`new_hooks` must be an array of exactly 20 entries." });
  } else {
    if (data.new_hooks.length !== 20) {
      v.push({ code: "new_hooks_count", message: `Return EXACTLY 20 new_hooks — you returned ${data.new_hooks.length}.` });
    }
    const shapeOk = data.new_hooks.every(
      (h) => typeof h?.hook === "string" && typeof h?.pattern === "string" && typeof h?.why === "string",
    );
    if (!shapeOk) {
      v.push({ code: "new_hooks_shape", message: "Each new hook needs hook, pattern and why." });
    }
    const bad = new Set<string>();
    for (const h of data.new_hooks) {
      if (typeof h?.pattern === "string" && !PTCA_HOOK_PATTERNS.has(h.pattern)) bad.add(h.pattern);
    }
    if (bad.size) {
      v.push({ code: "new_hooks_enum", message: `new_hooks use patterns not in the taxonomy: ${[...bad].join(", ")}.` });
    }
  }

  return v;
}
