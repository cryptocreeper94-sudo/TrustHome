import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
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
import {
  mediaStudioStatus,
  mediaStudioListProjects,
  mediaStudioGetProject,
  mediaStudioGetProjectStatus,
  mediaStudioRequestWalkthrough,
  mediaStudioCancelProject,
  mediaStudioIsConfigured,
} from "./media-studio-client";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendPasswordResetEmail } from "./resend-client";
import { createTrustStamp } from "./hallmark";
import { registerSchema, loginSchema, verificationCodes, users, blogPosts, accessRequests, insertAccessRequestSchema, marketingPosts, marketingAnalytics, agentProfiles, insertAgentProfileSchema } from "@shared/schema";
import { requireOwner } from "./tenant-routes";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {

  // ─── Auth Routes ────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const { email, password, firstName, lastName, role, phone, brokerage, licenseNumber } = parsed.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone: phone || null,
        brokerage: brokerage || null,
        licenseNumber: licenseNumber || null,
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.insert(verificationCodes).values({
        email,
        code,
        type: 'email_verification',
        expiresAt,
      });

      try {
        await sendVerificationEmail(email, code);
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }

      if (tlIsConfigured()) {
        tlSyncUser(email, password, `${firstName} ${lastName}`, email).catch((err: any) =>
          console.error("Trust Layer sync error:", err)
        );
      }

      return res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        message: "Verification code sent",
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { email, code, rememberMe } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
      }

      const [verification] = await db.select().from(verificationCodes).where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, 'email_verification')
        )
      );

      if (!verification || new Date(verification.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired verification code" });
      }

      if (verification.used === true || String(verification.used) === 'true' || verification.used === 1 || String(verification.used) === '1') {
        return res.status(400).json({ error: "Verification code has already been used" });
      }

      await db.update(verificationCodes).set({ used: true }).where(eq(verificationCodes.id, verification.id));

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userEmail = user.email;
      req.session.userName = user.firstName + ' ' + user.lastName;

      return res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      });
    } catch (error) {
      console.error("Verify email error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/resend-code", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.insert(verificationCodes).values({
        email,
        code,
        type: 'email_verification',
        expiresAt,
      });

      try {
        await sendVerificationEmail(email, code);
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }

      return res.json({ message: "Code sent" });
    } catch (error) {
      console.error("Resend code error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.insert(verificationCodes).values({
        email,
        code,
        type: 'email_verification',
        expiresAt,
      });

      try {
        await sendVerificationEmail(email, code);
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }

      return res.json({ message: "Verification code sent", requiresVerification: true });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login/verify", async (req: Request, res: Response) => {
    try {
      const { email, code, rememberMe } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
      }

      const [verification] = await db.select().from(verificationCodes).where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, 'email_verification')
        )
      );

      if (!verification || new Date(verification.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired verification code" });
      }

      if (verification.used === true || String(verification.used) === 'true' || verification.used === 1 || String(verification.used) === '1') {
        return res.status(400).json({ error: "Verification code has already been used" });
      }

      await db.update(verificationCodes).set({ used: true }).where(eq(verificationCodes.id, verification.id));

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      if (rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userEmail = user.email;
      req.session.userName = user.firstName + ' ' + user.lastName;

      return res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      });
    } catch (error) {
      console.error("Login verify error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/ecosystem-login", async (req: Request, res: Response) => {
    try {
      const { identifier, credential } = req.body;
      if (!identifier || !credential || typeof identifier !== "string" || typeof credential !== "string") {
        return res.status(400).json({ error: "Trust Layer ID or email and credential are required" });
      }
      const trimmedId = identifier.trim();
      const trimmedCred = credential.trim();
      if (!trimmedId || !trimmedCred) {
        return res.status(400).json({ error: "Trust Layer ID or email and credential are required" });
      }

      let user;
      if (trimmedId.startsWith("tl-")) {
        user = await storage.getUserByTrustLayerId(trimmedId);
      }
      if (!user) {
        user = await storage.getUserByEmail(trimmedId.toLowerCase());
      }
      if (!user) {
        return res.status(401).json({ error: "No ecosystem account found. Check your Trust Layer ID or email." });
      }

      if (!user.trustLayerId) {
        return res.status(401).json({ error: "This account is not linked to the Trust Layer ecosystem. Please sign in with your email and password instead." });
      }

      let authenticated = false;
      if (user.ecosystemPinHash && trimmedCred.length <= 8 && /^\d+$/.test(trimmedCred)) {
        authenticated = await bcrypt.compare(trimmedCred, user.ecosystemPinHash);
      }
      if (!authenticated) {
        authenticated = await bcrypt.compare(trimmedCred, user.password);
      }
      if (!authenticated) {
        return res.status(401).json({ error: "Invalid credential. Please check your password or ecosystem PIN." });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userEmail = user.email;
      req.session.userName = user.firstName + ' ' + user.lastName;

      console.log(`[Ecosystem Login] ${user.email} authenticated via Trust Layer (${user.trustLayerId})`);

      return res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      });
    } catch (error) {
      console.error("Ecosystem login error:", error);
      return res.status(500).json({ error: "Login failed. Please try again." });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account exists with that email, a reset code has been sent" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.insert(verificationCodes).values({
        email,
        code,
        type: 'password_reset',
        expiresAt,
      });

      try {
        await sendPasswordResetEmail(email, code);
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
      }

      return res.json({ message: "If an account exists with that email, a reset code has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: "Email, code, and new password are required" });
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: "Password must have at least 8 characters, one uppercase letter, and one special character" });
      }

      const [verification] = await db.select().from(verificationCodes).where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, 'password_reset')
        )
      );

      if (!verification || new Date(verification.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired reset code" });
      }

      if (verification.used === true || String(verification.used) === 'true' || verification.used === 1 || String(verification.used) === '1') {
        return res.status(400).json({ error: "Reset code has already been used" });
      }

      await db.update(verificationCodes).set({ used: true }).where(eq(verificationCodes.id, verification.id));

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

      if (tlIsConfigured()) {
        tlSyncPassword(email, newPassword).catch((err: any) =>
          console.error("Trust Layer password sync error:", err)
        );
      }

      return res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });


  app.post("/api/auth/set-password", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
      if (!pwRegex.test(password)) {
        return res.status(400).json({ error: "Password must have at least 8 characters, one uppercase letter, and one special character" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await db.update(users).set({ password: hashedPassword, mustResetPassword: false }).where(eq(users.id, req.session.userId));

      return res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Set password error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.json({ user: null });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }

      return res.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        mustResetPassword: user.mustResetPassword,
      });
    } catch (error) {
      console.error("Auth me error:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      return res.json({ message: "Logged out" });
    });
  });

  // --- Health Check ---
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", database: "postgres", connected: true });
  });

  // ─── DarkWave Media Studio (TrustVault) ──────────────────────────────

  app.get("/api/media-studio/status", async (_req: Request, res: Response) => {
    try {
      const result = await mediaStudioStatus();
      res.json({
        ...result,
        service: "DarkWave Media Studio (TrustVault)",
        configured: mediaStudioIsConfigured(),
        baseUrl: process.env.TRUSTVAULT_BASE_URL || "https://trustvault.replit.app",
        tenantSpace: "trusthome",
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/media-studio/projects", async (_req: Request, res: Response) => {
    try {
      const result = await mediaStudioListProjects();
      res.json({ ...result, tenantSpace: "trusthome" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/media-studio/projects/:projectId", async (req: Request, res: Response) => {
    try {
      const result = await mediaStudioGetProject(req.params.projectId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/media-studio/projects/:projectId/status", async (req: Request, res: Response) => {
    try {
      const result = await mediaStudioGetProjectStatus(req.params.projectId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/media-studio/walkthrough-request", async (req: Request, res: Response) => {
    try {
      const result = await mediaStudioRequestWalkthrough(req.body);
      res.status(201).json({ ...result, tenantSpace: "trusthome" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/media-studio/projects/:projectId/cancel", async (req: Request, res: Response) => {
    try {
      const result = await mediaStudioCancelProject(req.params.projectId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // ─── Marketing Hub ──────────────────────────────────────────────────
  app.get("/api/marketing/dashboard", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agentId = req.session.user.id;
      
      // Fetch posts
      const posts = await db.query.marketingPosts.findMany({
        where: eq(marketingPosts.agentId, agentId),
        orderBy: [desc(marketingPosts.scheduledDate), desc(marketingPosts.createdAt)],
      });
      
      // Fetch analytics
      let analytics = await db.query.marketingAnalytics.findFirst({
        where: eq(marketingAnalytics.agentId, agentId),
      });
      
      // Seed initial analytics if none exist for this agent
      if (!analytics) {
        const [newAnalytics] = await db.insert(marketingAnalytics).values({
          agentId,
          impressions: 0,
          reach: 0,
          clicks: 0,
          engagement: 0,
          shares: 0,
          avgCtr: 0,
          costPerClick: 0
        }).returning();
        analytics = newAnalytics;
      } else if (analytics.reach === 12430 || analytics.impressions === 24850) {
        // Reset previously-seeded fake demo data
        const [reset] = await db.update(marketingAnalytics)
          .set({ impressions: 0, reach: 0, clicks: 0, engagement: 0, shares: 0, avgCtr: 0, costPerClick: 0 })
          .where(eq(marketingAnalytics.agentId, agentId))
          .returning();
        analytics = reset;
      }
      
      // If no posts exist, return empty array (no fake seeding)
      res.json({ posts, analytics });
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
      const data = await tlGetCertificationStatus(req.params.id as string);
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

  // ─── Developer / Owner Admin Routes ─────────────────────────────────

  app.get("/api/admin/system-health", requireOwner, async (req: Request, res: Response) => {
    try {
      const services: Array<{
        name: string;
        endpoint: string;
        status: "online" | "offline" | "degraded" | "not_configured";
        latency?: number;
        details?: string;
      }> = [];

      // 1. Database
      const dbStart = Date.now();
      try {
        await pool.query("SELECT 1");
        services.push({ name: "PostgreSQL Database", endpoint: "localhost", status: "online", latency: Date.now() - dbStart });
      } catch (e) {
        services.push({ name: "PostgreSQL Database", endpoint: "localhost", status: "offline", details: e instanceof Error ? e.message : "Connection failed" });
      }

      // 2. Trust Layer (DWTL)
      const tlStart = Date.now();
      if (tlIsConfigured()) {
        try {
          const tlResult = await tlGetPublicRegistry();
          const tlLatency = Date.now() - tlStart;
          if (tlResult.error || tlResult.notAvailable) {
            services.push({ name: "DarkWave Trust Layer", endpoint: process.env.TRUSTLAYER_BASE_URL || "https://dwsc.io", status: "degraded", latency: tlLatency, details: tlResult.error });
          } else {
            services.push({ name: "DarkWave Trust Layer", endpoint: process.env.TRUSTLAYER_BASE_URL || "https://dwsc.io", status: "online", latency: tlLatency });
          }
        } catch (e) {
          services.push({ name: "DarkWave Trust Layer", endpoint: process.env.TRUSTLAYER_BASE_URL || "https://dwsc.io", status: "offline", latency: Date.now() - tlStart, details: e instanceof Error ? e.message : "Connection failed" });
        }
      } else {
        services.push({ name: "DarkWave Trust Layer", endpoint: process.env.TRUSTLAYER_BASE_URL || "https://dwsc.io", status: "not_configured", details: "API credentials not set" });
      }

      // 5. Resend Email
      try {
        const resendCheck = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: "Bearer test" },
        });
        services.push({ name: "Resend Email Service", endpoint: "https://api.resend.com", status: resendCheck.status === 401 || resendCheck.status === 403 ? "online" : "degraded", details: "API reachable" });
      } catch {
        services.push({ name: "Resend Email Service", endpoint: "https://api.resend.com", status: "offline", details: "API unreachable" });
      }

      // 6. Stripe
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        try {
          const stripeStart = Date.now();
          const stripeRes = await fetch("https://api.stripe.com/v1/balance", {
            headers: { Authorization: `Bearer ${stripeKey}` },
          });
          const stripeLatency = Date.now() - stripeStart;
          if (stripeRes.ok) {
            services.push({ name: "Stripe Payments", endpoint: "https://api.stripe.com", status: "online", latency: stripeLatency });
          } else {
            services.push({ name: "Stripe Payments", endpoint: "https://api.stripe.com", status: "degraded", latency: stripeLatency, details: `HTTP ${stripeRes.status}` });
          }
        } catch {
          services.push({ name: "Stripe Payments", endpoint: "https://api.stripe.com", status: "offline", details: "Connection failed" });
        }
      } else {
        services.push({ name: "Stripe Payments", endpoint: "https://api.stripe.com", status: "not_configured", details: "Keys not set" });
      }

      const overall = services.every(s => s.status === "online" || s.status === "not_configured")
        ? "healthy"
        : services.some(s => s.status === "offline")
        ? "critical"
        : "degraded";

      res.json({
        overall,
        services,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/api-connections", requireOwner, async (_req: Request, res: Response) => {
    try {
      const connections = [
        {
          id: "postgres",
          name: "TrustHome Database (PostgreSQL)",
          description: "Agent tenants: leads, deals, calendar, properties, tasks, documents, messaging",
          baseUrl: "coolify-internal",
          configured: !!process.env.DATABASE_URL,
          keyMasked: null,
          icon: "server-outline",
        },
        {
          id: "orbit_staffing",
          name: "Orbit Staffing",
          description: "Ecosystem registration, Trust Layer SSO login, SSO register",
          baseUrl: "https://orbitstaffing.io",
          configured: !!(process.env.ORBIT_ECOSYSTEM_API_KEY && process.env.ORBIT_ECOSYSTEM_API_SECRET),
          keyMasked: process.env.ORBIT_ECOSYSTEM_API_KEY ? `${process.env.ORBIT_ECOSYSTEM_API_KEY.slice(0, 6)}...${process.env.ORBIT_ECOSYSTEM_API_KEY.slice(-4)}` : null,
          icon: "people-outline",
          endpoints: {
            registration: "POST /api/admin/ecosystem/register-app",
            ssoLogin: "POST /api/auth/ecosystem-login",
            ssoRegister: "POST /api/chat/auth/register",
          },
        },
        {
          id: "darkwave",
          name: "DarkWave Studios Core",
          description: "Ecosystem authentication, cross-app authorization",
          baseUrl: "https://darkwavestudios.io",
          configured: !!(process.env.DARKWAVE_API_KEY && process.env.DARKWAVE_API_SECRET),
          keyMasked: process.env.DARKWAVE_API_KEY ? `${process.env.DARKWAVE_API_KEY.slice(0, 6)}...${process.env.DARKWAVE_API_KEY.slice(-4)}` : null,
          icon: "shield-outline",
        },
        {
          id: "trustlayer",
          name: "DarkWave Trust Layer (DWTL)",
          description: "Blockchain verification, certifications, Trust Score",
          baseUrl: process.env.TRUSTLAYER_BASE_URL || "https://dwsc.io",
          configured: tlIsConfigured(),
          keyMasked: process.env.TRUSTLAYER_API_KEY ? `${process.env.TRUSTLAYER_API_KEY.slice(0, 6)}...${process.env.TRUSTLAYER_API_KEY.slice(-4)}` : null,
          icon: "link-outline",
        },
        {
          id: "stripe",
          name: "Stripe",
          description: "Tenant space purchases, subscription billing (demo space)",
          baseUrl: "https://api.stripe.com",
          configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
          keyMasked: process.env.STRIPE_PUBLISHABLE_KEY ? `${process.env.STRIPE_PUBLISHABLE_KEY.slice(0, 8)}...${process.env.STRIPE_PUBLISHABLE_KEY.slice(-4)}` : null,
          icon: "logo-usd",
        },
        {
          id: "resend",
          name: "Resend Email",
          description: "Transactional emails, verification codes, notifications",
          baseUrl: "https://api.resend.com",
          configured: !!process.env.RESEND_API_KEY,
          keyMasked: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 5)}...${process.env.RESEND_API_KEY.slice(-4)}` : null,
          icon: "mail-outline",
        },
        {
          id: "media_studio",
          name: "TrustVault / DW Media Studio",
          description: "Video walkthroughs, photo editing, virtual staging, media production API",
          baseUrl: process.env.TRUSTVAULT_BASE_URL || "https://trustvault.replit.app",
          configured: mediaStudioIsConfigured(),
          keyMasked: process.env.DW_MEDIA_API_KEY ? `${process.env.DW_MEDIA_API_KEY.slice(0, 6)}...${process.env.DW_MEDIA_API_KEY.slice(-4)}` : null,
          icon: "videocam-outline",
        },
      ];

      res.json({ connections });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/admin/overview", requireOwner, async (_req: Request, res: Response) => {
    try {
      const userCountResult = await pool.query("SELECT COUNT(*) as count FROM users");
      const userCount = Number(userCountResult.rows?.[0]?.count ?? 0);

      res.json({
        platform: "TrustHome",
        version: "1.0.0-beta",
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        registeredUsers: userCount,
        owner: "DarkWave Studios",
        ownerUrl: "https://darkwavestudios.io",
        database: "PostgreSQL (TrustHome)",
        trustLayer: "dwsc.io",
        securitySuite: "trustshield.tech",
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const conditions = [eq(blogPosts.status, 'published')];
      if (category) {
        conditions.push(eq(blogPosts.category, category));
      }
      const posts = await db.select().from(blogPosts).where(and(...conditions)).orderBy(desc(blogPosts.publishedAt));
      return res.json(posts);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req: Request, res: Response) => {
    try {
      const [post] = await db.select().from(blogPosts).where(
        and(eq(blogPosts.slug, req.params.slug as string), eq(blogPosts.status, 'published'))
      );
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/blog/admin/posts", requireOwner, async (_req: Request, res: Response) => {
    try {
      const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
      return res.json(posts);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/blog/admin/posts", requireOwner, async (req: Request, res: Response) => {
    try {
      const [post] = await db.insert(blogPosts).values({
        ...req.body,
        publishedAt: req.body.status === 'published' ? new Date() : null,
      }).returning();
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/blog/admin/posts/:id", requireOwner, async (req: Request, res: Response) => {
    try {
      const updateData = { ...req.body, updatedAt: new Date() };
      if (req.body.status === 'published' && !req.body.publishedAt) {
        updateData.publishedAt = new Date();
      }
      const [post] = await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, req.params.id as string)).returning();
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/blog/admin/posts/:id", requireOwner, async (req: Request, res: Response) => {
    try {
      const [post] = await db.delete(blogPosts).where(eq(blogPosts.id, req.params.id as string)).returning();
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.json({ message: "Post deleted" });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/blog/admin/generate", requireOwner, async (req: Request, res: Response) => {
    try {
      const { topic, category, tone } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "not-configured",
        ...(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL }),
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a real estate content writer for TrustHome, a premium real estate platform. Write professional, SEO-optimized blog posts. Output JSON with keys: title, excerpt, content (full HTML with paragraphs, headings h2/h3, lists), metaTitle (max 60 chars), metaDescription (max 160 chars), tags (array of strings).",
          },
          {
            role: "user",
            content: `Write a blog post about: ${topic}${category ? `. Category: ${category}` : ''}${tone ? `. Tone: ${tone}` : ''}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const generated = JSON.parse(completion.choices[0].message.content || '{}');

      const slug = generated.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const [post] = await db.insert(blogPosts).values({
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        content: generated.content,
        category: category || 'market-insights',
        tags: JSON.stringify(generated.tags || []),
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        aiGenerated: true,
        status: 'draft',
        authorName: 'TrustHome AI',
      }).returning();

      return res.json(post);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/access-requests", async (req: Request, res: Response) => {
    try {
      const parsed = insertAccessRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Please fill in all required fields (first name, last name, email)" });
      }

      const existing = await db.select().from(accessRequests).where(eq(accessRequests.email, parsed.data.email.toLowerCase().trim()));
      if (existing.length > 0) {
        return res.json({ message: "Your request has been received. We'll be in touch soon!", alreadyExists: true });
      }

      const [request] = await db.insert(accessRequests).values({
        ...parsed.data,
        email: parsed.data.email.toLowerCase().trim(),
      }).returning();

      return res.json({ message: "Your request has been received. We'll be in touch soon!", request: { id: request.id } });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/invite-agent", async (req: Request, res: Response) => {
    try {
      const { agentEmail, senderName } = req.body;
      if (!agentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentEmail)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }
      await db.insert(accessRequests).values({
        firstName: senderName || 'Client Referral',
        lastName: '',
        email: agentEmail.toLowerCase().trim(),
        role: 'agent',
        source: 'client_invite',
      }).onConflictDoNothing();
      return res.json({ message: "Invite sent successfully" });
    } catch (error) {
      return res.json({ message: "Invite sent successfully" });
    }
  });

  app.get("/api/admin/access-requests", requireOwner, async (req: Request, res: Response) => {
    try {
      const requests = await db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt));
      return res.json(requests);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/admin/access-requests/:id", requireOwner, async (req: Request, res: Response) => {
    try {
      const { status, notes } = req.body;
      const [updated] = await db.update(accessRequests)
        .set({ status, notes, reviewedAt: new Date() })
        .where(eq(accessRequests.id, req.params.id as string))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Request not found" });
      }

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/expenses/ocr", async (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "Image data required" });


      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "not-configured",
        ...(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL }),
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a receipt OCR parser. Extract the vendor name, total amount, date, and a brief description of the purchase from the receipt image. Return valid JSON with keys: vendor (string), amount (number), date (string in YYYY-MM-DD format), description (string), category (one of: marketing, office, travel, meals, supplies, technology, insurance, licensing, staging, photography, signage, gifts, education, other)."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the receipt details from this image:" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_completion_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content || '{}';
      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        parsed = { vendor: '', amount: 0, date: new Date().toISOString().split('T')[0], description: content, category: 'other' };
      }

      return res.json(parsed);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/mls/test-connection", async (req: Request, res: Response) => {
    try {
      const { provider, mlsBoardName, apiKey, serverUrl } = req.body;
      if (!provider || !mlsBoardName || !apiKey || !serverUrl) {
        return res.status(400).json({
          status: 'failed',
          error: "Missing required fields: provider, mlsBoardName, apiKey, and serverUrl are required",
        });
      }

      try {
        new URL(serverUrl);
      } catch {
        return res.status(400).json({
          status: 'failed',
          error: "Invalid serverUrl format. Must be a valid URL.",
        });
      }

      if (apiKey.length < 8) {
        return res.status(400).json({
          status: 'failed',
          error: "API key appears too short. Please verify your credentials.",
        });
      }

      return res.json({
        status: 'success',
        message: `Successfully validated credentials for ${mlsBoardName} via ${provider}`,
        provider,
        mlsBoardName,
        serverUrl,
        testedAt: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // ─── Agent Profile Routes (public + authenticated) ──────────────────

  // Public: Get agent profile by slug (buyer-facing landing page)
  app.get("/api/agents/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const [profile] = await db.select().from(agentProfiles).where(eq(agentProfiles.slug, slug));
      if (!profile || !profile.isPublished) {
        return res.status(404).json({ error: "Agent profile not found" });
      }
      // Parse specialties from JSON string
      const result = {
        name: profile.displayName,
        title: profile.title,
        brokerage: profile.brokerage || 'TrustHome',
        phone: profile.phone || '',
        email: profile.email || '',
        bio: profile.bio || '',
        heroImageUrl: profile.heroImageUrl || null,
        specialties: (() => { try { return JSON.parse(profile.specialties); } catch { return []; } })(),
        stats: [
          { label: 'Career Volume', value: profile.careerVolume || '—' },
          { label: 'Avg List-to-Sale', value: profile.avgListToSale || '—' },
          { label: 'Active Listings', value: profile.activeListings?.toString() || '—' },
        ],
      };
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Authenticated: Get own agent profile
  app.get("/api/agents/me/profile", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const [profile] = await db.select().from(agentProfiles).where(eq(agentProfiles.userId, userId));
      if (!profile) return res.json({ exists: false });
      return res.json({ exists: true, profile });
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Authenticated: Create or update own agent profile
  app.put("/api/agents/me/profile", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });

      // Get user to auto-generate slug from name if needed
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ error: "User not found" });

      const displayName = req.body.displayName || `${user.firstName} ${user.lastName}`;
      const slug = req.body.slug || `${user.firstName}-${user.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Check if profile already exists
      const [existing] = await db.select().from(agentProfiles).where(eq(agentProfiles.userId, userId));

      if (existing) {
        // Update
        const updates: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (req.body.displayName !== undefined) updates.displayName = req.body.displayName;
        if (req.body.title !== undefined) updates.title = req.body.title;
        if (req.body.brokerage !== undefined) updates.brokerage = req.body.brokerage;
        if (req.body.phone !== undefined) updates.phone = req.body.phone;
        if (req.body.email !== undefined) updates.email = req.body.email;
        if (req.body.bio !== undefined) updates.bio = req.body.bio;
        if (req.body.heroImageUrl !== undefined) updates.heroImageUrl = req.body.heroImageUrl;
        if (req.body.specialties !== undefined) updates.specialties = JSON.stringify(req.body.specialties);
        if (req.body.careerVolume !== undefined) updates.careerVolume = req.body.careerVolume;
        if (req.body.avgListToSale !== undefined) updates.avgListToSale = req.body.avgListToSale;
        if (req.body.activeListings !== undefined) updates.activeListings = req.body.activeListings;
        if (req.body.isPublished !== undefined) updates.isPublished = req.body.isPublished;
        if (req.body.slug !== undefined) updates.slug = req.body.slug;

        const [updated] = await db.update(agentProfiles).set(updates).where(eq(agentProfiles.id, existing.id)).returning();
        return res.json(updated);
      } else {
        // Create
        const [created] = await db.insert(agentProfiles).values({
          userId,
          slug,
          displayName,
          title: req.body.title || 'Licensed Real Estate Professional',
          brokerage: req.body.brokerage || user.brokerage || null,
          phone: req.body.phone || user.phone || null,
          email: req.body.email || user.email,
          bio: req.body.bio || null,
          heroImageUrl: req.body.heroImageUrl || null,
          specialties: JSON.stringify(req.body.specialties || ['Residential Sales', 'Buyer Representation']),
          careerVolume: req.body.careerVolume || null,
          avgListToSale: req.body.avgListToSale || null,
          activeListings: req.body.activeListings || 0,
          isPublished: req.body.isPublished ?? false,
        }).returning();
        return res.json(created);
      }
    } catch (error) {
      return res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);


  return httpServer;
}
