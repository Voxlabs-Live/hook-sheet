/**
 * Studio North hook-sheet fixtures.
 *
 * Each fixture is a plausible weekly snapshot of a single client's top-performing
 * hooks across IG Reels / TikTok / Shorts. The point of the demo: the buyer
 * sees their OWN client workflow reflected and immediately spots which patterns
 * the demo client is leaning on plus which ones it never touches.
 *
 * The hooks are written to lean cleanly on certain patterns so the
 * pattern_distribution and blind_spots outputs feel sharp on first run.
 *
 * Aurelia → before_after + asmr_sensory heavy → blind to question_hook + cuteness
 * Mantra  → pov_immersion + relatability heavy → blind to authority + number_promise
 * Eckhardt → authority_credential + negative_framing heavy → blind to pov + asmr
 */

export interface HookSample {
  id: "aurelia-lashes" | "mantra-yoga" | "eckhardt-clinic";
  client: string;
  niche: string;
  topHooks: string;
}

export const HOOK_SAMPLES: HookSample[] = [
  {
    id: "aurelia-lashes",
    client: "Aurelia Lashes",
    niche: "Beauty / lash extension studio in Berlin (premium, craft-forward, no mega-volumes)",
    topHooks: `Watching her wake up with full lashes for the first time [840K views]
The 90-second glue everyone's switching to [410K views]
Side by side: cluster lashes vs. classic [380K views]
The lash that holds 16 hours and disappears [290K views]
Watch one lash get applied. Just one. In real time. [260K views]
Why we don't do mega volumes anymore [210K views]
Four weeks in vs. fresh set [180K views]
The sound a fresh set makes when it dries [140K views]`,
  },
  {
    id: "mantra-yoga",
    client: "Mantra Yoga",
    niche: "Boutique yoga studio in Mitte / Berlin — tone is calm, anti-hustle, slow practice",
    topHooks: `POV: it's your first vinyasa class and you don't know what chaturanga is [620K views]
That feeling of leaving the studio at 7am after practice [450K views]
What it actually looks like to fall out of crow pose [310K views]
The studio in the last five minutes of savasana [280K views]
You don't have to touch your toes to take this class [220K views]
The same teacher, same playlist, every Sunday for two years [160K views]`,
  },
  {
    id: "eckhardt-clinic",
    client: "Dr. Eckhardt Clinic",
    niche: "Aesthetic medical clinic — scalp recovery, dermatology, evidence-based, mid-career professional patients",
    topHooks: `The single most common scalp mistake patients make in their 40s [580K views]
Six weeks of treatment vs. six months — what the data says [340K views]
Why over-the-counter minoxidil rarely works after 50 [290K views]
Three patient outcomes you should never see promised [250K views]
What our pilot study found about combination therapy [190K views]`,
  },
];

export function findHookSample(id: string): HookSample | undefined {
  return HOOK_SAMPLES.find((s) => s.id === id);
}
