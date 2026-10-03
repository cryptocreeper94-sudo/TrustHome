/**
 * TrustHome — Tenant & Owner Routes
 *
 * - requireAuth / requireAgent / requireOwner guards
 * - Owner portal: PIN unlock (OWNER_PINS env), business metrics
 * - Per-agent CRUD for leads, deals, calendar, properties, tasks,
 *   expenses, mileage, MLS config, documents (real files), messaging
 *
 * Tenant rule: agent_id is ALWAYS taken from the session, never the client.
 *
 * DarkWave Studios LLC — Copyright 2026
 */

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { z } from "zod";
import { and, desc, eq, gte, sql, count, ne, isNull, asc } from "drizzle-orm";
import { db, pool } from "./db";
import {
  users,
  accessRequests,
  leads,
  deals,
  calendarEvents,
  properties,
  agentTasks,
  documents,
  documentFiles,
  messageThreads,
  threadMessages,
  expenses,
  mileageEntries,
  mlsConfigurations,
} from "@shared/schema";

// ─── Guards ───────────────────────────────────────────────────────────

const OWNER_SESSION_MS = 12 * 60 * 60 * 1000;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ error: "Not signed in" });
  next();
}

export function requireAgent(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ error: "Not signed in" });
  if (req.session.userRole !== "agent") return res.status(403).json({ error: "Agent account required" });
  next();
}

export function isOwnerSession(req: Request): boolean {
  return !!req.session.ownerUntil && req.session.ownerUntil > Date.now();
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!isOwnerSession(req)) return res.status(403).json({ error: "Owner access required" });
  next();
}

const uid = (req: Request) => req.session.userId as string;

// ─── Owner PIN ────────────────────────────────────────────────────────

function ownerPins(): string[] {
  const raw = process.env.OWNER_PINS || process.env.OWNER_PIN || "";
  return raw
    .split(",")
    .map((entry) => entry.trim().split(":")[0].trim())
    .filter(Boolean);
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const pinAttempts = new Map<string, { failures: number; resetAt: number }>();
const MAX_PIN_FAILURES = 5;
const PIN_WINDOW_MS = 15 * 60 * 1000;

function pinLockedOut(ip: string): number {
  const entry = pinAttempts.get(ip);
  if (!entry) return 0;
  if (entry.resetAt < Date.now()) {
    pinAttempts.delete(ip);
    return 0;
  }
  return entry.failures >= MAX_PIN_FAILURES ? entry.resetAt - Date.now() : 0;
}

function recordPinFailure(ip: string) {
  const entry = pinAttempts.get(ip);
  if (!entry || entry.resetAt < Date.now()) {
    pinAttempts.set(ip, { failures: 1, resetAt: Date.now() + PIN_WINDOW_MS });
  } else {
    entry.failures += 1;
  }
}

// ─── Generic tenant CRUD ──────────────────────────────────────────────

type TenantTable = typeof leads | typeof deals | typeof calendarEvents | typeof properties
  | typeof agentTasks | typeof expenses | typeof mileageEntries | typeof mlsConfigurations;

function registerTenantCrud(
  app: Express,
  path: string,
  table: TenantTable,
  createSchema: z.ZodTypeAny,
  opts: { orderBy?: any; label: string },
) {
  const t = table as any;
  const updateSchema = (createSchema as z.ZodObject<any>).partial();
  const order = opts.orderBy ?? desc(t.createdAt);

  app.get(path, requireAgent, async (req, res) => {
    const rows = await db.select().from(t).where(eq(t.agentId, uid(req))).orderBy(order);
    res.json(rows);
  });

  app.get(`${path}/:id`, requireAgent, async (req, res) => {
    const [row] = await db.select().from(t).where(and(eq(t.id, req.params.id as string), eq(t.agentId, uid(req))));
    if (!row) return res.status(404).json({ error: `${opts.label} not found` });
    res.json(row);
  });

  app.post(path, requireAgent, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const inserted = (await db.insert(t).values({ ...parsed.data, agentId: uid(req) } as any).returning()) as any[];
    const row = inserted[0];
    res.status(201).json(row);
  });

  const update = async (req: Request, res: Response) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const values: Record<string, unknown> = { ...parsed.data };
    if ("updatedAt" in t) values.updatedAt = new Date();
    const [row] = await db.update(t).set(values)
      .where(and(eq(t.id, req.params.id as string), eq(t.agentId, uid(req)))).returning();
    if (!row) return res.status(404).json({ error: `${opts.label} not found` });
    res.json(row);
  };
  app.put(`${path}/:id`, requireAgent, update);
  app.patch(`${path}/:id`, requireAgent, update);

  app.delete(`${path}/:id`, requireAgent, async (req, res) => {
    const [row] = await db.delete(t)
      .where(and(eq(t.id, req.params.id as string), eq(t.agentId, uid(req)))).returning();
    if (!row) return res.status(404).json({ error: `${opts.label} not found` });
    res.json({ success: true });
  });
}

