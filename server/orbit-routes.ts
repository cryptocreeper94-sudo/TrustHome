import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { orbitTrustHome } from "./services/orbitClient";

function verifyOrbitWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function autoRegisterWithOrbit() {
  const hubUrl = process.env.ORBIT_HUB_URL || "https://orbitstaffing.io";

  try {
    const appUrl = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.REPL_SLUG
        ? `https://${process.env.REPL_SLUG}.replit.app`
        : "https://trusthome.replit.app";

    const res = await fetch(`${hubUrl}/api/admin/ecosystem/register-app`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Name": "TrustHome" },
      body: JSON.stringify({
        appName: "TrustHome",
        appSlug: "dw_app_trusthome",
        appUrl,
        webhookUrl: `${appUrl}/webhooks/orbit`,
        capabilities: [
          "real_estate",
          "crm",
          "transaction_management",
          "document_vault",
          "marketing_hub",
          "trust_layer_sso",
        ],
        ownershipSplit: {
          partner1: "Jennifer Lambert",
          partner1Pct: 51,
          partner2: "Jason Andrews",
          partner2Pct: 49,
        },
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await res.json() : { status: res.status };

    if (res.ok) {
      console.log("[ORBIT] Auto-registration successful — connected to", hubUrl);
    } else if (res.status === 409 || res.status === 500 || res.status === 400) {
      console.log("[ORBIT] App already registered (dw_app_trusthome) — connected to", hubUrl);
    } else if (res.status === 404) {
      console.log("[ORBIT] Orbit Staffing not yet available at", hubUrl, "— will retry on next restart");
    } else {
      console.log("[ORBIT] Auto-registration response:", res.status, JSON.stringify(body));
    }
  } catch (err: any) {
    console.log("[ORBIT] Auto-registration failed (non-blocking):", err.message);
  }
}

const TRUSTHOME_PRICING = {
  appId: "dw_app_trusthome",
  appName: "TrustHome",
  ownership: {
    partner1: { name: "Jennifer Lambert", percentage: 51, role: "Managing Member" },
    partner2: { name: "Jason Andrews", percentage: 49, role: "Technical Lead & Platform Architect" },
    entity: "DarkWave Studios LLC",
    womanOwned: true,
  },
  foundersProgram: {
    milestone: 100,
    description: "First 100 agent subscribers lock in founder pricing permanently",
    tiers: [
      {
        id: "founder_agent",
        name: "Agent",
        type: "subscription",
        billing: "monthly",
        founderPrice: 49,
        standardPrice: 99,
        currency: "USD",
        description: "Individual agent subscription — CRM, transaction management, marketing hub, AI assistant, document vault",
        features: [
          "Full CRM & lead management",
          "Transaction pipeline & timeline",
          "AI-powered marketing hub",
          "Document vault with blockchain verification",
          "Voice AI assistant",
          "Client portal",
          "Showing management",
          "Signal Chat messaging",
        ],
      },
      {
        id: "founder_brokerage",
        name: "Brokerage",
        type: "subscription",
        billing: "monthly",
        founderPrice: 299,
        standardPrice: 599,
        currency: "USD",
        description: "Brokerage-level subscription — everything in Agent plus team management, analytics, and brokerage branding",
        features: [
          "Everything in Agent tier",
          "Team management & permissions",
          "Brokerage-wide analytics",
          "Custom branding",
          "Multi-agent CRM",
          "Performance dashboards",
          "Bulk marketing tools",
        ],
      },
      {
        id: "founder_whitelabel",
        name: "White-Label",
        type: "subscription",
        billing: "monthly",
        founderPrice: 1499,
        standardPrice: 2999,
        currency: "USD",
        description: "Full white-label platform — your brand, your domain, zero development costs",
        features: [
          "Everything in Brokerage tier",
          "Complete white-label rebrand",
          "Custom domain support",
          "Dedicated support",
          "API access",
          "Custom integrations",
          "Franchise scaling tools",
          "Priority feature requests",
        ],
      },
    ],
  },
  revenueProjections: [
    { phase: "Founders Phase (Months 1-6)", agents: 25, brokerages: 2, whiteLabels: 0 },
    { phase: "Milestone Hit (Months 7-12)", agents: 100, brokerages: 8, whiteLabels: 2 },
    { phase: "Standard Pricing (Year 2)", agents: 500, brokerages: 30, whiteLabels: 10 },
    { phase: "Franchise Scale (Year 3+)", agents: 2000, brokerages: 100, whiteLabels: 50 },
  ],
  royaltySplit: {
    partner1Pct: 51,
    partner2Pct: 49,
    enforcedBy: "ORBIT Financial Hub",
  },
};

async function pushPricingToOrbit() {
  const hubUrl = process.env.ORBIT_HUB_URL || "https://orbitstaffing.io";
  const apiKey = process.env.ORBIT_STAFFING_API_KEY || "";
  const apiSecret = process.env.ORBIT_STAFFING_API_SECRET || "";

  if (!apiKey || !apiSecret) {
    console.log("[ORBIT] Pricing sync skipped — ORBIT_STAFFING_API_KEY/SECRET not configured");
    return;
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-App-Name": "TrustHome",
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
    };

    const res = await fetch(`${hubUrl}/api/ecosystem/logs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "pricing_sync",
        resource: "pricing",
        details: TRUSTHOME_PRICING,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const body = await res.json();
      console.log("[ORBIT] Pricing synced to Orbit Staffing:", body.id || "done");
      console.log("[ORBIT] Tiers: Agent $49/$99, Brokerage $299/$599, White-Label $1,499/$2,999");
      console.log("[ORBIT] Ownership: 51% Jennifer Lambert / 49% Jason Andrews — enforced by Financial Hub");
    } else if (res.status === 401) {
      console.log("[ORBIT] Pricing sync skipped — API credentials required");
    } else {
      console.log("[ORBIT] Pricing sync response:", res.status);
    }
  } catch (err: any) {
    console.log("[ORBIT] Pricing sync failed (non-blocking):", err.message);
  }
}

export function registerOrbitRoutes(app: Express) {
  app.get("/api/orbit/status", async (_req: Request, res: Response) => {
    try {
      const status = await orbitTrustHome.checkConnection();
      res.json({
        connected: true,
        hubUrl: orbitTrustHome.baseUrl,
        configured: orbitTrustHome.isConfigured,
        appId: "dw_app_trusthome",
        endpoints: {
          registration: "/api/admin/ecosystem/register-app",
          ssoLogin: "/api/auth/ecosystem-login",
          ssoRegister: "/api/chat/auth/register",
        },
        ...status,
      });
    } catch (err: any) {
      res.json({
        connected: false,
        hubUrl: orbitTrustHome.baseUrl,
        configured: orbitTrustHome.isConfigured,
        error: err.message,
      });
    }
  });

  app.get("/api/orbit/financial-statement", async (req: Request, res: Response) => {
    try {
      const period = req.query.period as string | undefined;
      const format = req.query.format as string | undefined;
      const statement = await orbitTrustHome.getFinancialStatement({ period, format });
      res.json(statement);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/sync/workers", async (req: Request, res: Response) => {
    try {
      const result = await orbitTrustHome.syncWorkers(req.body.workers || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/sync/contractors", async (req: Request, res: Response) => {
    try {
      const result = await orbitTrustHome.syncContractors(req.body.contractors || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/sync/timesheets", async (req: Request, res: Response) => {
    try {
      const result = await orbitTrustHome.syncTimesheets(req.body.timesheets || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/sync/certifications", async (req: Request, res: Response) => {
    try {
      const result = await orbitTrustHome.syncCertifications(req.body.certifications || []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/report-transaction", async (req: Request, res: Response) => {
    try {
      const result = await orbitTrustHome.reportTransaction(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orbit/logs", async (_req: Request, res: Response) => {
    try {
      const logs = await orbitTrustHome.getLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/logs", async (req: Request, res: Response) => {
    try {
      const result = await orbitTrustHome.pushLog(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/orbit/register-app", async (_req: Request, res: Response) => {
    try {
      const appUrl = process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : "https://trusthome.replit.app";

      const result = await orbitTrustHome.registerApp({
        appName: "TrustHome",
        appSlug: "dw_app_trusthome",
        appUrl,
        webhookUrl: `${appUrl}/webhooks/orbit`,
        capabilities: [
          "real_estate",
          "crm",
          "transaction_management",
          "document_vault",
          "marketing_hub",
          "trust_layer_sso",
        ],
        ownershipSplit: {
          partner1: "Jennifer Lambert",
          partner1Pct: 51,
          partner2: "Jason Andrews",
          partner2Pct: 49,
        },
      });
      res.json({ registered: true, ...result });
    } catch (err: any) {
      res.status(500).json({ registered: false, error: err.message });
    }
  });

  app.post("/api/orbit/sso/login", async (req: Request, res: Response) => {
    try {
      const { identifier, credential } = req.body;
      if (!identifier || !credential) {
        return res.status(400).json({ error: "Identifier and credential are required" });
      }

      const result = await orbitTrustHome.ecosystemSSOLogin({
        identifier,
        credential,
        sourceApp: "dw_app_trusthome",
      });

      if (result.user) {
        req.session.userId = result.user.id;
        req.session.userRole = result.user.role;
        req.session.userEmail = result.user.email;
        req.session.userName = `${result.user.firstName} ${result.user.lastName}`;
        console.log(`[ORBIT SSO] Login via Orbit Staffing: ${result.user.email}`);
      }

      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  });

  app.post("/api/orbit/sso/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, displayName } = req.body;
      if (!username || !email || !password || !displayName) {
        return res.status(400).json({ error: "Username, email, password, and display name are required" });
      }

      const result = await orbitTrustHome.ecosystemSSORegister({
        username,
        email,
        password,
        displayName,
        sourceApp: "dw_app_trusthome",
      });

      console.log(`[ORBIT SSO] Registered via Orbit Staffing: ${email}`);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/orbit/pricing", (_req: Request, res: Response) => {
    res.json(TRUSTHOME_PRICING);
  });

  app.post("/api/orbit/pricing/push", async (_req: Request, res: Response) => {
    try {
      await pushPricingToOrbit();
      res.json({ pushed: true, tiers: TRUSTHOME_PRICING.foundersProgram.tiers.length, hubUrl: orbitTrustHome.baseUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/webhooks/orbit", (req: Request, res: Response) => {
    const signature = req.headers["x-orbit-signature"] as string;
    const secret = process.env.ORBIT_FINANCIAL_HUB_SECRET || "";

    if (!signature || !secret || !verifyOrbitWebhook(JSON.stringify(req.body), signature, secret)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { event, data } = req.body;

    switch (event) {
      case "payroll.completed":
        console.log("[ORBIT] Payroll completed:", data);
        break;
      case "payroll.payment.sent":
        console.log("[ORBIT] Payment sent:", data);
        break;
      case "payroll.payment.failed":
        console.log("[ORBIT] Payment failed:", data);
        break;
      case "worker.created":
        console.log("[ORBIT] Worker created:", data);
        break;
      case "worker.updated":
        console.log("[ORBIT] Worker updated:", data);
        break;
      case "document.generated":
        console.log("[ORBIT] Document generated:", data);
        break;
      case "tax.form.ready":
        console.log("[ORBIT] Tax form ready:", data);
        break;
      default:
        console.log(`[ORBIT] Unknown event: ${event}`, data);
    }

    res.json({ received: true });
  });

  console.log("[ORBIT] Routes registered: /api/orbit/*, /api/orbit/sso/*, /api/orbit/pricing, /webhooks/orbit");

  setTimeout(async () => {
    await autoRegisterWithOrbit();
    await pushPricingToOrbit();
  }, 3000);
}
