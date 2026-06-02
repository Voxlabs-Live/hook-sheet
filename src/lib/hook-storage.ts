/**
 * localStorage persistence for the Hook Sheet tool — client profiles + a
 * generated-sheet history.
 *
 * Browser-only. The /api/classify endpoint receives the full input (niche +
 * top hooks) in the request body — the server never reads from localStorage.
 * This keeps the buyer's fork stateless (no DB, no operational dependency),
 * exactly like the sibling Brand Voice Checker this module is adapted from.
 *
 * Two record types:
 *   - Client  — the reusable INPUT (niche + the client's top hooks). Edited in
 *     place, autosaved (gated on a name). The 3 built-in fixtures are seeded as
 *     read-only sample clients (id prefixed `sample:`).
 *   - Sheet   — the generated OUTPUT (the 20 hooks + ranking + distribution).
 *     A valuable artifact, so every successful generation is persisted to a
 *     most-recent-first history that survives refresh.
 *
 * Hard-won fixes inherited from the Brand Voice Checker overhaul (do NOT
 * re-introduce these bugs):
 *   1. Append, never overwrite, when seeding (one-time flag + id dedupe).
 *   2. Reads coalesce missing fields so partial/legacy/tampered items don't
 *      crash a render with "x is not iterable".
 *   3. Corruption-tolerant reads — bad JSON → [] (never a white screen).
 */
import type { HookResult } from "./hook-types";

const CLIENTS_KEY = "hooksheet:clients:v1";
const SHEETS_KEY = "hooksheet:sheets:v1";
const SEEDED_FLAG_KEY = "hooksheet:seeded:v1";
const LAST_VIEWED_KEY = "hooksheet:last:v1";

export const SAMPLE_ID_PREFIX = "sample:";

/** Reusable per-client input profile. */
export interface ClientProfile {
  id: string;
  client_name: string;
  niche: string;
  top_hooks: string;
  updated_at: string;
}

/** A persisted generation — the deliverable that must survive refresh. */
export interface SavedSheet {
  id: string;
  /** Owning client id. May reference a since-deleted client; the snapshot below keeps history readable. */
  client_id: string;
  /** Client name snapshot at generate time (so history reads correctly even after rename/delete). */
  client_name: string;
  /** Input snapshot — what produced this sheet. */
  niche: string;
  top_hooks: string;
  result: HookResult;
  created_at: string;
}

/** Pointer to whatever the user was last looking at, restored on load. */
export interface LastViewed {
  clientId?: string;
  sheetId?: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function isSampleId(id: string | undefined | null): boolean {
  return typeof id === "string" && id.startsWith(SAMPLE_ID_PREFIX);
}

// ─── Coalescing (schema-drift / tamper tolerance) ──────────────────────────
// A stored item missing a newer field, or with a wrong-typed field, must load
// without crashing. Every read funnels through these.
function coalesceClient(raw: unknown): ClientProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== "string") return null;
  return {
    id: c.id,
    client_name: typeof c.client_name === "string" ? c.client_name : "",
    niche: typeof c.niche === "string" ? c.niche : "",
    top_hooks: typeof c.top_hooks === "string" ? c.top_hooks : "",
    updated_at: typeof c.updated_at === "string" ? c.updated_at : "",
  };
}

function coalesceResult(raw: unknown): HookResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ranked: Array.isArray(r.ranked) ? (r.ranked as HookResult["ranked"]) : [],
    pattern_distribution: Array.isArray(r.pattern_distribution)
      ? (r.pattern_distribution as HookResult["pattern_distribution"])
      : [],
    blind_spots: Array.isArray(r.blind_spots) ? (r.blind_spots as string[]) : [],
    new_hooks: Array.isArray(r.new_hooks) ? (r.new_hooks as HookResult["new_hooks"]) : [],
  };
}

function coalesceSheet(raw: unknown): SavedSheet | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== "string") return null;
  return {
    id: s.id,
    client_id: typeof s.client_id === "string" ? s.client_id : "",
    client_name: typeof s.client_name === "string" ? s.client_name : "",
    niche: typeof s.niche === "string" ? s.niche : "",
    top_hooks: typeof s.top_hooks === "string" ? s.top_hooks : "",
    result: coalesceResult(s.result),
    created_at: typeof s.created_at === "string" ? s.created_at : new Date(0).toISOString(),
  };
}

