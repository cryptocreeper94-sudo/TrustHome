import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean, index, customType } from "drizzle-orm/pg-core";
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
  mustResetPassword: boolean("must_reset_password").notNull().default(false),
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
  used: boolean("used").notNull().default(false),
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
  aiGenerated: boolean("ai_generated").notNull().default(false),
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
  syncEnabled: boolean("sync_enabled").notNull().default(false),
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

export const marketingPosts = pgTable("marketing_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  type: text("type").notNull().default('Social Post'), // 'Social Post', 'Ad Copy', 'Email'
  title: text("title").notNull(),
  preview: text("preview").notNull(),
  platforms: text("platforms").array().notNull().default(sql`ARRAY[]::text[]`), // 'FB', 'IG', 'X', 'Email'
  status: text("status").notNull().default('Draft'), // 'Draft', 'Scheduled', 'Published'
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingPostSchema = createInsertSchema(marketingPosts).pick({
  type: true,
  title: true,
  preview: true,
  platforms: true,
  status: true,
  scheduledDate: true,
});

export type InsertMarketingPost = z.infer<typeof insertMarketingPostSchema>;
export type MarketingPost = typeof marketingPosts.$inferSelect;

export const marketingAnalytics = pgTable("marketing_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  impressions: integer("impressions").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  engagement: integer("engagement").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  avgCtr: real("avg_ctr").notNull().default(0.0),
  costPerClick: real("cost_per_click").notNull().default(0.0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MarketingAnalytics = typeof marketingAnalytics.$inferSelect;

// ─── Agent Public Profiles ──────────────────────────────────────────
// Powers the /agent/[id] buyer-facing landing page

export const agentProfiles = pgTable("agent_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  title: text("title").notNull().default('Licensed Real Estate Professional'),
  brokerage: text("brokerage"),
  phone: text("phone"),
  email: text("email"),
  bio: text("bio"),
  heroImageUrl: text("hero_image_url"),
  specialties: text("specialties").notNull().default('[]'),
  careerVolume: text("career_volume"),
  avgListToSale: text("avg_list_to_sale"),
  activeListings: integer("active_listings").default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgentProfileSchema = createInsertSchema(agentProfiles).pick({
  displayName: true,
  title: true,
  brokerage: true,
  phone: true,
  email: true,
  bio: true,
  heroImageUrl: true,
  specialties: true,
  careerVolume: true,
  avgListToSale: true,
  activeListings: true,
});

export type InsertAgentProfile = z.infer<typeof insertAgentProfileSchema>;
export type AgentProfile = typeof agentProfiles.$inferSelect;

// ═══════════════════════════════════════════════════════════════════
// Tenant-scoped agent data. Every row is owned by one agent (users.id).
// The server always sets agent_id from the session — never from the client.
// ═══════════════════════════════════════════════════════════════════

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull().default(''),
  email: text("email"),
  phone: text("phone"),
  source: text("source").notNull().default('Manual'),
  budget: text("budget"),
  score: integer("score").notNull().default(50),
  temperature: text("temperature").notNull().default('warm'), // hot | warm | cold
  stage: text("stage").notNull().default('New'), // New | Contacted | Qualified | Proposal | Won | Lost
  propertyInterest: text("property_interest"),
  notes: text("notes"),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("leads_agent_idx").on(t.agentId)]);

export type Lead = typeof leads.$inferSelect;

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  propertyAddress: text("property_address").notNull(),
  clientName: text("client_name").notNull(),
  side: text("side").notNull().default('buyer'), // buyer | seller | dual
  stage: text("stage").notNull().default('lead'), // lead | showing | offer | under_contract | closing | closed | lost
  price: real("price"),
  commissionRate: real("commission_rate"),
  closingDate: text("closing_date"),
  leadId: varchar("lead_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("deals_agent_idx").on(t.agentId)]);

export type Deal = typeof deals.$inferSelect;

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  type: text("type").notNull().default('Showing'), // Showing | Open House | Listing Appt | Meeting | Inspection
  title: text("title"),
  address: text("address"),
  clientName: text("client_name"),
  startsAt: timestamp("starts_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("calendar_events_agent_idx").on(t.agentId, t.startsAt)]);

export type CalendarEventRow = typeof calendarEvents.$inferSelect;

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  address: text("address").notNull(),
  city: text("city"),
  price: real("price"),
  beds: integer("beds"),
  baths: real("baths"),
  sqft: integer("sqft"),
  status: text("status").notNull().default('Active'), // Active | Under Contract | Buyer Shortlist | Sold
  mls: text("mls"),
  imageUrl: text("image_url"),
  description: text("description"),
  features: text("features").notNull().default('[]'), // JSON array of strings
  showingCount: integer("showing_count").notNull().default(0),
  listedAt: timestamp("listed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("properties_agent_idx").on(t.agentId)]);

export type PropertyRow = typeof properties.$inferSelect;

export const agentTasks = pgTable("agent_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  title: text("title").notNull(),
  priority: text("priority").notNull().default('Normal'), // High | Medium | Low | Normal
  dueAt: text("due_at"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("agent_tasks_agent_idx").on(t.agentId)]);

export type AgentTask = typeof agentTasks.$inferSelect;

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull().default('application/octet-stream'),
  sizeBytes: integer("size_bytes").notNull().default(0),
  sha256: text("sha256").notNull(),
  status: text("status").notNull().default('Pending'), // Pending | Needs Review | Signed | Verified
  transactionLabel: text("transaction_label"),
  dealId: varchar("deal_id"),
  parties: text("parties").notNull().default('[]'), // JSON array of strings
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("documents_agent_idx").on(t.agentId)]);

export type DocumentRow = typeof documents.$inferSelect;

// File bytes kept in a separate table so listing documents stays light.
export const documentFiles = pgTable("document_files", {
  documentId: varchar("document_id").primaryKey().references(() => documents.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
});

// Agent ↔ client messaging. A client is matched by user id, or by email
// (so an agent can start a thread before the client has an account).
export const messageThreads = pgTable("message_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  clientUserId: varchar("client_user_id"),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  context: text("context"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("message_threads_agent_idx").on(t.agentId),
  index("message_threads_client_idx").on(t.clientUserId),
  index("message_threads_client_email_idx").on(t.clientEmail),
]);

export type MessageThread = typeof messageThreads.$inferSelect;

export const threadMessages = pgTable("thread_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => messageThreads.id, { onDelete: "cascade" }),
  senderUserId: varchar("sender_user_id").notNull(),
  senderRole: text("sender_role").notNull(), // agent | client
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [index("thread_messages_thread_idx").on(t.threadId, t.createdAt)]);

export type ThreadMessage = typeof threadMessages.$inferSelect;

export * from "./models/chat";
