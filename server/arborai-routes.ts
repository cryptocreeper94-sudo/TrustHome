import type { Express, Request, Response } from "express";
import * as crypto from "crypto";
import {
  arboraiIsConfigured,
  arboraiStatus,
  arboraiIdentify,
  arboraiRemovalPlan,
  arboraiAssess,
  arboraiGetSpecies,
} from "./arborai-client";
import { getDarkWaveHeaders } from "./ecosystem-client";

export function registerArborAiRoutes(app: Express) {

  app.get("/api/arborai/status", async (_req: Request, res: Response) => {
    try {
      if (!arboraiIsConfigured()) {
        return res.json({
          connected: false,
          message: "ArborAI integration pending — awaiting API credentials",
        });
      }
      const result = await arboraiStatus();
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

  app.post("/api/arborai/identify", async (req: Request, res: Response) => {
    try {
      if (!arboraiIsConfigured()) {
        return res.status(503).json({ error: "ArborAI integration not configured" });
      }
      const { imageData, location } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "imageData is required" });
      }
      const result = await arboraiIdentify(imageData, location);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/arborai/removal-plan", async (req: Request, res: Response) => {
    try {
      if (!arboraiIsConfigured()) {
        return res.status(503).json({ error: "ArborAI integration not configured" });
      }
      const { propertyAddress, treeIds } = req.body;
      if (!propertyAddress || !treeIds) {
        return res.status(400).json({ error: "propertyAddress and treeIds are required" });
      }
      const result = await arboraiRemovalPlan(propertyAddress, treeIds);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/arborai/assess", async (req: Request, res: Response) => {
    try {
      if (!arboraiIsConfigured()) {
        return res.status(503).json({ error: "ArborAI integration not configured" });
      }
      const { propertyAddress, agentId } = req.body;
      if (!propertyAddress) {
        return res.status(400).json({ error: "propertyAddress is required" });
      }
      const result = await arboraiAssess(propertyAddress, agentId || "demo");
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/arborai/species/:id", async (req: Request, res: Response) => {
    try {
      if (!arboraiIsConfigured()) {
        return res.status(503).json({ error: "ArborAI integration not configured" });
      }
      const speciesId = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const result = await arboraiGetSpecies(speciesId);
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

      if (process.env.ARBORAI_API_KEY && process.env.ARBORAI_API_SECRET) {
        knownApps[process.env.ARBORAI_API_KEY] = {
          secret: process.env.ARBORAI_API_SECRET,
          name: "ArborAI",
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
      arborAI: {
        configured: arboraiIsConfigured(),
        url: process.env.ARBORAI_BASE_URL || null,
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
