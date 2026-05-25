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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVoxlabs-Live%2Fhook-sheet&env=ANTHROPIC_API_KEY&envDescription=Get%20your%20Anthropic%20API%20key%20from%20platform.claude.com&envLink=https%3A%2F%2Fplatform.claude.com)

1. Click **Deploy with Vercel**.
2. Sign in to GitHub. Vercel will fork this repo into your GitHub account.
3. Sign up for Vercel free tier (~3 min, no credit card needed).
4. Paste your **Anthropic API key** when prompted. Get one at [platform.claude.com](https://platform.claude.com) — sign up, click "Get API Key" on the dashboard, copy the key somewhere safe (you only see it once).
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

This repo is yours to modify. You don't have to write code — **Claude** rewrites the files for you, you paste the result back into GitHub in your browser. No terminal, no command line.

### One-time setup (≈3 minutes)

1. **Download the Claude desktop app.** Go to [claude.ai/download](https://claude.ai/download). Click the download button for your operating system. On **Mac**, open the downloaded file and drag the Claude icon into your Applications folder. On **Windows**, run the installer. Sign in with your Claude account.

That's it. Claude desktop is the same chat you already know from [claude.ai](https://claude.ai) — just running as an app on your computer. (If you'd rather not install anything, [claude.ai](https://claude.ai) in your browser works exactly the same way for the steps below.)

### How customizing works

Three browser tabs and one app, working together:

1. **GitHub** in your browser — where your tool's code lives.
2. **Claude desktop app** — does the rewriting.
3. **Vercel** in your browser — auto-redeploys your live tool when you commit a change.

The flow for any change is the same six steps:

1. **In GitHub**, click the file you want to change (paths are in the prompts below).
2. Click the **"Copy raw file"** icon at the top right of the file view — it copies the whole file to your clipboard.
3. **In Claude desktop**, start a new chat. Paste the file contents. Below it, paste the prompt from this README. Hit return.
4. Claude rewrites the file and shows you the result. Copy Claude's output.
5. **Back in GitHub**, click the **pencil icon** at the top right of the file view (the tooltip says "Edit this file"). Select everything (`Cmd+A` on Mac, `Ctrl+A` on Windows), delete it, paste your new version.
6. Scroll to the bottom of the page. Write a one-line summary of what changed (e.g. "Add curiosity-gap hook pattern"). Click the green **"Commit changes"** button.

Vercel sees the commit and auto-redeploys your live URL in about 90 seconds. Refresh your tool to see the change.

### Three starting points

#### 1. Adjust the hook patterns the tool uses

The tool ships with 26 hook patterns (curiosity gap, contrarian take, listicle promise, etc.) and classifies your hooks against them. Want to add patterns specific to your verticals? Remove ones you never use? Rewrite the descriptions to bias the tool toward your interpretation?

**File to copy from GitHub:** `src/prompts/system.ts`

> **Prompt to paste below the file contents:**
> ```
> The file above contains the 26 hook patterns the tool uses to classify
> hooks. Add a new pattern called "Receipts" with this description:
>
> "Opens by showing concrete proof — a screenshot, an invoice, a DM, a
> revenue chart — before saying what the post is about. Strong on
> finance, ecom, and B2B niches; weak on lifestyle."
>
> Keep all other patterns as-is. Return the full updated file so I can
> paste it back into GitHub.
> ```

Adapt the prompt — add or remove whichever patterns fit your clients.

#### 2. Replace or remove the demo sample buttons

The tool ships with three sample clients (Aurelia Lashes, Mantra Yoga, Dr. Eckhardt Clinic) so you can try it without setting anything up. You'll almost certainly want to either swap them for your real clients' niche descriptions and recent top hooks so the tool starts pre-loaded — or remove the row entirely so your live tool starts empty.

**File to copy from GitHub:** `src/fixtures/studio-north.ts`

**Option A — Replace with your own:**

> **Prompt:**
> ```
> The file above contains three demo client fixtures. Replace them with
> these three of mine instead:
>
> Client 1: [paste your client's name, their niche, and 5-10 of their
> recent top-performing hooks here]
>
> Client 2: [same]
>
> Client 3: [same]
>
> Keep the file structure identical so the tool still works. Return the
> full updated file so I can paste it back into GitHub.
> ```

**Option B — Remove samples entirely:**

> **Prompt:**
> ```
> The file above defines three demo client fixtures. I don't want any
> sample buttons in my deployed tool — users should just see empty input
> fields.
>
> Rewrite the file so HOOK_SAMPLES is an empty array. Keep the HookSample
> interface and the findHookSample function so nothing else breaks.
> Return the full updated file so I can paste it back into GitHub.
> ```

When `HOOK_SAMPLES` is empty, the "Try a sample:" row automatically disappears from your tool — no further code changes needed.

#### 3. Make it look like agency work, not a starter kit

For a full re-skin: the **Claude Design Brand Pass Guide** ($17) walks you through restyling this exact repo using [Claude Design](https://claude.com/design) — the guide ships handoff bundles for the entire UI. *(Available after kit purchase.)*

---

## Local dev (for developers only)

> **Skip this section if you used the Deploy with Vercel button above.** This is for developers who want to clone the repo and run a dev server locally. If you don't know what `npm` is, you don't need this — the Customize section above is the path you want.

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