// Coercion helpers (forms send strings)
const optStr = z.string().trim().max(5000).nullish();
const optNum = z.union([z.number(), z.string()]).nullish()
  .transform((v) => (v === null || v === undefined || v === "" ? null : Number(v)))
  .refine((v) => v === null || Number.isFinite(v), "Must be a number");
const optInt = optNum.transform((v) => (v === null ? null : Math.round(v)));
const jsonArray = z.union([z.array(z.string()), z.string()]).optional()
  .transform((v) => (v === undefined ? undefined : Array.isArray(v) ? JSON.stringify(v) : v));

const leadSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().default(""),
  email: optStr,
  phone: optStr,
  source: z.string().trim().default("Manual"),
  budget: optStr,
  score: optInt.transform((v) => (v === null ? 50 : Math.max(0, Math.min(100, v)))),
  temperature: z.enum(["hot", "warm", "cold"]).default("warm"),
  stage: z.enum(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"]).default("New"),
  propertyInterest: optStr,
  notes: optStr,
});

const dealSchema = z.object({
  propertyAddress: z.string().trim().min(1, "Property address is required"),
  clientName: z.string().trim().min(1, "Client name is required"),
  side: z.enum(["buyer", "seller", "dual"]).default("buyer"),
  stage: z.enum(["lead", "showing", "offer", "under_contract", "closing", "closed", "lost"]).default("lead"),
  price: optNum,
  commissionRate: optNum,
  closingDate: optStr,
  leadId: optStr,
  notes: optStr,
});

const eventSchema = z.object({
  type: z.enum(["Showing", "Open House", "Listing Appt", "Meeting", "Inspection"]).default("Showing"),
  title: optStr,
  address: optStr,
  clientName: optStr,
  startsAt: z.coerce.date(),
  durationMinutes: optInt.transform((v) => v ?? 60),
  notes: optStr,
});

const propertySchema = z.object({
  address: z.string().trim().min(1, "Address is required"),
  city: optStr,
  price: optNum,
  beds: optInt,
  baths: optNum,
  sqft: optInt,
  status: z.enum(["Active", "Under Contract", "Buyer Shortlist", "Sold"]).default("Active"),
  mls: optStr,
  imageUrl: optStr,
  description: optStr,
  features: jsonArray,
  showingCount: optInt.transform((v) => v ?? 0),
});

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  priority: z.enum(["High", "Medium", "Low", "Normal"]).default("Normal"),
  dueAt: optStr,
  completed: z.boolean().default(false),
});

const expenseSchema = z.object({
  category: z.string().trim().default("other"),
  description: z.string().trim().min(1, "Description is required"),
  amount: optNum.refine((v) => v !== null, "Amount is required"),
  vendor: optStr,
  date: z.string().trim().min(1, "Date is required"),
  notes: optStr,
  propertyAddress: optStr,
  receiptUrl: optStr,
  ocrData: optStr,
  transactionId: optStr,
});

const mileageSchema = z.object({
  date: z.string().trim().min(1, "Date is required"),
  startAddress: optStr,
  endAddress: optStr,
  miles: optNum.refine((v) => v !== null, "Miles is required"),
  purpose: z.string().trim().min(1, "Purpose is required"),
  category: z.string().trim().default("showing"),
  startLat: optNum,
  startLng: optNum,
  endLat: optNum,
  endLng: optNum,
  notes: optStr,
});

const mlsSchema = z.object({
  provider: z.string().trim().min(1, "Provider is required"),
  mlsBoardName: z.string().trim().min(1, "MLS board is required"),
  mlsAgentId: optStr,
  licenseNumber: optStr,
  apiKey: optStr,
  apiSecret: optStr,
  serverUrl: optStr,
  loginUrl: optStr,
  mediaUrl: optStr,
  status: z.string().trim().default("pending"),
  syncEnabled: z.boolean().default(false),
  notes: optStr,
});

