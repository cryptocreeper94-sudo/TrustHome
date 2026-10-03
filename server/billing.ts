/**
 * TrustHome — Plans, Billing (Stripe), Team seats, Onboarding & Checklist
 *
 * Plan model
 *   - Every new agent gets a 14-day Professional trial automatically (no card).
 *   - Paid plans (Professional / Team / Founders Circle) come from Stripe.
 *   - Owners can "comp" an agent (Professional, free) from the owner portal.
 *   - Team-plan leads can add up to 9 agents by email; those agents get Professional.
 *   - Everyone else is on Starter (free) with limits. Data is never deleted.
 *
 * Stripe is called with plain fetch (no SDK). Prices/products/webhook/portal
 * configuration are created automatically the first time they're needed.
 *
 * DarkWave Studios LLC — Copyright 2026
 */

import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, pool } from "./db";
import { users, agentAccounts, teamSeats, appSettings, type AgentAccount } from "@shared/schema";
import { requireAuth, requireAgent, requireOwner } from "./tenant-routes";
import { sendNoticeEmail } from "./resend-client";

const uid = (req: Request) => req.session.userId as string;
const APP_URL = (process.env.APP_URL || "https://trusthome.tlid.io").replace(/\/$/, "");
const TRIAL_DAYS = 14;
const FOUNDERS_CAP = 100;
const TEAM_EXTRA_SEATS = 9; // team lead + 9 = 10 seats

// ─── Plans ────────────────────────────────────────────────────────────

export type PaidPlan = "professional" | "team" | "founders";
export type Interval = "month" | "year";
export type Tier = "starter" | "professional" | "team";

export const PLAN_CATALOG: Record<PaidPlan, { name: string; month: number; year: number }> = {
  professional: { name: "TrustHome Professional", month: 7900, year: 75600 },
  team: { name: "TrustHome Team", month: 14900, year: 142800 },
  founders: { name: "TrustHome Founders Circle", month: 4900, year: 46800 },
};

const MB = 1024 * 1024;
export const LIMITS: Record<Tier, { contacts: number | null; activeDeals: number | null; storageBytes: number }> = {
  starter: { contacts: 50, activeDeals: 3, storageBytes: 500 * MB },
  professional: { contacts: null, activeDeals: null, storageBytes: 25 * 1024 * MB },
  team: { contacts: null, activeDeals: null, storageBytes: 25 * 1024 * MB },
};

const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);
const lookupKey = (plan: PaidPlan, interval: Interval) => `trusthome_${plan}_${interval}`;

// ─── Stripe (fetch) ───────────────────────────────────────────────────

class BillingError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

const stripeKey = () => process.env.STRIPE_SECRET_KEY || "";
export const stripeConfigured = () => stripeKey().startsWith("sk_") || stripeKey().startsWith("rk_");
const stripeMode = () => (stripeKey().includes("_live_") ? "live" : "test");

