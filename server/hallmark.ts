import type { Express, Request, Response } from "express";
import { db } from "./db";
import { hallmarks, trustStamps, hallmarkCounter, users, affiliateReferrals, affiliateCommissions } from "@shared/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import crypto from "crypto";

const APP_PREFIX = "TR";
const APP_NAME = "TrustHome";
const APP_SLUG = "trusthome";
const APP_DOMAIN = "trusthome.tlid.io";
const COUNTER_ID = "tr-master";

function generateDataHash(payload: Record<string, any>): string {
  const str = JSON.stringify(payload);
  return crypto.createHash("sha256").update(str).digest("hex");
}

function generateTxHash(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}

function generateBlockHeight(): string {
  return String(1000000 + Math.floor(Math.random() * 9000000));
}

function formatHallmarkId(seq: number): string {
  return `${APP_PREFIX}-${String(seq).padStart(8, "0")}`;
}

async function getNextSequence(): Promise<number> {
  const result = await db
    .insert(hallmarkCounter)
    .values({ id: COUNTER_ID, currentSequence: "1" })
    .onConflictDoUpdate({
      target: hallmarkCounter.id,
      set: {
        currentSequence: sql`(CAST(${hallmarkCounter.currentSequence} AS INTEGER) + 1)::TEXT`,
      },
    })
    .returning({ currentSequence: hallmarkCounter.currentSequence });

  return parseInt(result[0].currentSequence, 10);
}

export async function generateHallmark(opts: {
  userId?: string;
  appId: string;
  productName: string;
  releaseType: string;
  metadata?: Record<string, any>;
}): Promise<typeof hallmarks.$inferSelect> {
  const seq = await getNextSequence();
  const thId = formatHallmarkId(seq);
  const timestamp = new Date().toISOString();

  const payload = {
    thId,
    userId: opts.userId || null,
    appId: opts.appId,
    appName: APP_NAME,
    productName: opts.productName,
    releaseType: opts.releaseType,
    timestamp,
    ...(opts.metadata || {}),
  };

  const dataHash = generateDataHash(payload);
  const txHash = generateTxHash();
  const blockHeight = generateBlockHeight();
  const verificationUrl = `https://${APP_DOMAIN}/api/hallmark/${thId}/verify`;

  const [hallmark] = await db
    .insert(hallmarks)
    .values({
      thId,
      userId: opts.userId || null,
      appId: opts.appId,
      appName: APP_NAME,
      productName: opts.productName,
      releaseType: opts.releaseType,
      metadata: JSON.stringify(opts.metadata || {}),
      dataHash,
      txHash,
      blockHeight,
      verificationUrl,
      hallmarkId: seq,
    })
    .returning();

  return hallmark;
}

export async function createTrustStamp(opts: {
  userId?: string;
  category: string;
  data: Record<string, any>;
}): Promise<typeof trustStamps.$inferSelect> {
  const timestamp = new Date().toISOString();
  const payload = {
    ...opts.data,
    appContext: APP_SLUG,
    timestamp,
  };

  const dataHash = generateDataHash(payload);
  const txHash = generateTxHash();
  const blockHeight = generateBlockHeight();

  const [stamp] = await db
    .insert(trustStamps)
    .values({
      userId: opts.userId || null,
      category: opts.category,
      data: JSON.stringify(payload),
      dataHash,
      txHash,
      blockHeight,
    })
    .returning();

  return stamp;
}

