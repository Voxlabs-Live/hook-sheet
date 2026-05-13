/**
 * Output schema for the Hook Sheet Generator.
 *
 * `pattern` strings are values from the PTCA 26-pattern hook taxonomy. The
 * full controlled vocabulary is inlined into the system prompt at
 * src/prompts/system.ts and is not enforced as a TS union here — that would
 * couple the type to the prompt and make taxonomy edits brittle. The eval
 * suite checks vocabulary compliance instead.
 */

export interface RankedHook {
  /** Verbatim from the input — substring match drives the UI list. */
  hook: string;
  /** 1 = strongest pattern fit + niche relevance among the input set. */
  rank: number;
  /** One PTCA enum, e.g. "before_after". */
  primary_pattern: string;
  /** 0–3 additional patterns also present. */
  secondary_patterns: string[];
  /** One sentence explaining why the pattern lands for this niche. */
  why_it_works: string;
}

export interface PatternCount {
  pattern: string;
  count: number;
}

export interface NewHook {
  /** Ready-to-film hook line, niche-specific. */
  hook: string;
  /** Which PTCA enum this hook deploys. */
  pattern: string;
  /** One sentence — why this pattern fits this niche. */
  why: string;
}

export interface HookResult {
  /** Input hooks, ranked + classified. */
  ranked: RankedHook[];
  /** What patterns the client is already leaning on. */
  pattern_distribution: PatternCount[];
  /** 2–4 patterns the client is NOT using that fit the niche. */
  blind_spots: string[];
  /** Exactly 20 new ready-to-film hooks. */
  new_hooks: NewHook[];
}
