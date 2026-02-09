import express from "express";
import type { Request, Response, NextFunction } from "express";
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { registerRoutes } from "./routes";
import { registerVoiceAiRoutes } from "./voice-ai-routes";
import { registerOrbitRoutes } from "./orbit-routes";
import { pool, db } from './db';
import { blogPosts } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import * as fs from "fs";
import * as path from "path";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: string;
    userEmail: string;
    userName: string;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    // Allow localhost origins for Expo web development (any port)
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest" && !req.path.startsWith("/app")) {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path.startsWith("/app")) {
      const webIndex = path.resolve(process.cwd(), "static-build", "index.html");
      if (fs.existsSync(webIndex)) {
        return res.sendFile(webIndex);
      }
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use("/invite-assets", express.static(path.resolve(process.cwd(), "server", "templates", "invite-assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  const inviteTemplate = fs.readFileSync(
    path.resolve(process.cwd(), "server", "templates", "invite-jennifer.html"),
    "utf-8"
  );

  app.get("/invite/jennifer", (req: Request, res: Response) => {
    const forwardedProto = req.header("x-forwarded-proto");
    const protocol = forwardedProto || req.protocol || "https";
    const host = req.header("x-forwarded-host") || req.get("host");
    const baseUrl = `${protocol}://${host}`;

    const html = inviteTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  const manifestJsonPath = path.resolve(process.cwd(), "server", "templates", "manifest.json");
  app.get("/manifest.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/manifest+json");
    res.sendFile(manifestJsonPath);
  });

  const blogIndexTemplate = fs.readFileSync(
    path.resolve(process.cwd(), "server", "templates", "blog-index.html"),
    "utf-8"
  );
  const blogPageTemplate = fs.readFileSync(
    path.resolve(process.cwd(), "server", "templates", "blog-page.html"),
    "utf-8"
  );

  app.get("/blog", async (req: Request, res: Response) => {
    try {
      const forwardedProto = req.header("x-forwarded-proto");
      const protocol = forwardedProto || req.protocol || "https";
      const host = req.header("x-forwarded-host") || req.get("host");
      const baseUrl = `${protocol}://${host}`;

      const category = req.query.category as string | undefined;
      let posts;
      if (category) {
        posts = await db.select().from(blogPosts)
          .where(eq(blogPosts.status, 'published'))
          .orderBy(desc(blogPosts.publishedAt));
        posts = posts.filter(p => p.category === category);
      } else {
        posts = await db.select().from(blogPosts)
          .where(eq(blogPosts.status, 'published'))
          .orderBy(desc(blogPosts.publishedAt));
      }

      const categories = ['market-insights', 'home-buying', 'home-selling', 'investment', 'neighborhood', 'technology', 'mortgage', 'staging'];
      const categoriesHtml = categories.map(c => {
        const label = c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const active = category === c ? ' active' : '';
        return `<a href="/blog?category=${c}" class="cat-pill${active}">${label}</a>`;
      }).join('\n');

      let postsHtml = '';
      if (posts.length === 0) {
        postsHtml = `<div class="empty-state" style="grid-column: 1 / -1;"><h2>No posts yet</h2><p>Check back soon for real estate insights and market updates.</p></div>`;
      } else {
        postsHtml = posts.map(p => {
          const date = p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
          const coverHtml = p.coverImage
            ? `<img src="${p.coverImage}" alt="${p.title}" class="card-cover" />`
            : `<div class="card-cover"></div>`;
          return `<a href="/blog/${p.slug}" class="post-card">
            ${coverHtml}
            <div class="card-body">
              <div class="card-category">${p.category.replace(/-/g, ' ')}</div>
              <h2 class="card-title">${p.title}</h2>
              <p class="card-excerpt">${p.excerpt}</p>
              <div class="card-footer">
                <span>${p.authorName}</span>
                <span>${date}</span>
              </div>
            </div>
          </a>`;
        }).join('\n');
      }

      const html = blogIndexTemplate
        .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
        .replace('BLOG_CATEGORIES_HTML', categoriesHtml)
        .replace('BLOG_POSTS_HTML', postsHtml);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
    } catch (error) {
      console.error("Blog index error:", error);
      res.status(500).send("Internal server error");
    }
  });

  app.get("/blog/:slug", async (req: Request, res: Response) => {
    try {
      const forwardedProto = req.header("x-forwarded-proto");
      const protocol = forwardedProto || req.protocol || "https";
      const host = req.header("x-forwarded-host") || req.get("host");
      const baseUrl = `${protocol}://${host}`;

      const allPosts = await db.select().from(blogPosts)
        .where(eq(blogPosts.status, 'published'));
      const post = allPosts.find(p => p.slug === req.params.slug);

      if (!post) {
        return res.status(404).send("Post not found");
      }

      let tags: string[] = [];
      try { tags = JSON.parse(post.tags); } catch {}

      const tagMeta = tags.map(t => `<meta property="article:tag" content="${t}" />`).join('\n    ');
      const tagsHtml = tags.map(t => `<span class="tag">${t}</span>`).join('\n');
      const dateFormatted = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';
      const coverImageTag = post.coverImage
        ? `<img src="${post.coverImage}" alt="${post.title}" class="cover-image" />`
        : '';
      const coverImage = post.coverImage || `${baseUrl}/assets/images/icon.png`;

      const html = blogPageTemplate
        .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
        .replace(/BLOG_META_TITLE/g, post.metaTitle || post.title)
        .replace(/BLOG_META_DESCRIPTION/g, post.metaDescription || post.excerpt)
        .replace(/BLOG_TITLE/g, post.title)
        .replace(/BLOG_SLUG/g, post.slug)
        .replace(/BLOG_AUTHOR/g, post.authorName)
        .replace(/BLOG_CATEGORY/g, post.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .replace(/BLOG_PUBLISHED_AT/g, post.publishedAt?.toISOString() || '')
        .replace(/BLOG_UPDATED_AT/g, post.updatedAt?.toISOString() || '')
        .replace(/BLOG_DATE_FORMATTED/g, dateFormatted)
        .replace(/BLOG_COVER_IMAGE/g, coverImage)
        .replace('BLOG_COVER_IMAGE_TAG', coverImageTag)
        .replace('BLOG_CONTENT', post.content)
        .replace('BLOG_TAG_META', tagMeta)
        .replace('BLOG_TAGS_HTML', tagsHtml);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
    } catch (error) {
      console.error("Blog post error:", error);
      res.status(500).send("Internal server error");
    }
  });

  log("Expo routing: Checking expo-platform header on / and /manifest");
  log("Blog pages: /blog and /blog/:slug");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);

  const PgStore = connectPg(session);
  app.use(session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || 'trusthome-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  }));

  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  registerVoiceAiRoutes(app);
  registerOrbitRoutes(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
