/**
 * Plain-English glossary for the 26 PTCA hook patterns.
 *
 * Single source of truth for BOTH surfaces that teach the vocabulary:
 *   1. the click-a-chip popover (in-context, "what's THIS one?")
 *   2. the collapsible "26 hook patterns, explained" section under the result.
 *
 * `token` matches the canonical enum rendered on the chips (snake_case, the
 * shared vocabulary with the mid-ticket pipeline). `title` is the humanized
 * label shown in the popover/glossary. `blurb` is one plain line lifted from
 * the canonical taxonomy (`ptca_hook_taxonomy.md`). `example` is one short,
 * niche-agnostic hook that demonstrates the pattern.
 *
 * If the 26-enum canon ever changes, update this alongside the prompt +
 * validate.ts + vibe-kit-eval/check.ts (the four copies live in different repos).
 */

export interface PatternEntry {
  /** Canonical enum — matches the chip text exactly. */
  token: string;
  /** Humanized display title for the popover + glossary. */
  title: string;
  /** One plain-English line. */
  blurb: string;
  /** One short, generic example hook that shows the pattern in action. */
  example: string;
}

/** Canonical display order (mirrors the taxonomy file). */
export const PATTERN_ORDER: string[] = [
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
];

export const PATTERN_GLOSSARY: Record<string, PatternEntry> = {
  curiosity_gap: {
    token: "curiosity_gap",
    title: "Curiosity gap",
    blurb: "Holds back a key detail so viewers have to keep watching to find out.",
    example: "The one ingredient nobody tells you to add",
  },
  shock_open: {
    token: "shock_open",
    title: "Shock open",
    blurb: "Opens on a startling visual or sound that stops the scroll.",
    example: "I dropped it on day one — watch what happens.",
  },
  pov_immersion: {
    token: "pov_immersion",
    title: "POV immersion",
    blurb: "Drops the viewer inside a perspective or lived moment.",
    example: "POV: it's your first day and nothing makes sense",
  },
  question_hook: {
    token: "question_hook",
    title: "Question hook",
    blurb: "Asks the viewer a direct question they want answered.",
    example: "Are you storing this completely wrong?",
  },
  number_promise: {
    token: "number_promise",
    title: "Number promise",
    blurb: "Promises a numbered list, sequence, or count.",
    example: "3 mistakes that quietly ruin every batch",
  },
  controversial_claim: {
    token: "controversial_claim",
    title: "Controversial claim",
    blurb: "Leads with a polarizing or unexpected opinion.",
    example: "Most of what you've been told about this is wrong",
  },
  unusual_action: {
    token: "unusual_action",
    title: "Unusual action",
    blurb: "Shows someone doing something strange, novel, or unexpected.",
    example: "Watch me do this the completely wrong way",
  },
  relatability: {
    token: "relatability",
    title: "Relatability",
    blurb: "Names a shared experience — 'me when…' — so people see themselves.",
    example: "That feeling when the order finally ships",
  },
  before_after: {
    token: "before_after",
    title: "Before / after",
    blurb: "Frames a transformation or contrast between two states.",
    example: "Day one vs. day ninety — same person",
  },
  cliffhanger_wait_for_it: {
    token: "cliffhanger_wait_for_it",
    title: "Cliffhanger (wait for it)",
    blurb: "Builds toward a payoff that's deliberately delayed.",
    example: "Looks normal… but wait for the last second",
  },
  authority_credential: {
    token: "authority_credential",
    title: "Authority / credential",
    blurb: "Opens with expert, insider, or proof-of-authority framing.",
    example: "After 10,000 of these, here's what I'd never do",
  },
  transformation_process: {
    token: "transformation_process",
    title: "Transformation process",
    blurb: "Foregrounds a satisfying making, doing, or repair sequence.",
    example: "Watch this raw block become a finished piece",
  },
  trend_format: {
    token: "trend_format",
    title: "Trend format",
    blurb: "Rides a recognizable meme, sound, edit, or platform-native format.",
    example: "Using the trending sound to show our process",
  },
  direct_address_you: {
    token: "direct_address_you",
    title: "Direct address (you)",
    blurb: "Speaks straight to the viewer as 'you'.",
    example: "If this happens to you by day five, this is why",
  },
  negative_framing: {
    token: "negative_framing",
    title: "Negative framing",
    blurb: "Warns against a mistake, risk, or behavior to avoid.",
    example: "Stop doing this if you want it to last",
  },
  scare_tactic: {
    token: "scare_tactic",
    title: "Scare tactic",
    blurb: "Uses fear, danger, or jump-scare energy to grab attention.",
    example: "This tiny mistake can cost you everything",
  },
  cuteness: {
    token: "cuteness",
    title: "Cuteness",
    blurb: "Leans on adorable, tender, or affectionate appeal.",
    example: "Wait for the reaction at the very end",
  },
  physical_fail: {
    token: "physical_fail",
    title: "Physical fail",
    blurb: "Uses a fall, blooper, or mishap as the surprise.",
    example: "I had one job… here's how it went",
  },
  asmr_sensory: {
    token: "asmr_sensory",
    title: "ASMR / sensory",
    blurb: "Uses tactile, auditory, or oddly-satisfying sensory appeal.",
    example: "The sound this makes when it's done right",
  },
  visual_spectacle: {
    token: "visual_spectacle",
    title: "Visual spectacle",
    blurb: "Leads with beauty, scale, rarity, or sheer visual awe.",
    example: "The most stunning one we've ever filmed",
  },
  status_flex: {
    token: "status_flex",
    title: "Status flex",
    blurb: "Displays achievement, skill, access, or status.",
    example: "What a decade of mastering this looks like",
  },
  mystery_object: {
    token: "mystery_object",
    title: "Mystery object",
    blurb: "Makes the viewer work out what an unclear object is.",
    example: "Can you guess what this tool is for?",
  },
  rapid_cut_montage: {
    token: "rapid_cut_montage",
    title: "Rapid-cut montage",
    blurb: "Hits you with a barrage of fast visuals.",
    example: "Our entire week in fifteen seconds",
  },
  voiceover_narration: {
    token: "voiceover_narration",
    title: "Voiceover narration",
    blurb: "Hooks through a narrated story setup.",
    example: "Let me tell you how this almost didn't happen",
  },
  text_only_hook: {
    token: "text_only_hook",
    title: "Text-only hook",
    blurb: "The first frame is mostly text doing the work.",
    example: "Three words on a black screen: don't skip this",
  },
  silent_visual: {
    token: "silent_visual",
    title: "Silent visual",
    blurb: "Works with no meaningful audio — the visual carries it.",
    example: "No talking — just watch it come together",
  },
};

/** Look up an entry by token; falls back to a humanized title if unknown. */
export function patternEntry(token: string): PatternEntry {
  return (
    PATTERN_GLOSSARY[token] ?? {
      token,
      title: token.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      blurb: "A hook pattern from the taxonomy.",
      example: "",
    }
  );
}
