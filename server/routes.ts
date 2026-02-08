import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import {
  ecosystemGet,
  ecosystemPost,
  ecosystemPut,
  ecosystemDelete,
  getTenantId,
} from "./ecosystem-client";
import { setupSocketProxy } from "./socket-proxy";
import {
  tlSyncUser,
  tlSyncPassword,
  tlVerifyCredentials,
  tlGetCertificationTiers,
  tlSubmitCertification,
  tlGetCertificationStatus,
  tlGetPublicRegistry,
  tlGetBlockchainStamps,
  tlCheckoutCertification,
  tlIsConfigured,
} from "./trustlayer-client";

export async function registerRoutes(app: Express): Promise<Server> {

  // ─── Health Check ───────────────────────────────────────────────────
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", tenantId: getTenantId(), connected: true });
  });

  // ─── CRM & Leads ───────────────────────────────────────────────────
  app.get("/api/leads", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/leads", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/leads", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/leads", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/leads/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPut(`/leads/${req.params.id}`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/crm/deals", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/crm/deals", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/crm/deals/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPut(`/crm/deals/${req.params.id}`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/crm/activities", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/crm/activities", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/leads/score", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/leads/score", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/leads/score-ai", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/leads/score-ai", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/lead-sources", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/lead-sources", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Calendar ──────────────────────────────────────────────────────
  app.get("/api/calendar/events", async (req: Request, res: Response) => {
    try {
      const params: Record<string, string> = {};
      if (req.query.startDate) params.startDate = req.query.startDate as string;
      if (req.query.endDate) params.endDate = req.query.endDate as string;
      const data = await ecosystemGet("/calendar/events", params);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/calendar/events", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/calendar/events", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/calendar/events/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPut(`/calendar/events/${req.params.id}`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/calendar/events/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemDelete(`/calendar/events/${req.params.id}`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Bookings ──────────────────────────────────────────────────────
  app.get("/api/bookings", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/bookings", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/bookings", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPut(`/bookings/${req.params.id}`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.patch("/api/bookings/:id/status", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost(`/bookings/${req.params.id}/status`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/availability", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/availability/${getTenantId()}`, _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Jobs ──────────────────────────────────────────────────────────
  app.get("/api/jobs", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/jobs", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/jobs/${req.params.id}`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/jobs", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/jobs", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPut(`/jobs/${req.params.id}`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/jobs/:id/updates", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/jobs/${req.params.id}/updates`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/jobs/:id/updates", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost(`/jobs/${req.params.id}/updates`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Marketing ─────────────────────────────────────────────────────
  app.get("/api/marketing/images", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/marketing/images/${getTenantId()}`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/marketing/images", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/marketing/images", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/marketing/posts", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/marketing/posts/${getTenantId()}`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/marketing/posts", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/marketing/posts", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/marketing/live-posts", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/marketing/${getTenantId()}/live-posts`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/marketing/quick-post", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost(`/marketing/${getTenantId()}/quick-post`, req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/marketing/generate-captions", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/marketing-autopilot/generate-captions", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Analytics ─────────────────────────────────────────────────────
  app.get("/api/analytics/dashboard", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/analytics/dashboard", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/analytics/live", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/analytics/live", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/analytics/geography", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/analytics/geography", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Blockchain ────────────────────────────────────────────────────
  app.post("/api/blockchain/stamp", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/blockchain/stamp", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/blockchain/hash", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/blockchain/hash", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/blockchain/stamps", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/blockchain/stamps", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/blockchain/wallet/balance", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/blockchain/wallet/balance", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Messaging ─────────────────────────────────────────────────────
  app.post("/api/messages/send-message", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/messages/send-message", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/messages/online-users", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/messages/online-users", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Auth ──────────────────────────────────────────────────────────
  app.post("/api/auth/pin/verify", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/auth/pin/verify", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/auth/login", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Payments ──────────────────────────────────────────────────────
  app.get("/api/payments", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/payments", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/payments/:id", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/payments/${req.params.id}`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Referrals ─────────────────────────────────────────────────────
  app.get("/api/referrals", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/referrals", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/referrals", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/referrals", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Subcontractors ────────────────────────────────────────────────
  app.get("/api/subcontractors", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/subcontractors", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Webhooks ──────────────────────────────────────────────────────
  app.get("/api/webhooks", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet("/webhooks", _req.query as Record<string, string>);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/webhooks", async (req: Request, res: Response) => {
    try {
      const data = await ecosystemPost("/webhooks", req.body);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Tenant ────────────────────────────────────────────────────────
  app.get("/api/tenant", async (_req: Request, res: Response) => {
    try {
      const data = await ecosystemGet(`/tenants/${getTenantId()}`);
      if (data.error) return res.status(500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Trust Layer (DWTL) ─────────────────────────────────────────────

  app.get("/api/trustlayer/status", (_req: Request, res: Response) => {
    res.json({
      configured: tlIsConfigured(),
      baseUrl: "https://dwsc.io",
      service: "DarkWave Trust Layer",
    });
  });

  app.post("/api/trustlayer/sync-user", async (req: Request, res: Response) => {
    try {
      const { email, password, displayName, username } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const data = await tlSyncUser(email, password, displayName, username);
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/trustlayer/sync-password", async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and newPassword are required" });
      }
      const data = await tlSyncPassword(email, newPassword);
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/trustlayer/verify-credentials", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const data = await tlVerifyCredentials(email, password);
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/trustlayer/tiers", async (_req: Request, res: Response) => {
    try {
      const data = await tlGetCertificationTiers();
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/trustlayer/certifications", async (req: Request, res: Response) => {
    try {
      const { projectName, projectUrl, contactEmail, tier, stripePaymentId } = req.body;
      if (!projectName || !contactEmail || !tier) {
        return res.status(400).json({ error: "projectName, contactEmail, and tier are required" });
      }
      const data = await tlSubmitCertification({ projectName, projectUrl, contactEmail, tier, stripePaymentId });
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/trustlayer/certifications/:id", async (req: Request, res: Response) => {
    try {
      const data = await tlGetCertificationStatus(req.params.id);
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/trustlayer/registry", async (_req: Request, res: Response) => {
    try {
      const data = await tlGetPublicRegistry();
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/trustlayer/stamps", async (req: Request, res: Response) => {
    try {
      const referenceId = req.query.referenceId as string;
      if (!referenceId) {
        return res.status(400).json({ error: "referenceId query parameter is required" });
      }
      const data = await tlGetBlockchainStamps(referenceId);
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/trustlayer/checkout", async (req: Request, res: Response) => {
    try {
      const { tier, projectName, projectUrl, contactEmail, contractCount } = req.body;
      if (!tier || !projectName || !contactEmail) {
        return res.status(400).json({ error: "tier, projectName, and contactEmail are required" });
      }
      const data = await tlCheckoutCertification({ tier, projectName, projectUrl, contactEmail, contractCount });
      if (data.error) return res.status(data.status || 500).json(data);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);

  setupSocketProxy(httpServer);

  return httpServer;
}
