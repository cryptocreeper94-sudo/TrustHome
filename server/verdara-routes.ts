import type { Express, Request, Response } from "express";
import * as crypto from "crypto";
import {
  verdaraIsConfigured,
  verdaraStatus,
  verdaraIdentify,
  verdaraRemovalPlan,
  verdaraAssess,
  verdaraGetSpecies,
} from "./verdara-client";
import { getDarkWaveHeaders } from "./ecosystem-client";

export function registerVerdaraRoutes(app: Express) {

  app.get("/api/verdara/status", async (_req: Request, res: Response) => {
    try {
      if (!verdaraIsConfigured()) {
        return res.json({
          connected: false,
          message: "Verdara integration pending — awaiting API credentials",
        });
      }
      const result = await verdaraStatus();
      return res.json({
        connected: !result.error,
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/verdara/identify", async (req: Request, res: Response) => {
    try {
      if (!verdaraIsConfigured()) {
        return res.status(503).json({ error: "Verdara integration not configured" });
      }
      const { imageData, location } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "imageData is required" });
      }
      const result = await verdaraIdentify(imageData, location);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/verdara/removal-plan", async (req: Request, res: Response) => {
    try {
      if (!verdaraIsConfigured()) {
        return res.status(503).json({ error: "Verdara integration not configured" });
      }
      const { propertyAddress, treeIds } = req.body;
      if (!propertyAddress || !treeIds) {
        return res.status(400).json({ error: "propertyAddress and treeIds are required" });
      }
      const result = await verdaraRemovalPlan(propertyAddress, treeIds);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/verdara/assess", async (req: Request, res: Response) => {
    try {
      if (!verdaraIsConfigured()) {
        return res.status(503).json({ error: "Verdara integration not configured" });
      }
      const { propertyAddress, agentId } = req.body;
      if (!propertyAddress) {
        return res.status(400).json({ error: "propertyAddress is required" });
      }
      const result = await verdaraAssess(propertyAddress, agentId || "demo");
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/verdara/species/:id", async (req: Request, res: Response) => {
    try {
      if (!verdaraIsConfigured()) {
        return res.status(503).json({ error: "Verdara integration not configured" });
      }
      const speciesId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const result = await verdaraGetSpecies(speciesId);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/ecosystem/widget-config", async (_req: Request, res: Response) => {
    try {
      const headers = getDarkWaveHeaders();
      const response = await fetch("https://dwsc.io/api/ecosystem/widget-data", {
        method: "GET",
        headers,
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return res.json({
          widgetUrl: "https://dwsc.io/api/ecosystem/widget.js",
          available: false,
          message: "Widget data endpoint not yet available",
        });
      }
      const data = await response.json();
      return res.json({
        widgetUrl: "https://dwsc.io/api/ecosystem/widget.js",
        available: true,
        ...data,
      });
    } catch (error) {
      return res.json({
        widgetUrl: "https://dwsc.io/api/ecosystem/widget.js",
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/ecosystem/incoming", async (req: Request, res: Response) => {
    try {
      const authHeader = req.header("Authorization") || "";
      const match = authHeader.match(/^DW (.+):(\d+):([a-f0-9]+)$/);
      if (!match) {
        return res.status(401).json({ error: "Invalid authorization header" });
      }
      const [, incomingKey, timestamp, incomingSignature] = match;

      const age = Date.now() - parseInt(timestamp);
      if (age > 300000) {
        return res.status(401).json({ error: "Request expired" });
      }

      const knownApps: Record<string, { secret: string; name: string }> = {};

      if (process.env.VERDARA_API_KEY && process.env.VERDARA_API_SECRET) {
        knownApps[process.env.VERDARA_API_KEY] = {
          secret: process.env.VERDARA_API_SECRET,
          name: "Verdara",
        };
      }

      const app = knownApps[incomingKey];
      if (!app) {
        return res.status(401).json({ error: "Unknown API key" });
      }

      const expectedSignature = crypto
        .createHmac("sha256", app.secret)
        .update(`${timestamp}:${incomingKey}`)
        .digest("hex");

      if (incomingSignature !== expectedSignature) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const { action, data } = req.body;
      console.log(`Ecosystem incoming from ${app.name}: action=${action}`);

      return res.json({
        received: true,
        app: "TrustHome",
        appId: "dw_app_trusthome",
        action,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/ecosystem/status", async (_req: Request, res: Response) => {
    const apps: Record<string, any> = {
      trustLayer: {
        configured: !!(process.env.TRUSTLAYER_API_KEY && process.env.TRUSTLAYER_API_SECRET),
        url: "https://dwsc.io",
      },
      paintPros: {
        configured: !!(process.env.ORBIT_ECOSYSTEM_API_KEY && process.env.ORBIT_ECOSYSTEM_API_SECRET),
        url: "https://paintpros.io",
      },
      verdara: {
        configured: verdaraIsConfigured(),
        url: process.env.VERDARA_BASE_URL || null,
      },
      widget: {
        url: "https://dwsc.io/api/ecosystem/widget.js",
        dataUrl: "https://dwsc.io/api/ecosystem/widget-data",
      },
    };

    return res.json({
      app: "TrustHome",
      appId: "dw_app_trusthome",
      ecosystem: "DarkWave Trust Layer",
      connections: apps,
    });
  });
}