// ─── Clients ────────────────────────────────────────────────────────────────
function readAllClients(): ClientProfile[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(CLIENTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coalesceClient).filter((c): c is ClientProfile => c !== null);
  } catch {
    return [];
  }
}

function writeAllClients(clients: ClientProfile[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

/** Saved clients, sample clients first then user-created (each group by name). */
export function listClients(): ClientProfile[] {
  return [...readAllClients()].sort((a, b) => {
    const aSample = isSampleId(a.id);
    const bSample = isSampleId(b.id);
    if (aSample !== bSample) return aSample ? -1 : 1;
    return a.client_name.localeCompare(b.client_name);
  });
}

export function getClient(id: string): ClientProfile | undefined {
  return readAllClients().find((c) => c.id === id);
}

/** Insert or update. Stamps updated_at. */
export function saveClient(client: ClientProfile): ClientProfile {
  const stamped: ClientProfile = { ...client, updated_at: new Date().toISOString() };
  const all = readAllClients();
  const idx = all.findIndex((c) => c.id === stamped.id);
  if (idx >= 0) all[idx] = stamped;
  else all.push(stamped);
  writeAllClients(all);
  return stamped;
}

export function deleteClient(id: string): void {
  writeAllClients(readAllClients().filter((c) => c.id !== id));
}

/** Duplicate a client (new id, "(copy)" suffix) — the editable-copy path for samples. */
export function duplicateClient(id: string): ClientProfile | undefined {
  const source = getClient(id);
  if (!source) return undefined;
  return saveClient({
    id: crypto.randomUUID(),
    client_name: `${source.client_name} (copy)`,
    niche: source.niche,
    top_hooks: source.top_hooks,
    updated_at: "",
  });
}

/**
 * Seed built-in sample clients on first visit. Idempotent — a one-time flag
 * plus an id-dedupe means re-seeding never overwrites user edits or duplicates
 * a sample the user already has.
 */
export function seedClientsIfNeeded(samples: ClientProfile[]): void {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(SEEDED_FLAG_KEY) === "1") return;
  const existing = readAllClients();
  const existingIds = new Set(existing.map((c) => c.id));
  const toAdd = samples.filter((s) => !existingIds.has(s.id));
  if (toAdd.length > 0) writeAllClients([...existing, ...toAdd]);
  window.localStorage.setItem(SEEDED_FLAG_KEY, "1");
}

// ─── Sheets (generation history) ─────────────────────────────────────────────
function readAllSheets(): SavedSheet[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(SHEETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coalesceSheet).filter((s): s is SavedSheet => s !== null);
  } catch {
    return [];
  }
}

function writeAllSheets(sheets: SavedSheet[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
}

/** History, most-recent-first. */
export function listSheets(): SavedSheet[] {
  return [...readAllSheets()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getSheet(id: string): SavedSheet | undefined {
  return readAllSheets().find((s) => s.id === id);
}

/** Persist a freshly-generated sheet. Returns the stored record (with id + timestamp). */
export function saveSheet(input: {
  client_id: string;
  client_name: string;
  niche: string;
  top_hooks: string;
  result: HookResult;
}): SavedSheet {
  const sheet: SavedSheet = {
    id: crypto.randomUUID(),
    client_id: input.client_id,
    client_name: input.client_name,
    niche: input.niche,
    top_hooks: input.top_hooks,
    result: input.result,
    created_at: new Date().toISOString(),
  };
  writeAllSheets([sheet, ...readAllSheets()]);
  return sheet;
}

export function deleteSheet(id: string): void {
  writeAllSheets(readAllSheets().filter((s) => s.id !== id));
}

// ─── Last-viewed pointer ─────────────────────────────────────────────────────
export function getLastViewed(): LastViewed {
  if (!isBrowser()) return {};
  const raw = window.localStorage.getItem(LAST_VIEWED_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const p = parsed as Record<string, unknown>;
    return {
      clientId: typeof p.clientId === "string" ? p.clientId : undefined,
      sheetId: typeof p.sheetId === "string" ? p.sheetId : undefined,
    };
  } catch {
    return {};
  }
}

export function setLastViewed(next: LastViewed): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(next));
}
