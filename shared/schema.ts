import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
