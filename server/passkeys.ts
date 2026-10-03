/**
 * TrustHome — Passkeys (Face ID / Touch ID / Windows Hello / Android fingerprint)
 *
 * Uses WebAuthn via @simplewebauthn/server. The device keeps the private key;
 * we only store the public key. Passkeys made on an iPhone sync through iCloud
 * Keychain, so they also work on the agent's iPad and Mac.
 *
 * DarkWave Studios LLC — Copyright 2026
 */

import type { Express, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { db } from "./db";
import { users, passkeys } from "@shared/schema";
import { requireAuth } from "./tenant-routes";

declare module "express-session" {
  interface SessionData {
    webauthnChallenge?: string;
    webauthnChallengeAt?: number;
  }
}

const RP_NAME = "TrustHome";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function rpId(req: Request): string {
  return process.env.WEBAUTHN_RP_ID || req.hostname;
}

function expectedOrigins(req: Request): string[] {
  const id = rpId(req);
  const extra = (process.env.WEBAUTHN_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return [`https://${id}`, ...extra, ...(process.env.NODE_ENV !== "production" ? ["http://localhost:8081", "http://localhost:5000"] : [])];
}

function takeChallenge(req: Request): string | null {
  const c = req.session.webauthnChallenge;
  const at = req.session.webauthnChallengeAt || 0;
  req.session.webauthnChallenge = undefined;
  req.session.webauthnChallengeAt = undefined;
  if (!c || Date.now() - at > CHALLENGE_TTL_MS) return null;
  return c;
}

function deviceLabelFrom(req: Request): string {
  const ua = req.header("user-agent") || "";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows PC";
  return "This device";
}

export function registerPasskeyRoutes(app: Express) {
  // ── Add a passkey to the signed-in account ──
  app.post("/api/passkeys/register/options", requireAuth, async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId as string));
    if (!user) return res.status(404).json({ error: "Account not found" });
    const existing = await db.select().from(passkeys).where(eq(passkeys.userId, user.id));
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpId(req),
      userName: user.email,
      userDisplayName: `${user.firstName} ${user.lastName}`.trim(),
      userID: new TextEncoder().encode(user.id),
      attestationType: "none",
      excludeCredentials: existing.map((p) => ({ id: p.id, transports: p.transports ? JSON.parse(p.transports) : undefined })),
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
    });
    req.session.webauthnChallenge = options.challenge;
    req.session.webauthnChallengeAt = Date.now();
    res.json(options);
  });

  app.post("/api/passkeys/register/verify", requireAuth, async (req: Request, res: Response) => {
    const challenge = takeChallenge(req);
    if (!challenge) return res.status(400).json({ error: "That took too long. Please try again." });
    try {
      const verification = await verifyRegistrationResponse({
        response: req.body?.response,
        expectedChallenge: challenge,
        expectedOrigin: expectedOrigins(req),
        expectedRPID: rpId(req),
        requireUserVerification: false,
      });
      if (!verification.verified || !verification.registrationInfo) {
        return res.status(400).json({ error: "We couldn't verify this device. Please try again." });
      }
      const { credential } = verification.registrationInfo;
      await db.insert(passkeys).values({
        id: credential.id,
        userId: req.session.userId as string,
        publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter,
        transports: credential.transports ? JSON.stringify(credential.transports) : null,
        deviceLabel: String(req.body?.deviceLabel || deviceLabelFrom(req)).slice(0, 60),
      }).onConflictDoNothing();
      res.json({ success: true });
    } catch (e) {
      console.warn("[passkeys] register failed:", (e as Error).message);
      res.status(400).json({ error: "We couldn't verify this device. Please try again." });
    }
  });

  app.get("/api/passkeys", requireAuth, async (req, res) => {
    const rows = await db.select({
      id: passkeys.id, deviceLabel: passkeys.deviceLabel, createdAt: passkeys.createdAt, lastUsedAt: passkeys.lastUsedAt,
    }).from(passkeys).where(eq(passkeys.userId, req.session.userId as string));
    res.json(rows);
  });

  app.delete("/api/passkeys/:id", requireAuth, async (req, res) => {
    const [row] = await db.delete(passkeys)
      .where(and(eq(passkeys.id, req.params.id as string), eq(passkeys.userId, req.session.userId as string)))
      .returning({ id: passkeys.id });
    if (!row) return res.status(404).json({ error: "Passkey not found" });
    res.json({ success: true });
  });

  // ── Sign in with a passkey (no email/password/code) ──
  app.post("/api/passkeys/login/options", async (req, res) => {
    const options = await generateAuthenticationOptions({
      rpID: rpId(req),
      userVerification: "preferred",
      allowCredentials: [], // discoverable credentials: the device offers the right account
    });
    req.session.webauthnChallenge = options.challenge;
    req.session.webauthnChallengeAt = Date.now();
    res.json(options);
  });

  app.post("/api/passkeys/login/verify", async (req, res) => {
    const challenge = takeChallenge(req);
    if (!challenge) return res.status(400).json({ error: "That took too long. Please try again." });
    const response = req.body?.response;
    const credId = typeof response?.id === "string" ? response.id : "";
    const [pk] = credId ? await db.select().from(passkeys).where(eq(passkeys.id, credId)) : [];
    if (!pk) return res.status(400).json({ error: "This passkey isn't registered with TrustHome. Sign in with email, then turn on Face ID in Settings." });
    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challenge,
        expectedOrigin: expectedOrigins(req),
        expectedRPID: rpId(req),
        credential: {
          id: pk.id,
          publicKey: new Uint8Array(Buffer.from(pk.publicKey, "base64url")),
          counter: pk.counter,
          transports: pk.transports ? JSON.parse(pk.transports) : undefined,
        },
        requireUserVerification: false,
      });
      if (!verification.verified) return res.status(401).json({ error: "Sign-in wasn't verified. Please try again." });
      await db.update(passkeys).set({ counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() })
        .where(eq(passkeys.id, pk.id));

      const [user] = await db.select().from(users).where(eq(users.id, pk.userId));
      if (!user) return res.status(401).json({ error: "Account not found" });

      req.session.cookie.maxAge = (req.body?.rememberMe === false ? 1 : 30) * 24 * 60 * 60 * 1000;
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userEmail = user.email;
      req.session.userName = `${user.firstName} ${user.lastName}`;
      res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    } catch (e) {
      console.warn("[passkeys] login failed:", (e as Error).message);
      res.status(401).json({ error: "Sign-in wasn't verified. Please try again." });
    }
  });
}
