# Hook Sheet Generator

Paste 5–10 of your client's top hooks. Get back:

- Each hook **classified** by a 26-pattern hook taxonomy (PTCA — primary + secondary patterns + why-it-works)
- A **pattern distribution** showing what the client is leaning on
- **Blind spots** — patterns the client is NOT using that fit the niche
- **20 new ready-to-film hook lines**, niche-specific, distributed across blind spots and what's already working

Part of the [Agency Vibe-Coding Kit](https://voxlabs.live) — a $7 starter pack of four small tools your creative agency can run from a browser.

**Live demo:** [hook-sheet.voxlabs.live](https://hook-sheet.voxlabs.live) (5 free runs per visitor)

**Use it weekly:** classify your client's last week of top hooks → file the new 20 against blind spots → film what's missing.

---

## Deploy your own copy (3 minutes, browser-only)

You don't need a terminal. You need a GitHub account, a Vercel account, and an Anthropic API key.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVoxlabs-Live%2Fhook-sheet&env=ANTHROPIC_API_KEY&envDescription=Get%20your%20Anthropic%20API%20key%20from%20console.anthropic.com&envLink=https%3A%2F%2Fconsole.anthropic.com%2Fsettings%2Fkeys)

1. Click **Deploy with Vercel**.
2. Sign in to GitHub. Vercel will fork this repo into your GitHub account.
3. Sign up for Vercel free tier (~3 min, no credit card needed).
4. Paste your **Anthropic API key** when prompted. Get one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
5. Click **Deploy**. Wait ~90 seconds. You get your own URL.

That's it. The tool is yours — no limits, you pay only what you use on Anthropic.

### Watch the deploy walkthrough

A 10-minute screen recording covers the whole flow. [Watch it here](#loom-coming-soon) *(link added when the kit's Looms are released).*

---

## What you'll spend on your own deploy

- ~**$0.012 – $0.025 per hook sheet** depending on hook count and niche complexity
- ~**$5 – $20/month** for typical agency use (one weekly run per client across 3–5 clients)
- No subscription. You pay Anthropic directly.

---

## Customize the tool

### Tune the taxonomy

Open `src/prompts/system.ts`. The 26 hook patterns are inlined in the system prompt — add your own patterns, remove ones that don't fit your verticals, or edit the descriptions to bias the classifier toward your interpretations.

### Add per-client niche presets

The fixtures in `src/fixtures/studio-north.ts` are demo content. Replace them with your real clients' niche descriptions and recent top-performer hook lists to skip the paste step.

### Upgrade to polished UI

The kit's **Bump #1 — Claude Design Polish Guide** ($17) walks you through styling this repo with [Claude Design](https://claude.com/design). *(Available after kit purchase.)*

---

## Local dev

```sh
git clone https://github.com/Voxlabs-Live/hook-sheet
cd hook-sheet
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Then open `http://localhost:4321`.

---

## Tech

- **Astro 5** + TypeScript strict mode
- **`@anthropic-ai/sdk`** with prompt caching on the system prompt
- **Claude Sonnet 4.6** as default model
- **Vercel** for hosting + serverless API route
- **Upstash Redis** (via Vercel Marketplace) for the hosted demo's lifetime cap — disabled on your own deploy

---

## Part of the kit

| Tool | Repo |
|---|---|
| Brief Translator | [Voxlabs-Live/brief-translator](https://github.com/Voxlabs-Live/brief-translator) |
| Brand Voice Checker | [Voxlabs-Live/brand-voice-checker](https://github.com/Voxlabs-Live/brand-voice-checker) |
| **Weekly Hook Sheet Generator** | this repo |
| Shot List Generator | [Voxlabs-Live/shot-list](https://github.com/Voxlabs-Live/shot-list) |

---

## License

MIT for the code. The system prompts (`src/prompts/system.ts`) and the PTCA hook taxonomy are part of the kit product — you can modify them for your own use, but please don't redistribute the prompts unchanged as a competing product.