// ─── Registration ─────────────────────────────────────────────────────

export function registerTenantRoutes(app: Express) {
  // Behind Coolify's proxy — needed for correct req.ip in the PIN rate limiter
  app.set("trust proxy", 1);

  // ── Owner portal ──
  app.get("/api/owner/status", (req, res) => {
    res.json({ unlocked: isOwnerSession(req), configured: ownerPins().length > 0 });
  });

  app.post("/api/owner/unlock", (req, res) => {
    const ip = req.ip || "unknown";
    const lockedMs = pinLockedOut(ip);
    if (lockedMs > 0) {
      return res.status(429).json({ error: `Too many attempts. Try again in ${Math.ceil(lockedMs / 60000)} min.` });
    }
    const pins = ownerPins();
    if (pins.length === 0) return res.status(503).json({ error: "Owner access is not configured" });

    const pin = String(req.body?.pin ?? "");
    const ok = pin.length > 0 && pins.some((p) => safeEqual(p, pin));
    if (!ok) {
      recordPinFailure(ip);
      return res.status(401).json({ error: "Invalid PIN" });
    }
    pinAttempts.delete(ip);
    req.session.ownerUntil = Date.now() + OWNER_SESSION_MS;
    req.session.save(() => res.json({ unlocked: true, expiresAt: req.session.ownerUntil }));
  });

  app.post("/api/owner/lock", (req, res) => {
    delete req.session.ownerUntil;
    req.session.save(() => res.json({ unlocked: false }));
  });

  app.get("/api/owner/business", requireOwner, async (_req, res) => {
    const now = Date.now();
    const d7 = new Date(now - 7 * 864e5);
    const d30 = new Date(now - 30 * 864e5);

    const [roleCounts, new7, new30, recent, pendingRequests, dailySignups, activity, closed] = await Promise.all([
      db.select({ role: users.role, n: count() }).from(users).groupBy(users.role),
      db.select({ n: count() }).from(users).where(gte(users.createdAt, d7)),
      db.select({ n: count() }).from(users).where(gte(users.createdAt, d30)),
      db.select({
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        email: users.email, role: users.role, brokerage: users.brokerage, createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt)).limit(15),
      db.select({ n: count() }).from(accessRequests).where(eq(accessRequests.status, "pending")),
      pool.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS n
           FROM users WHERE created_at >= $1 GROUP BY 1 ORDER BY 1`, [d30]),
      pool.query(`SELECT
          (SELECT COUNT(*) FROM leads)::int            AS leads,
          (SELECT COUNT(*) FROM deals)::int            AS deals,
          (SELECT COUNT(*) FROM documents)::int        AS documents,
          (SELECT COUNT(*) FROM message_threads)::int  AS threads,
          (SELECT COUNT(*) FROM thread_messages)::int  AS messages,
          (SELECT COUNT(*) FROM calendar_events)::int  AS events,
          (SELECT COUNT(DISTINCT agent_id) FROM leads WHERE created_at >= $1)::int AS active_agents_30d`, [d30]),
      pool.query(`SELECT COUNT(*)::int AS n, COALESCE(SUM(price), 0)::float AS volume FROM deals WHERE stage = 'closed'`),
    ]);

    const byRole: Record<string, number> = {};
    for (const r of roleCounts) byRole[r.role] = Number(r.n);
    const totalUsers = Object.values(byRole).reduce((a, b) => a + b, 0);
    const a = activity.rows[0] || {};

    res.json({
      users: {
        total: totalUsers,
        agents: byRole.agent || 0,
        clients: byRole.client || 0,
        vendors: byRole.vendor || 0,
        new7d: Number(new7[0]?.n ?? 0),
        new30d: Number(new30[0]?.n ?? 0),
        activeAgents30d: a.active_agents_30d || 0,
      },
      pendingAccessRequests: Number(pendingRequests[0]?.n ?? 0),
      signupsByDay: dailySignups.rows,
      platform: {
        leads: a.leads || 0,
        deals: a.deals || 0,
        documents: a.documents || 0,
        threads: a.threads || 0,
        messages: a.messages || 0,
        events: a.events || 0,
        closedDeals: closed.rows[0]?.n || 0,
        closedVolume: closed.rows[0]?.volume || 0,
      },
      recentSignups: recent,
      uptimeSeconds: process.uptime(),
      generatedAt: new Date().toISOString(),
    });
  });

  // ── Agent dashboard stats (per-agent, replaces PaintPros analytics) ──
  app.get("/api/analytics/dashboard", requireAgent, async (req, res) => {
    const agentId = uid(req);
    const d30 = new Date(Date.now() - 30 * 864e5);
    const r = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM leads WHERE agent_id = $1)::int AS total_leads,
         (SELECT COUNT(*) FROM leads WHERE agent_id = $1 AND created_at >= $2)::int AS new_leads_30d,
         (SELECT COUNT(*) FROM leads WHERE agent_id = $1 AND temperature = 'hot')::int AS hot_leads,
         (SELECT COUNT(*) FROM deals WHERE agent_id = $1 AND stage NOT IN ('closed','lost'))::int AS active_deals,
         (SELECT COUNT(*) FROM deals WHERE agent_id = $1 AND stage = 'closed')::int AS closed_deals,
         (SELECT COALESCE(SUM(price),0) FROM deals WHERE agent_id = $1 AND stage NOT IN ('closed','lost'))::float AS pipeline_value,
         (SELECT COALESCE(SUM(price * COALESCE(commission_rate,0) / 100),0) FROM deals WHERE agent_id = $1 AND stage = 'closed')::float AS commission_earned,
         (SELECT COUNT(*) FROM calendar_events WHERE agent_id = $1 AND starts_at >= now() AND starts_at < now() + interval '7 days')::int AS upcoming_events,
         (SELECT COUNT(*) FROM agent_tasks WHERE agent_id = $1 AND completed = false)::int AS open_tasks,
         (SELECT COUNT(*) FROM properties WHERE agent_id = $1 AND status = 'Active')::int AS active_listings`,
      [agentId, d30],
    );
    const s = r.rows[0];
    const conversion = s.total_leads > 0 ? Math.round((s.closed_deals / s.total_leads) * 100) : 0;

    // Per-period breakdown for the Analytics screen
    const [dealRows, leadRows, eventRows] = await Promise.all([
      pool.query(
        `SELECT property_address, price, commission_rate, stage, created_at, updated_at,
                CASE WHEN closing_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN closing_date::date ELSE updated_at::date END AS closed_on
           FROM deals WHERE agent_id = $1`, [agentId]),
      pool.query(`SELECT source, created_at FROM leads WHERE agent_id = $1`, [agentId]),
      pool.query(`SELECT starts_at FROM calendar_events WHERE agent_id = $1 AND type IN ('Showing','Open House')`, [agentId]),
    ]);
    const now = new Date();
    const startOf = (p: "month" | "quarter" | "year", offset = 0) => {
      const y = now.getFullYear(), m = now.getMonth();
      if (p === "month") return new Date(y, m - offset, 1);
      if (p === "quarter") return new Date(y, Math.floor(m / 3) * 3 - offset * 3, 1);
      return new Date(y - offset, 0, 1);
    };
    const commissionOf = (d: any) => (Number(d.price) || 0) * (Number(d.commission_rate) || 0) / 100;
    const closed = dealRows.rows.filter((d) => d.stage === "closed");
    const inRange = (t: Date | string, a: Date, b: Date) => { const x = new Date(t); return x >= a && x < b; };
    const pct = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0);

    const summarize = (a: Date, b: Date) => {
      const c = closed.filter((d) => inRange(d.closed_on, a, b));
      const revenue = c.reduce((sum, d) => sum + commissionOf(d), 0);
      const priced = c.filter((d) => Number(d.price) > 0);
      const avgSalePrice = priced.length ? priced.reduce((sum, d) => sum + Number(d.price), 0) / priced.length : 0;
      const avgDOM = c.length
        ? Math.round(c.reduce((sum, d) => sum + Math.max(0, (new Date(d.closed_on).getTime() - new Date(d.created_at).getTime()) / 864e5), 0) / c.length)
        : 0;
      return { c, revenue, avgSalePrice, avgDOM };
    };

    const buildPeriod = (p: "month" | "quarter" | "year") => {
      const a = startOf(p), b = new Date(8.64e15), prevA = startOf(p, 1);
      const cur = summarize(a, b), prev = summarize(prevA, a);
      const monthsBack = p === "year" ? 12 : 6;
      const revenueByMonth = Array.from({ length: monthsBack }, (_, i) => {
        const ms = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
        const me = new Date(ms.getFullYear(), ms.getMonth() + 1, 1);
        return {
          label: ms.toLocaleString("en-US", { month: "short" }),
          value: Math.round(closed.filter((d) => inRange(d.closed_on, ms, me)).reduce((sum, d) => sum + commissionOf(d), 0)),
        };
      });
      const periodLeads = leadRows.rows.filter((l) => inRange(l.created_at, a, b));
      const bySource = new Map<string, number>();
      for (const l of periodLeads) bySource.set(l.source || "Other", (bySource.get(l.source || "Other") || 0) + 1);
      return {
        closings: cur.c.length,
        revenue: Math.round(cur.revenue),
        avgSalePrice: Math.round(cur.avgSalePrice),
        avgDOM: cur.avgDOM,
        revenueByMonth,
        funnel: {
          leads: periodLeads.length,
          showings: eventRows.rows.filter((e) => inRange(e.starts_at, a, b)).length,
          offers: dealRows.rows.filter((d) => ["offer", "under_contract", "closing", "closed"].includes(d.stage) && inRange(d.created_at, a, b)).length,
          closings: cur.c.length,
        },
        sources: Array.from(bySource.entries()).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([name, value]) => ({ name, value })),
        recentClosings: cur.c
          .sort((x, y) => new Date(y.closed_on).getTime() - new Date(x.closed_on).getTime())
          .slice(0, 5)
          .map((d) => ({
            address: d.property_address,
            price: Number(d.price) || 0,
            date: new Date(d.closed_on).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            commission: Math.round(commissionOf(d)),
          })),
        vsLast: {
          closings: pct(cur.c.length, prev.c.length),
          revenue: pct(cur.revenue, prev.revenue),
          avgSalePrice: pct(cur.avgSalePrice, prev.avgSalePrice),
          avgDOM: pct(cur.avgDOM, prev.avgDOM),
        },
      };
    };

    res.json({
      totalLeads: s.total_leads,
      newLeads30d: s.new_leads_30d,
      hotLeads: s.hot_leads,
      activeDeals: s.active_deals,
      closedDeals: s.closed_deals,
      pipelineValue: s.pipeline_value,
      commissionEarned: s.commission_earned,
      upcomingEvents: s.upcoming_events,
      openTasks: s.open_tasks,
      activeListings: s.active_listings,
      conversionRate: conversion,
      periods: { month: buildPeriod("month"), quarter: buildPeriod("quarter"), year: buildPeriod("year") },
    });
  });

  // ── Agent data ──
  registerTenantCrud(app, "/api/leads", leads, leadSchema, { label: "Lead" });
  registerTenantCrud(app, "/api/deals", deals, dealSchema, { label: "Deal" });
  registerTenantCrud(app, "/api/calendar/events", calendarEvents, eventSchema, {
    label: "Event", orderBy: asc(calendarEvents.startsAt),
  });
  registerTenantCrud(app, "/api/properties", properties, propertySchema, { label: "Property" });
  registerTenantCrud(app, "/api/tasks", agentTasks, taskSchema, { label: "Task" });
  registerTenantCrud(app, "/api/expenses", expenses, expenseSchema, { label: "Expense" });
  registerTenantCrud(app, "/api/mileage", mileageEntries, mileageSchema, { label: "Mileage entry" });
  registerTenantCrud(app, "/api/mls/config", mlsConfigurations, mlsSchema, { label: "MLS configuration" });

  // ── Documents (real files, stored in Postgres) ──
  const MAX_UPLOAD = 25 * 1024 * 1024;
  const docColumns = {
    id: documents.id, name: documents.name, mimeType: documents.mimeType, sizeBytes: documents.sizeBytes,
    sha256: documents.sha256, status: documents.status, transactionLabel: documents.transactionLabel,
    dealId: documents.dealId, parties: documents.parties, version: documents.version,
    createdAt: documents.createdAt, updatedAt: documents.updatedAt,
  };

  app.get("/api/documents", requireAgent, async (req, res) => {
    const rows = await db.select(docColumns).from(documents)
      .where(eq(documents.agentId, uid(req))).orderBy(desc(documents.createdAt));
    res.json(rows);
  });

  app.post(
    "/api/documents",
    requireAgent,
    express.raw({ type: () => true, limit: MAX_UPLOAD }),
    async (req, res) => {
      const data = req.body as Buffer;
      if (!Buffer.isBuffer(data) || data.length === 0) return res.status(400).json({ error: "No file received" });
      const rawName = String(req.header("x-file-name") || "document");
      let name: string;
      try { name = decodeURIComponent(rawName); } catch { name = rawName; }
      name = name.replace(/[\\/\r\n]/g, "_").slice(0, 200) || "document";
      const label = req.header("x-transaction-label");
      const mimeType = (req.header("content-type") || "application/octet-stream").split(";")[0].slice(0, 120);
      const sha256 = crypto.createHash("sha256").update(data).digest("hex");

      const doc = await db.transaction(async (tx) => {
        const [row] = await tx.insert(documents).values({
          agentId: uid(req),
          name,
          mimeType,
          sizeBytes: data.length,
          sha256,
          transactionLabel: label ? decodeURIComponent(label).slice(0, 200) : null,
        }).returning(docColumns);
        await tx.insert(documentFiles).values({ documentId: row.id, data });
        return row;
      });
      res.status(201).json(doc);
    },
  );

  app.get("/api/documents/:id/download", requireAgent, async (req, res) => {
    const [doc] = await db.select(docColumns).from(documents)
      .where(and(eq(documents.id, req.params.id as string), eq(documents.agentId, uid(req))));
    if (!doc) return res.status(404).json({ error: "Document not found" });
    const [file] = await db.select().from(documentFiles).where(eq(documentFiles.documentId, doc.id));
    if (!file) return res.status(404).json({ error: "File missing" });
    const safeInline = /^(application\/pdf|image\/(png|jpe?g|gif|webp|heic)|text\/plain)$/i.test(doc.mimeType);
    const inline = req.query.inline === "1" && safeInline;
    if (!safeInline) res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Length", String(file.data.length));
    res.setHeader("Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(doc.name)}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(file.data);
  });

  const docUpdateSchema = z.object({
    name: z.string().trim().min(1).max(200).optional(),
    status: z.enum(["Pending", "Needs Review", "Signed", "Verified"]).optional(),
    transactionLabel: optStr,
    dealId: optStr,
    parties: jsonArray,
  });

  app.patch("/api/documents/:id", requireAgent, async (req, res) => {
    const parsed = docUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const [row] = await db.update(documents).set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(documents.id, req.params.id as string), eq(documents.agentId, uid(req))))
      .returning(docColumns);
    if (!row) return res.status(404).json({ error: "Document not found" });
    res.json(row);
  });

  app.delete("/api/documents/:id", requireAgent, async (req, res) => {
    const [row] = await db.delete(documents)
      .where(and(eq(documents.id, req.params.id as string), eq(documents.agentId, uid(req))))
      .returning({ id: documents.id });
    if (!row) return res.status(404).json({ error: "Document not found" });
    res.json({ success: true });
  });

  // ── Messaging (agent ↔ client) ──
  async function threadAccess(req: Request, threadId: string) {
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId));
    if (!thread) return null;
    const me = uid(req);
    if (thread.agentId === me) return { thread, role: "agent" as const };
    const email = (req.session.userEmail || "").toLowerCase();
    if (thread.clientUserId === me || (email && thread.clientEmail?.toLowerCase() === email)) {
      if (!thread.clientUserId) {
        await db.update(messageThreads).set({ clientUserId: me }).where(eq(messageThreads.id, thread.id));
      }
      return { thread, role: "client" as const };
    }
    return null;
  }

  app.get("/api/threads", requireAuth, async (req, res) => {
    const me = uid(req);
    const email = (req.session.userEmail || "").toLowerCase();
    const r = await pool.query(
      `SELECT t.*,
              CASE WHEN t.agent_id = $1 THEN 'agent' ELSE 'client' END AS my_role,
              (u.first_name || ' ' || u.last_name) AS agent_name,
              lm.body AS last_message, lm.created_at AS last_message_created_at,
              (SELECT COUNT(*)::int FROM thread_messages m
                 WHERE m.thread_id = t.id AND m.read_at IS NULL
                   AND m.sender_role <> CASE WHEN t.agent_id = $1 THEN 'agent' ELSE 'client' END) AS unread
         FROM message_threads t
         LEFT JOIN users u ON u.id = t.agent_id
         LEFT JOIN LATERAL (
           SELECT body, created_at FROM thread_messages WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1
         ) lm ON true
        WHERE t.agent_id = $1 OR t.client_user_id = $1 OR ($2 <> '' AND lower(t.client_email) = $2)
        ORDER BY t.last_message_at DESC`,
      [me, email],
    );
    res.json(r.rows.map((t) => ({
      id: t.id,
      myRole: t.my_role,
      name: t.my_role === "agent" ? t.client_name : (t.agent_name || "Your agent"),
      clientName: t.client_name,
      clientEmail: t.client_email,
      context: t.context,
      lastMessage: t.last_message || "",
      lastMessageAt: t.last_message_created_at || t.last_message_at,
      unread: t.unread,
    })));
  });

  const newThreadSchema = z.object({
    clientName: z.string().trim().min(1, "Client name is required"),
    clientEmail: z.string().trim().email("Valid client email is required"),
    context: optStr,
    message: z.string().trim().min(1).max(10000).optional(),
  });

  app.post("/api/threads", requireAgent, async (req, res) => {
    const parsed = newThreadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    const { clientName, clientEmail, context, message } = parsed.data;
    const email = clientEmail.toLowerCase();
    const [client] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`);

    const thread = await db.transaction(async (tx) => {
      const [t] = await tx.insert(messageThreads).values({
        agentId: uid(req), clientName, clientEmail: email, context: context ?? null,
        clientUserId: client?.id ?? null,
      }).returning();
      if (message) {
        await tx.insert(threadMessages).values({
          threadId: t.id, senderUserId: uid(req), senderRole: "agent", body: message,
        });
      }
      return t;
    });
    res.status(201).json(thread);
  });

  app.get("/api/threads/:id/messages", requireAuth, async (req, res) => {
    const access = await threadAccess(req, req.params.id as string);
    if (!access) return res.status(404).json({ error: "Conversation not found" });
    const rows = await db.select().from(threadMessages)
      .where(eq(threadMessages.threadId, access.thread.id)).orderBy(asc(threadMessages.createdAt));
    // Mark the other side's messages as read
    await db.update(threadMessages).set({ readAt: new Date() }).where(and(
      eq(threadMessages.threadId, access.thread.id),
      ne(threadMessages.senderRole, access.role),
      isNull(threadMessages.readAt),
    ));
    res.json({
      thread: { id: access.thread.id, clientName: access.thread.clientName, context: access.thread.context },
      myRole: access.role,
      messages: rows.map((m) => ({
        id: m.id, body: m.body, createdAt: m.createdAt, mine: m.senderUserId === uid(req), readAt: m.readAt,
      })),
    });
  });

  app.post("/api/threads/:id/messages", requireAuth, async (req, res) => {
    const body = String(req.body?.body ?? "").trim();
    if (!body) return res.status(400).json({ error: "Message is empty" });
    if (body.length > 10000) return res.status(400).json({ error: "Message is too long" });
    const access = await threadAccess(req, req.params.id as string);
    if (!access) return res.status(404).json({ error: "Conversation not found" });
    const [msg] = await db.insert(threadMessages).values({
      threadId: access.thread.id, senderUserId: uid(req), senderRole: access.role, body,
    }).returning();
    await db.update(messageThreads).set({ lastMessageAt: new Date() }).where(eq(messageThreads.id, access.thread.id));
    res.status(201).json({ id: msg.id, body: msg.body, createdAt: msg.createdAt, mine: true, readAt: null });
  });

  app.delete("/api/threads/:id", requireAgent, async (req, res) => {
    const [row] = await db.delete(messageThreads)
      .where(and(eq(messageThreads.id, req.params.id as string), eq(messageThreads.agentId, uid(req))))
      .returning({ id: messageThreads.id });
    if (!row) return res.status(404).json({ error: "Conversation not found" });
    res.json({ success: true });
  });

  // Unread badge count for the header
  app.get("/api/threads/unread-count", requireAuth, async (req, res) => {
    const me = uid(req);
    const email = (req.session.userEmail || "").toLowerCase();
    const r = await pool.query(
      `SELECT COUNT(*)::int AS n FROM thread_messages m JOIN message_threads t ON t.id = m.thread_id
        WHERE m.read_at IS NULL AND m.sender_user_id <> $1
          AND (t.agent_id = $1 OR t.client_user_id = $1 OR ($2 <> '' AND lower(t.client_email) = $2))`,
      [me, email],
    );
    res.json({ unread: r.rows[0]?.n ?? 0 });
  });
}
