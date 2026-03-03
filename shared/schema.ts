import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = ['agent', 'client', 'vendor'] as const;
export type UserRole = typeof userRoleEnum[number];

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default('client'),
  phone: text("phone"),
  brokerage: text("brokerage"),
  licenseNumber: text("license_number"),
  mustResetPassword: text("must_reset_password").notNull().default('false'),
  trustLayerId: text("trust_layer_id"),
  ecosystemPinHash: text("ecosystem_pin_hash"),
  ecosystemApp: text("ecosystem_app"),
  uniqueHash: text("unique_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull().default('email_verification'),
  expiresAt: timestamp("expires_at").notNull(),
  used: text("used").notNull().default('false'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  phone: true,
  brokerage: true,
  licenseNumber: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    'Password must have at least 8 characters, one uppercase letter, and one special character'),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    'Password must have at least 8 characters, one uppercase letter, and one special character'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(userRoleEnum),
  phone: z.string().optional(),
  brokerage: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category").notNull().default('market-insights'),
  tags: text("tags").notNull().default('[]'),
  authorId: varchar("author_id"),
  authorName: text("author_name").notNull().default('TrustHome'),
  status: text("status").notNull().default('draft'),
  aiGenerated: text("ai_generated").notNull().default('false'),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  category: true,
  tags: true,
  authorName: true,
  status: true,
  aiGenerated: true,
  metaTitle: true,
  metaDescription: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const accessRequests = pgTable("access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default('agent'),
  brokerage: text("brokerage"),
  licenseNumber: text("license_number"),
  message: text("message"),
  source: text("source").notNull().default('request'),
  status: text("status").notNull().default('pending'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertAccessRequestSchema = createInsertSchema(accessRequests).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  brokerage: true,
  licenseNumber: true,
  message: true,
  source: true,
});

export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type AccessRequest = typeof accessRequests.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  category: text("category").notNull().default('other'),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  vendor: text("vendor"),
  date: text("expense_date").notNull(),
  receiptUrl: text("receipt_url"),
  ocrData: text("ocr_data"),
  notes: text("notes"),
  propertyAddress: text("property_address"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  category: true,
  description: true,
  amount: true,
  vendor: true,
  date: true,
  notes: true,
  propertyAddress: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export const mileageEntries = pgTable("mileage_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  date: text("entry_date").notNull(),
  startAddress: text("start_address"),
  endAddress: text("end_address"),
  miles: real("miles").notNull(),
  purpose: text("purpose").notNull(),
  category: text("category").notNull().default('showing'),
  startLat: real("start_lat"),
  startLng: real("start_lng"),
  endLat: real("end_lat"),
  endLng: real("end_lng"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMileageSchema = createInsertSchema(mileageEntries).pick({
  date: true,
  startAddress: true,
  endAddress: true,
  miles: true,
  purpose: true,
  category: true,
  notes: true,
});

export type InsertMileage = z.infer<typeof insertMileageSchema>;
export type MileageEntry = typeof mileageEntries.$inferSelect;

export const mlsConfigurations = pgTable("mls_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  provider: text("provider").notNull(),
  mlsBoardName: text("mls_board_name").notNull(),
  mlsAgentId: text("mls_agent_id"),
  licenseNumber: text("license_number"),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  serverUrl: text("server_url"),
  loginUrl: text("login_url"),
  mediaUrl: text("media_url"),
  status: text("status").notNull().default('pending'),
  lastSyncAt: timestamp("last_sync_at"),
  syncEnabled: text("sync_enabled").notNull().default('false'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMlsConfigSchema = createInsertSchema(mlsConfigurations).pick({
  provider: true,
  mlsBoardName: true,
  mlsAgentId: true,
  licenseNumber: true,
  apiKey: true,
  apiSecret: true,
  serverUrl: true,
  loginUrl: true,
  mediaUrl: true,
  notes: true,
});

export type InsertMlsConfig = z.infer<typeof insertMlsConfigSchema>;
export type MlsConfiguration = typeof mlsConfigurations.$inferSelect;

export const hallmarks = pgTable("hallmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  thId: text("th_id").notNull().unique(),
  userId: varchar("user_id"),
  appId: text("app_id").notNull(),
  appName: text("app_name").notNull(),
  productName: text("product_name").notNull(),
  releaseType: text("release_type").notNull(),
  metadata: text("metadata").notNull().default('{}'),
  dataHash: text("data_hash").notNull(),
  txHash: text("tx_hash"),
  blockHeight: text("block_height"),
  qrCodeSvg: text("qr_code_svg"),
  verificationUrl: text("verification_url"),
  hallmarkId: integer("hallmark_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Hallmark = typeof hallmarks.$inferSelect;

export const trustStamps = pgTable("trust_stamps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  category: text("category").notNull(),
  data: text("stamp_data").notNull().default('{}'),
  dataHash: text("data_hash").notNull(),
  txHash: text("tx_hash"),
  blockHeight: text("block_height"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TrustStamp = typeof trustStamps.$inferSelect;

export const hallmarkCounter = pgTable("hallmark_counter", {
  id: text("id").primaryKey(),
  currentSequence: text("current_sequence").notNull().default('0'),
});

export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  referredUserId: varchar("referred_user_id"),
  referralHash: text("referral_hash").notNull(),
  platform: text("platform").notNull().default('trusthome'),
  status: text("status").notNull().default('pending'),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;

export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  referralId: varchar("referral_id"),
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default('SIG'),
  tier: text("tier").notNull().default('base'),
  status: text("status").notNull().default('pending'),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;

export * from "./models/chat";