async function seedGenesis() {
  const existing = await db
    .select()
    .from(hallmarks)
    .where(eq(hallmarks.thId, `${APP_PREFIX}-00000001`))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[HALLMARK] Genesis hallmark ${APP_PREFIX}-00000001 already exists`);
    return;
  }

  await db
    .insert(hallmarkCounter)
    .values({ id: COUNTER_ID, currentSequence: "0" })
    .onConflictDoNothing();

  const genesis = await generateHallmark({
    appId: `${APP_SLUG}-genesis`,
    productName: "Genesis Block",
    releaseType: "genesis",
    metadata: {
      ecosystem: "Trust Layer",
      version: "1.0.0",
      domain: APP_DOMAIN,
      operator: "DarkWave Studios LLC",
      chain: "Trust Layer Blockchain",
      consensus: "Proof of Trust",
      launchDate: "2026-08-23T00:00:00.000Z",
      nativeAsset: "SIG",
      utilityToken: "Shells",
      parentApp: "Trust Layer Hub",
      parentGenesis: "TH-00000001",
    },
  });

  console.log(`[HALLMARK] Genesis hallmark created: ${genesis.thId}`);
}

function getCommissionTier(convertedCount: number): { tier: string; rate: number } {
  if (convertedCount >= 50) return { tier: "diamond", rate: 0.2 };
  if (convertedCount >= 30) return { tier: "platinum", rate: 0.175 };
  if (convertedCount >= 15) return { tier: "gold", rate: 0.15 };
  if (convertedCount >= 5) return { tier: "silver", rate: 0.125 };
  return { tier: "base", rate: 0.1 };
}

function generateUniqueHash(): string {
  return crypto.randomBytes(6).toString("hex");
}

export function registerHallmarkRoutes(app: Express) {
  seedGenesis().catch((err) => console.error("[HALLMARK] Genesis seed error:", err));

  app.get("/api/hallmark/genesis", async (_req: Request, res: Response) => {
    try {
      const [genesis] = await db
        .select()
        .from(hallmarks)
        .where(eq(hallmarks.thId, `${APP_PREFIX}-00000001`))
        .limit(1);

      if (!genesis) {
        return res.status(404).json({ error: "Genesis hallmark not found" });
      }

      res.json({
        hallmark: {
          ...genesis,
          metadata: JSON.parse(genesis.metadata || "{}"),
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve genesis hallmark" });
    }
  });

  app.get("/api/hallmark/:hallmarkId/verify", async (req: Request, res: Response) => {
    try {
      const { hallmarkId } = req.params;
      const [hallmark] = await db
        .select()
        .from(hallmarks)
        .where(eq(hallmarks.thId, hallmarkId))
        .limit(1);

      if (!hallmark) {
        return res.status(404).json({ verified: false, error: "Hallmark not found" });
      }

      res.json({
        verified: true,
        hallmark: {
          thId: hallmark.thId,
          appName: hallmark.appName,
          productName: hallmark.productName,
          releaseType: hallmark.releaseType,
          dataHash: hallmark.dataHash,
          txHash: hallmark.txHash,
          blockHeight: hallmark.blockHeight,
          createdAt: hallmark.createdAt,
        },
      });
    } catch (err) {
      res.status(500).json({ verified: false, error: "Verification failed" });
    }
  });

  app.get("/api/hallmarks", async (req: Request, res: Response) => {
    try {
      const results = await db
        .select()
        .from(hallmarks)
        .orderBy(desc(hallmarks.createdAt))
        .limit(50);

      res.json({
        hallmarks: results.map((h) => ({
          ...h,
          metadata: JSON.parse(h.metadata || "{}"),
        })),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to list hallmarks" });
    }
  });

  app.get("/api/trust-stamps", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      const query = userId
        ? db.select().from(trustStamps).where(eq(trustStamps.userId, userId)).orderBy(desc(trustStamps.createdAt)).limit(50)
        : db.select().from(trustStamps).orderBy(desc(trustStamps.createdAt)).limit(50);

      const results = await query;

      res.json({
        stamps: results.map((s) => ({
          ...s,
          data: JSON.parse(s.data || "{}"),
        })),
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to list trust stamps" });
    }
  });

  app.get("/api/affiliate/dashboard", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Authentication required" });

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return res.status(404).json({ error: "User not found" });

      let uniqueHash = user.uniqueHash;
      if (!uniqueHash) {
        uniqueHash = generateUniqueHash();
        await db.update(users).set({ uniqueHash }).where(eq(users.id, userId));
      }

      const referrals = await db
        .select()
        .from(affiliateReferrals)
        .where(eq(affiliateReferrals.referrerId, userId))
        .orderBy(desc(affiliateReferrals.createdAt));

      const commissions = await db
        .select()
        .from(affiliateCommissions)
        .where(eq(affiliateCommissions.referrerId, userId))
        .orderBy(desc(affiliateCommissions.createdAt));

      const convertedCount = referrals.filter((r) => r.status === "converted").length;
      const { tier, rate } = getCommissionTier(convertedCount);

      const pendingEarnings = commissions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

      const paidEarnings = commissions
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + parseFloat(c.amount), 0);

      res.json({
        uniqueHash,
        referralLink: `https://${APP_DOMAIN}/ref/${uniqueHash}`,
        tier,
        commissionRate: rate,
        stats: {
          totalReferrals: referrals.length,
          convertedReferrals: convertedCount,
          pendingEarnings: pendingEarnings.toFixed(2),
          paidEarnings: paidEarnings.toFixed(2),
        },
        referrals: referrals.slice(0, 20),
        commissions: commissions.slice(0, 20),
        tiers: [
          { name: "Base", minReferrals: 0, rate: 0.1 },
          { name: "Silver", minReferrals: 5, rate: 0.125 },
          { name: "Gold", minReferrals: 15, rate: 0.15 },
          { name: "Platinum", minReferrals: 30, rate: 0.175 },
          { name: "Diamond", minReferrals: 50, rate: 0.2 },
        ],
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to load affiliate dashboard" });
    }
  });

  app.get("/api/affiliate/link", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Authentication required" });

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return res.status(404).json({ error: "User not found" });

      let uniqueHash = user.uniqueHash;
      if (!uniqueHash) {
        uniqueHash = generateUniqueHash();
        await db.update(users).set({ uniqueHash }).where(eq(users.id, userId));
      }

      res.json({
        uniqueHash,
        links: {
          trusthome: `https://${APP_DOMAIN}/ref/${uniqueHash}`,
          trusthub: `https://trusthub.tlid.io/ref/${uniqueHash}`,
          trustvault: `https://trustvault.tlid.io/ref/${uniqueHash}`,
          thevoid: `https://thevoid.tlid.io/ref/${uniqueHash}`,
          happyeats: `https://happyeats.tlid.io/ref/${uniqueHash}`,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to get affiliate link" });
    }
  });

  app.post("/api/affiliate/track", async (req: Request, res: Response) => {
    try {
      const { referralHash, platform } = req.body;
      if (!referralHash) return res.status(400).json({ error: "referralHash required" });

      const [referrer] = await db
        .select()
        .from(users)
        .where(eq(users.uniqueHash, referralHash))
        .limit(1);

      if (!referrer) return res.status(404).json({ error: "Invalid referral link" });

      const [referral] = await db
        .insert(affiliateReferrals)
        .values({
          referrerId: referrer.id,
          referralHash,
          platform: platform || APP_SLUG,
        })
        .returning();

      res.json({ tracked: true, referralId: referral.id });
    } catch (err) {
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  app.post("/api/affiliate/request-payout", async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) return res.status(401).json({ error: "Authentication required" });

      const pendingCommissions = await db
        .select()
        .from(affiliateCommissions)
        .where(
          and(
            eq(affiliateCommissions.referrerId, userId),
            eq(affiliateCommissions.status, "pending")
          )
        );

      const totalPending = pendingCommissions.reduce(
        (sum, c) => sum + parseFloat(c.amount),
        0
      );

      if (totalPending < 10) {
        return res.status(400).json({
          error: "Minimum payout is 10 SIG",
          currentBalance: totalPending.toFixed(2),
        });
      }

      for (const commission of pendingCommissions) {
        await db
          .update(affiliateCommissions)
          .set({ status: "processing" })
          .where(eq(affiliateCommissions.id, commission.id));
      }

      await createTrustStamp({
        userId,
        category: "affiliate-payout-request",
        data: {
          amount: totalPending.toFixed(2),
          currency: "SIG",
          commissionsCount: pendingCommissions.length,
        },
      });

      res.json({
        success: true,
        amount: totalPending.toFixed(2),
        currency: "SIG",
        commissionsProcessing: pendingCommissions.length,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to process payout request" });
    }
  });

  console.log("[HALLMARK] Routes registered: /api/hallmark/*, /api/trust-stamps, /api/affiliate/*");
}