function encodeForm(obj: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") parts.push(...encodeForm(item as Record<string, unknown>, `${key}[${i}]`));
        else parts.push(`${encodeURIComponent(`${key}[]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") {
      parts.push(...encodeForm(v as Record<string, unknown>, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts;
}

async function stripe<T = any>(method: "GET" | "POST" | "DELETE", path: string, params?: Record<string, unknown>): Promise<T> {
  if (!stripeConfigured()) throw new BillingError(503, "Billing isn't set up yet. Please try again later.", "not_configured");
  const qs = params ? encodeForm(params).join("&") : "";
  const url = `https://api.stripe.com/v1/${path}${method === "GET" && qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body: method === "POST" && qs ? qs : undefined,
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new BillingError(res.status >= 500 ? 502 : 400, data?.error?.message || `Stripe error ${res.status}`, data?.error?.code);
    throw err;
  }
  return data as T;
}

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, key));
  return row?.value ?? null;
}

async function setSetting(key: string, value: string) {
  await db.insert(appSettings).values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });
}

const priceCache = new Map<string, string>();

async function ensurePrice(plan: PaidPlan, interval: Interval): Promise<string> {
  const key = lookupKey(plan, interval);
  const cached = priceCache.get(key);
  if (cached) return cached;
  const found = await stripe<{ data: { id: string }[] }>("GET", "prices", { "lookup_keys": [key], active: "true", limit: 1 });
  if (found.data[0]) {
    priceCache.set(key, found.data[0].id);
    return found.data[0].id;
  }
  const productId = `trusthome_${plan}`;
  try {
    await stripe("POST", "products", { id: productId, name: PLAN_CATALOG[plan].name, metadata: { app: "trusthome", plan } });
  } catch (e) {
    if (!(e instanceof BillingError && e.code === "resource_already_exists")) throw e;
  }
  const price = await stripe<{ id: string }>("POST", "prices", {
    product: productId,
    currency: "usd",
    unit_amount: PLAN_CATALOG[plan][interval],
    recurring: { interval },
    lookup_key: key,
    nickname: `${PLAN_CATALOG[plan].name} (${interval === "month" ? "monthly" : "annual"})`,
    metadata: { app: "trusthome", plan, interval },
  });
  priceCache.set(key, price.id);
  return price.id;
}

function planFromPrice(price: any): { plan: PaidPlan | null; interval: Interval | null } {
  const m = /^trusthome_(professional|team|founders)_(month|year)$/.exec(price?.lookup_key || "");
  if (m) return { plan: m[1] as PaidPlan, interval: m[2] as Interval };
  const plan = price?.metadata?.plan as PaidPlan | undefined;
  return { plan: plan && plan in PLAN_CATALOG ? plan : null, interval: price?.recurring?.interval ?? null };
}

// ─── Accounts & entitlements ──────────────────────────────────────────

export async function getAccount(userId: string): Promise<AgentAccount> {
  const [existing] = await db.select().from(agentAccounts).where(eq(agentAccounts.userId, userId));
  if (existing) return existing;
  await db.insert(agentAccounts)
    .values({ userId, trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 864e5) })
    .onConflictDoNothing();
  const [row] = await db.select().from(agentAccounts).where(eq(agentAccounts.userId, userId));
  return row;
}

const hasPaidSub = (a: Pick<AgentAccount, "stripeSubscriptionId" | "subStatus">) =>
  !!a.stripeSubscriptionId && PAID_STATUSES.has(a.subStatus || "");

export interface Entitlement {
  tier: Tier;
  source: "subscription" | "comped" | "team" | "trial" | "starter";
  plan: PaidPlan | null;
  teamOwnerName: string | null;
  trialDaysLeft: number;
}

export async function getEntitlement(userId: string, email?: string): Promise<Entitlement & { account: AgentAccount }> {
  const account = await getAccount(userId);
  const trialDaysLeft = Math.max(0, Math.ceil((new Date(account.trialEndsAt).getTime() - Date.now()) / 864e5));
  const base = { account, plan: (account.plan as PaidPlan) || null, teamOwnerName: null, trialDaysLeft };

  if (hasPaidSub(account)) {
    return { ...base, tier: account.plan === "team" ? "team" : "professional", source: "subscription" };
  }
  if (account.comped) return { ...base, tier: "professional", source: "comped" };

  if (email) {
    const r = await pool.query(
      `SELECT u.first_name, u.last_name FROM team_seats s
         JOIN agent_accounts a ON a.user_id = s.owner_id
         JOIN users u ON u.id = s.owner_id
        WHERE lower(s.email) = lower($1) AND a.plan = 'team'
          AND a.stripe_subscription_id IS NOT NULL AND a.sub_status IN ('active','trialing','past_due')
        LIMIT 1`,
      [email],
    );
    if (r.rows[0]) {
      return { ...base, tier: "professional", source: "team", teamOwnerName: `${r.rows[0].first_name} ${r.rows[0].last_name}`.trim() };
    }
  }
  if (trialDaysLeft > 0) return { ...base, tier: "professional", source: "trial" };
  return { ...base, tier: "starter", source: "starter" };
}

async function getUsage(userId: string) {
  const r = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM leads WHERE agent_id = $1)::int AS contacts,
       (SELECT COUNT(*) FROM deals WHERE agent_id = $1 AND stage NOT IN ('closed','lost'))::int AS active_deals,
       (SELECT COALESCE(SUM(size_bytes),0) FROM documents WHERE agent_id = $1)::bigint AS storage_bytes`,
    [userId],
  );
  const row = r.rows[0] || {};
  return { contacts: row.contacts ?? 0, activeDeals: row.active_deals ?? 0, storageBytes: Number(row.storage_bytes ?? 0) };
}

/**
 * Returns an error message if creating one more item would exceed the
 * agent's plan, or null if allowed. Used by tenant routes.
 */
export async function checkLimit(req: Request, kind: "contacts" | "activeDeals" | "storage", extraBytes = 0): Promise<string | null> {
  const ent = await getEntitlement(uid(req), req.session.userEmail);
  const limits = LIMITS[ent.tier];
  const usage = await getUsage(uid(req));
  if (kind === "contacts" && limits.contacts !== null && usage.contacts >= limits.contacts) {
    return `You've reached the Starter plan limit of ${limits.contacts} contacts. Upgrade to Professional for unlimited contacts — your existing contacts are safe. (Menu → Plan & Billing)`;
  }
  if (kind === "activeDeals" && limits.activeDeals !== null && usage.activeDeals >= limits.activeDeals) {
    return `The Starter plan includes ${limits.activeDeals} active deals at a time. Close one out or upgrade to Professional for unlimited deals. (Menu → Plan & Billing)`;
  }
  if (kind === "storage" && usage.storageBytes + extraBytes > limits.storageBytes) {
    const cap = limits.storageBytes >= 1024 * MB ? `${Math.round(limits.storageBytes / (1024 * MB))} GB` : `${Math.round(limits.storageBytes / MB)} MB`;
    return `This upload would go over your ${cap} document storage. Upgrade your plan or delete old files to make room. (Menu → Plan & Billing)`;
  }
  return null;
}

async function applySubscription(sub: any, userIdHint?: string) {
  let userId: string | undefined = sub?.metadata?.userId || userIdHint;
  if (!userId && sub?.customer) {
    const [acct] = await db.select({ userId: agentAccounts.userId }).from(agentAccounts)
      .where(eq(agentAccounts.stripeCustomerId, String(sub.customer)));
    userId = acct?.userId;
  }
  if (!userId) {
    console.warn("[billing] subscription without a matching account:", sub?.id);
    return;
  }
  await getAccount(userId);
  const { plan, interval } = planFromPrice(sub?.items?.data?.[0]?.price);
  await db.update(agentAccounts).set({
    plan: plan ?? (sub?.metadata?.plan || null),
    billingInterval: interval,
    subStatus: sub.status,
    currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
    cancelAtPeriodEnd: !!sub.cancel_at_period_end,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: String(sub.customer),
    lastSyncedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(agentAccounts.userId, userId));
}

async function refreshIfStale(account: AgentAccount) {
  if (!account.stripeSubscriptionId || !stripeConfigured()) return;
  const age = account.lastSyncedAt ? Date.now() - new Date(account.lastSyncedAt).getTime() : Infinity;
  if (age < 10 * 60 * 1000) return;
  try {
    const sub = await stripe("GET", `subscriptions/${account.stripeSubscriptionId}`);
    await applySubscription(sub, account.userId);
  } catch (e) {
    console.warn("[billing] refresh failed:", (e as Error).message);
  }
}

async function foundersUsed(): Promise<number> {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS n FROM agent_accounts
      WHERE plan = 'founders' AND stripe_subscription_id IS NOT NULL AND sub_status IN ('active','trialing','past_due')`,
  );
  return r.rows[0]?.n ?? 0;
}

// ─── Webhook & portal setup (automatic) ───────────────────────────────

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
];

async function webhookSecret(): Promise<string | null> {
  return process.env.STRIPE_WEBHOOK_SECRET || (await getSetting(`stripe_webhook_secret_${stripeMode()}`));
}

export async function ensureStripeWebhook() {
  if (!stripeConfigured() || process.env.NODE_ENV !== "production") return;
  try {
    if (await webhookSecret()) return;
    const url = `${APP_URL}/api/billing/webhook`;
    const existing = await stripe<{ data: { id: string; url: string }[] }>("GET", "webhook_endpoints", { limit: 100 });
    for (const ep of existing.data.filter((e) => e.url === url)) {
      await stripe("DELETE", `webhook_endpoints/${ep.id}`); // secret unknown; replace it
    }
    const created = await stripe<{ id: string; secret: string }>("POST", "webhook_endpoints", {
      url,
      enabled_events: WEBHOOK_EVENTS,
      description: "TrustHome billing (created automatically)",
    });
    await setSetting(`stripe_webhook_secret_${stripeMode()}`, created.secret);
    console.log(`[billing] Stripe webhook created (${stripeMode()}): ${url}`);
  } catch (e) {
    console.error("[billing] could not set up Stripe webhook:", (e as Error).message);
  }
}

async function portalConfigId(): Promise<string> {
  const key = `stripe_portal_config_${stripeMode()}`;
  const saved = await getSetting(key);
  if (saved) return saved;
  const [pm, py, tm, ty] = await Promise.all([
    ensurePrice("professional", "month"), ensurePrice("professional", "year"),
    ensurePrice("team", "month"), ensurePrice("team", "year"),
  ]);
  const cfg = await stripe<{ id: string }>("POST", "billing_portal/configurations", {
    business_profile: { headline: "Manage your TrustHome plan" },
    default_return_url: `${APP_URL}/billing`,
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "create_prorations",
        products: [
          { product: "trusthome_professional", prices: [pm, py] },
          { product: "trusthome_team", prices: [tm, ty] },
        ],
      },
    },
  });
  await setSetting(key, cfg.id);
  return cfg.id;
}

function verifyStripeSignature(raw: Buffer, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t;
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || sigs.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw.toString("utf8")}`).digest("hex");
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

async function ensureCustomer(req: Request, account: AgentAccount): Promise<string> {
  if (account.stripeCustomerId) return account.stripeCustomerId;
  const [user] = await db.select().from(users).where(eq(users.id, uid(req)));
  const customer = await stripe<{ id: string }>("POST", "customers", {
    email: user?.email,
    name: user ? `${user.firstName} ${user.lastName}` : undefined,
    metadata: { userId: uid(req), app: "trusthome" },
  });
  await db.update(agentAccounts).set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(agentAccounts.userId, uid(req)));
  return customer.id;
}

function sendError(res: Response, e: unknown) {
  if (e instanceof BillingError) return res.status(e.status).json({ error: e.message, code: e.code });
  console.error("[billing]", e);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}

// ─── Routes ───────────────────────────────────────────────────────────

export function registerBillingRoutes(app: Express) {
  // Public: plan catalog + whether Founders seats remain
  app.get("/api/billing/plans", async (_req, res) => {
    try {
      const used = await foundersUsed();
      res.json({ configured: stripeConfigured(), foundersRemaining: Math.max(0, FOUNDERS_CAP - used), trialDays: TRIAL_DAYS });
    } catch (e) { sendError(res, e); }
  });

  app.get("/api/billing/status", requireAgent, async (req, res) => {
    try {
      let ent = await getEntitlement(uid(req), req.session.userEmail);
      if (ent.account.stripeSubscriptionId) {
        await refreshIfStale(ent.account);
        ent = await getEntitlement(uid(req), req.session.userEmail);
      }
      const usage = await getUsage(uid(req));
      const a = ent.account;
      res.json({
        configured: stripeConfigured(),
        tier: ent.tier,
        source: ent.source,
        plan: ent.plan,
        interval: a.billingInterval,
        subStatus: a.subStatus,
        trialEndsAt: a.trialEndsAt,
        trialDaysLeft: ent.trialDaysLeft,
        currentPeriodEnd: a.currentPeriodEnd,
        cancelAtPeriodEnd: a.cancelAtPeriodEnd,
        hasBillingAccount: !!a.stripeCustomerId,
        comped: a.comped,
        teamOwnerName: ent.teamOwnerName,
        limits: LIMITS[ent.tier],
        usage,
        onboardingCompleted: !!a.onboardingCompletedAt,
        foundersRemaining: Math.max(0, FOUNDERS_CAP - (await foundersUsed())),
      });
    } catch (e) { sendError(res, e); }
  });

  const checkoutSchema = z.object({
    plan: z.enum(["professional", "team", "founders"]),
    interval: z.enum(["month", "year"]).default("month"),
  });

  app.post("/api/billing/checkout", requireAgent, async (req, res) => {
    try {
      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Choose a plan." });
      const { plan, interval } = parsed.data;
      const account = await getAccount(uid(req));
      if (hasPaidSub(account)) {
        return res.status(409).json({ error: "You already have a plan. Use \"Manage billing\" to switch plans.", code: "already_subscribed" });
      }
      if (plan === "founders" && (await foundersUsed()) >= FOUNDERS_CAP) {
        return res.status(409).json({ error: "Founders Circle is full — all 100 seats are taken.", code: "founders_full" });
      }
      const price = await ensurePrice(plan, interval);
      const customer = await ensureCustomer(req, account);

      // Honour the remaining free trial: card is saved now, first charge when the trial ends.
      const trialEnd = Math.floor(new Date(account.trialEndsAt).getTime() / 1000);
      const useTrial = !account.stripeSubscriptionId && trialEnd > Date.now() / 1000 + 2 * 86400;

      const session = await stripe<{ id: string; url: string }>("POST", "checkout/sessions", {
        mode: "subscription",
        customer,
        client_reference_id: uid(req),
        line_items: [{ price, quantity: 1 }],
        allow_promotion_codes: "true",
        subscription_data: {
          metadata: { userId: uid(req), plan, app: "trusthome" },
          ...(useTrial ? { trial_end: trialEnd } : {}),
        },
        metadata: { userId: uid(req), plan },
        success_url: `${APP_URL}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/billing?checkout=canceled`,
      });
      res.json({ url: session.url });
    } catch (e) { sendError(res, e); }
  });

  // Called by the success page so the plan updates instantly (webhook is the backup)
  app.post("/api/billing/confirm", requireAgent, async (req, res) => {
    try {
      const sessionId = String(req.body?.sessionId || "");
      if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return res.status(400).json({ error: "Invalid checkout session" });
      const session = await stripe("GET", `checkout/sessions/${sessionId}`, { "expand": ["subscription"] });
      if (session.client_reference_id !== uid(req)) return res.status(403).json({ error: "This checkout belongs to another account" });
      if (session.subscription && typeof session.subscription === "object") {
        await applySubscription(session.subscription, uid(req));
      }
      res.json({ success: true, status: session.status });
    } catch (e) { sendError(res, e); }
  });

  app.post("/api/billing/portal", requireAgent, async (req, res) => {
    try {
      const account = await getAccount(uid(req));
      if (!account.stripeCustomerId) return res.status(400).json({ error: "You don't have billing set up yet. Choose a plan first." });
      const configuration = await portalConfigId();
      const portal = await stripe<{ url: string }>("POST", "billing_portal/sessions", {
        customer: account.stripeCustomerId,
        configuration,
        return_url: `${APP_URL}/billing`,
      });
      res.json({ url: portal.url });
    } catch (e) { sendError(res, e); }
  });

  app.post("/api/billing/webhook", async (req, res) => {
    const raw = (req as any).rawBody as Buffer | undefined;
    const sig = req.header("stripe-signature") || "";
    const secret = await webhookSecret();
    if (!raw || !secret || !verifyStripeSignature(raw, sig, secret)) {
      return res.status(400).json({ error: "Invalid signature" });
    }
    const event = req.body;
    try {
      const obj = event?.data?.object;
      switch (event?.type) {
        case "checkout.session.completed":
          if (obj?.subscription) {
            const sub = await stripe("GET", `subscriptions/${obj.subscription}`);
            await applySubscription(sub, obj.client_reference_id || undefined);
          }
          break;
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await applySubscription(obj);
          break;
        case "invoice.payment_failed":
        case "invoice.paid":
          if (obj?.subscription) {
            const sub = await stripe("GET", `subscriptions/${obj.subscription}`);
            await applySubscription(sub);
          }
          break;
      }
      res.json({ received: true });
    } catch (e) {
      console.error("[billing] webhook handling failed:", e);
      res.status(500).json({ error: "Webhook handling failed" });
    }
  });

  // ─── Account profile, onboarding, checklist ─────────────────────────

  app.get("/api/account/profile", requireAuth, async (req, res) => {
    const [u] = await db.select().from(users).where(eq(users.id, uid(req)));
    if (!u) return res.status(404).json({ error: "Account not found" });
    res.json({ firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone, brokerage: u.brokerage, licenseNumber: u.licenseNumber, role: u.role });
  });

  const profileSchema = z.object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
    phone: z.string().trim().max(40).optional().nullable(),
    brokerage: z.string().trim().max(120).optional().nullable(),
    licenseNumber: z.string().trim().max(60).optional().nullable(),
  });

  app.patch("/api/account/profile", requireAuth, async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const values = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]));
    if (Object.keys(values).length === 0) return res.json({ success: true });
    await db.update(users).set(values).where(eq(users.id, uid(req)));
    if (values.firstName || values.lastName) {
      const [u] = await db.select().from(users).where(eq(users.id, uid(req)));
      if (u) req.session.userName = `${u.firstName} ${u.lastName}`;
    }
    res.json({ success: true });
  });

  app.post("/api/account/onboarding/complete", requireAgent, async (req, res) => {
    await getAccount(uid(req));
    await db.update(agentAccounts).set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
      .where(eq(agentAccounts.userId, uid(req)));
    res.json({ success: true });
  });

  app.get("/api/account/checklist", requireAgent, async (req, res) => {
    const me = uid(req);
    const ent = await getEntitlement(me, req.session.userEmail);
    const r = await pool.query(
      `SELECT
         (SELECT (COALESCE(phone,'') <> '' OR COALESCE(brokerage,'') <> '') FROM users WHERE id = $1) AS profile,
         EXISTS(SELECT 1 FROM leads WHERE agent_id = $1) AS client,
         EXISTS(SELECT 1 FROM deals WHERE agent_id = $1) AS deal,
         EXISTS(SELECT 1 FROM documents WHERE agent_id = $1) AS document,
         EXISTS(SELECT 1 FROM message_threads WHERE agent_id = $1) AS message,
         EXISTS(SELECT 1 FROM passkeys WHERE user_id = $1) AS passkey`,
      [me],
    );
    const s = r.rows[0] || {};
    const items = [
      { key: "profile", label: "Add your phone & brokerage", done: !!s.profile, route: "/settings" },
      { key: "client", label: "Add your first client", done: !!s.client, route: "/leads" },
      { key: "deal", label: "Start tracking a deal", done: !!s.deal, route: "/transactions" },
      { key: "document", label: "Upload a document", done: !!s.document, route: "/documents" },
      { key: "message", label: "Send a client a message", done: !!s.message, route: "/messages" },
      { key: "passkey", label: "Turn on Face ID / fingerprint sign-in", done: !!s.passkey, route: "/settings" },
      { key: "plan", label: "Choose your plan", done: ent.source === "subscription" || ent.source === "comped" || ent.source === "team", route: "/billing" },
    ];
    res.json({ items, completed: items.filter((i) => i.done).length, total: items.length });
  });

  // ─── Team seats ─────────────────────────────────────────────────────

  app.get("/api/team", requireAgent, async (req, res) => {
    const ent = await getEntitlement(uid(req), req.session.userEmail);
    if (ent.tier !== "team") {
      return res.json({ isTeamLead: false, memberOf: ent.teamOwnerName, seats: [], seatLimit: 0 });
    }
    const r = await pool.query(
      `SELECT s.id, s.email, s.created_at, u.id AS user_id, u.first_name, u.last_name,
              (SELECT COUNT(*) FROM leads l WHERE l.agent_id = u.id)::int AS contacts,
              (SELECT COUNT(*) FROM deals d WHERE d.agent_id = u.id AND d.stage NOT IN ('closed','lost'))::int AS active_deals,
              (SELECT COUNT(*) FROM deals d WHERE d.agent_id = u.id AND d.stage = 'closed')::int AS closed_deals,
              (SELECT COALESCE(SUM(price),0) FROM deals d WHERE d.agent_id = u.id AND d.stage = 'closed')::float AS closed_volume
         FROM team_seats s LEFT JOIN users u ON lower(u.email) = lower(s.email)
        WHERE s.owner_id = $1 ORDER BY s.created_at`,
      [uid(req)],
    );
    res.json({
      isTeamLead: true,
      memberOf: null,
      seatLimit: TEAM_EXTRA_SEATS,
      seats: r.rows.map((s) => ({
        id: s.id, email: s.email, joined: !!s.user_id,
        name: s.user_id ? `${s.first_name} ${s.last_name}`.trim() : null,
        contacts: s.contacts ?? 0, activeDeals: s.active_deals ?? 0, closedDeals: s.closed_deals ?? 0, closedVolume: s.closed_volume ?? 0,
      })),
    });
  });

  app.post("/api/team/seats", requireAgent, async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
    const ent = await getEntitlement(uid(req), req.session.userEmail);
    if (ent.tier !== "team") return res.status(403).json({ error: "Adding agents requires the Team plan." });
    if (email === (req.session.userEmail || "").toLowerCase()) return res.status(400).json({ error: "You're already on your team." });
    const existing = await db.select().from(teamSeats).where(eq(teamSeats.ownerId, uid(req)));
    if (existing.some((s) => s.email.toLowerCase() === email)) return res.status(409).json({ error: "That agent is already on your team." });
    if (existing.length >= TEAM_EXTRA_SEATS) return res.status(409).json({ error: `Your Team plan includes ${TEAM_EXTRA_SEATS + 1} seats (you + ${TEAM_EXTRA_SEATS}).` });
    const [seat] = await db.insert(teamSeats).values({ ownerId: uid(req), email }).returning();
    sendNoticeEmail({
      to: email,
      subject: `${req.session.userName || "Your team lead"} added you to their TrustHome team`,
      heading: "You've been added to a TrustHome team",
      body: `${req.session.userName || "Your team lead"} added you to their team. Your Professional plan is covered.\n\nCreate your agent account with this email address (${email}) to get started.`,
      ctaText: "Create my account",
      ctaUrl: `${APP_URL}/team`,
    }).catch((e) => console.warn("[team] invite email failed:", e?.message));
    res.status(201).json(seat);
  });

  app.delete("/api/team/seats/:id", requireAgent, async (req, res) => {
    const [row] = await db.delete(teamSeats)
      .where(and(eq(teamSeats.id, req.params.id as string), eq(teamSeats.ownerId, uid(req))))
      .returning({ id: teamSeats.id });
    if (!row) return res.status(404).json({ error: "Seat not found" });
    res.json({ success: true });
  });

  // ─── Owner: billing overview + comp ─────────────────────────────────

  app.get("/api/owner/billing", requireOwner, async (_req, res) => {
    try {
      const r = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
                a.trial_ends_at, a.plan, a.billing_interval, a.sub_status, a.stripe_subscription_id,
                a.cancel_at_period_end, a.current_period_end, a.comped, a.comped_note, a.onboarding_completed_at,
                EXISTS(SELECT 1 FROM team_seats s JOIN agent_accounts o ON o.user_id = s.owner_id
                        WHERE lower(s.email) = lower(u.email) AND o.plan = 'team'
                          AND o.sub_status IN ('active','trialing','past_due')) AS team_member
           FROM users u LEFT JOIN agent_accounts a ON a.user_id = u.id
          WHERE u.role = 'agent'
          ORDER BY u.created_at DESC`,
      );
      const now = Date.now();
      let mrrCents = 0;
      const counts = { agents: 0, paying: 0, trialing: 0, starter: 0, comped: 0, team: 0, pastDue: 0, canceling: 0, professional: 0, teamPlan: 0, founders: 0 };
      const agents = r.rows.map((row) => {
        counts.agents++;
        const trialEnds = row.trial_ends_at ? new Date(row.trial_ends_at).getTime() : new Date(row.created_at).getTime() + TRIAL_DAYS * 864e5;
        const paid = !!row.stripe_subscription_id && PAID_STATUSES.has(row.sub_status || "");
        let status: string;
        if (paid) {
          status = row.sub_status === "past_due" ? "past_due" : row.sub_status === "trialing" ? "paid_trial" : "paying";
          counts.paying++;
          if (row.sub_status === "past_due") counts.pastDue++;
          if (row.cancel_at_period_end) counts.canceling++;
          if (row.plan === "professional") counts.professional++;
          if (row.plan === "team") counts.teamPlan++;
          if (row.plan === "founders") counts.founders++;
          if (row.sub_status !== "trialing" && row.plan in PLAN_CATALOG) {
            const p = PLAN_CATALOG[row.plan as PaidPlan];
            mrrCents += row.billing_interval === "year" ? Math.round(p.year / 12) : p.month;
          }
        } else if (row.comped) { status = "comped"; counts.comped++; }
        else if (row.team_member) { status = "team_member"; counts.team++; }
        else if (trialEnds > now) { status = "trial"; counts.trialing++; }
        else { status = "starter"; counts.starter++; }
        return {
          id: row.id, email: row.email, name: `${row.first_name} ${row.last_name}`.trim(), createdAt: row.created_at,
          status, plan: row.plan, interval: row.billing_interval, trialEndsAt: new Date(trialEnds).toISOString(),
          cancelAtPeriodEnd: !!row.cancel_at_period_end, comped: !!row.comped, compedNote: row.comped_note,
          onboarded: !!row.onboarding_completed_at,
        };
      });
      res.json({
        configured: stripeConfigured(),
        mode: stripeConfigured() ? stripeMode() : null,
        mrr: mrrCents / 100,
        counts,
        foundersUsed: counts.founders,
        foundersCap: FOUNDERS_CAP,
        agents,
      });
    } catch (e) { sendError(res, e); }
  });

  app.post("/api/owner/agents/:id/comp", requireOwner, async (req, res) => {
    const id = req.params.id as string;
    const [u] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, id));
    if (!u || u.role !== "agent") return res.status(404).json({ error: "Agent not found" });
    await getAccount(id);
    const comped = !!req.body?.comped;
    await db.update(agentAccounts).set({
      comped,
      compedNote: comped ? String(req.body?.note || "Comped by owner").slice(0, 200) : null,
      updatedAt: new Date(),
    }).where(eq(agentAccounts.userId, id));
    res.json({ success: true, comped });
  });

  // Set up the Stripe webhook in the background after boot
  setTimeout(() => { ensureStripeWebhook().catch(() => {}); }, 8000);
}
