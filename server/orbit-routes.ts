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

export function registerOrbitRoutes(app: Express) {
  app.get("/api/orbit/status", async (_req: Request, res: Response) => {
    try {
      const status = await orbitTrustHome.checkConnection();
      res.json({ connected: true, ...status });
    } catch (err: any) {
      res.json({ connected: false, error: err.message });
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

  console.log("[ORBIT] Routes registered: /api/orbit/*, /webhooks/orbit");
}
