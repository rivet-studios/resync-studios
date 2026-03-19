import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "./auth";
import { initializeDatabase, pool } from "./db";
import { initializeDiscordBot } from "./discord-bot";
import { WebhookHandlers } from "./webhookHandlers";
import fs from "fs";
import path from "path";

console.log("🔐 ADMIN_USER_ID at startup:", process.env.ADMIN_USER_ID);

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
    user?: any;
    isAuthenticated?(): boolean;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      username?: string;
      discordId?: string;
      userRank?: string;
      isBanned?: boolean;
      vipTier?: string;
    }
  }
}

// ---- Session store (PostgreSQL) ----
const PgSession = pgSession(session);
const sessionStore = new PgSession({
  pool,
  tableName: "sessions",
  createTableIfMissing: true,
});

console.log("✅ Session store initialized with PostgreSQL");

// ---- Stripe webhook route (MUST be before express.json()) ----
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// ---- Middleware ----
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    name: "resync.sid",
  }),
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
  maxAge: "7d",
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ---- Logging helper ----
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Log API requests
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// ---- Health check endpoint (available immediately) ----
app.get("/_health", (_req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV });
});

// ---- Global error handler (keep it registered early) ----
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// ---- Start listening FIRST (Render needs an open port quickly) ----
const port = parseInt(process.env.PORT || "5000", 10);
const host = "0.0.0.0";

httpServer.listen(port, host, () => {
  log(`✅ serving on http://${host}:${port}`);
});

// ---- Then perform slow startup tasks (do not block port binding) ----
(async () => {
  try {
    console.log("STEP: init db");
    await initializeDatabase();
    console.log("STEP: init db done");

    // Initialize Stripe (non-blocking)
    console.log("STEP: init stripe (non-blocking)");
    (async () => {
      try {
        const { runMigrations } = await import('stripe-replit-sync');
        const { getStripeSync } = await import('./stripeClient');
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
          console.warn('⚠️ DATABASE_URL not set, skipping Stripe init');
          return;
        }
        await runMigrations({ databaseUrl });
        console.log('✅ Stripe schema ready');

        const stripeSync = await getStripeSync();

        const domains = process.env.REPLIT_DOMAINS?.split(',')[0] || process.env.REPLIT_DEV_DOMAIN;
        if (domains) {
          const webhookBaseUrl = `https://${domains}`;
          try {
            const result = await stripeSync.findOrCreateManagedWebhook(
              `${webhookBaseUrl}/api/stripe/webhook`
            );
            console.log(`✅ Stripe webhook configured: ${result?.webhook?.url || 'ready'}`);
          } catch (webhookErr: any) {
            console.warn('⚠️ Stripe webhook setup skipped:', webhookErr.message);
          }
        }

        stripeSync.syncBackfill()
          .then(() => console.log('✅ Stripe data synced'))
          .catch((err: any) => console.error('⚠️ Stripe backfill error:', err.message));

        const { initializeStripeProducts } = await import('./stripe-products');
        await initializeStripeProducts();
      } catch (error: any) {
        console.error('⚠️ Stripe init failed (non-critical):', error.message);
      }
    })();

    // Discord bot can hang; don't block the web server coming up.
    console.log("STEP: init discord bot (non-blocking)");
    initializeDiscordBot()
      .then(() => console.log("STEP: init discord bot done"))
      .catch((e) => console.error("❌ Discord bot failed to init:", e));

    console.log("STEP: register routes");
    await registerRoutes(httpServer, app);
    console.log("STEP: register routes done");

    // Static file serving for SPA
    const distPublicPath = path.join(process.cwd(), "dist", "public");
    const indexHtmlPath = path.join(distPublicPath, "index.html");

    console.log(`📍 CWD: ${process.cwd()}`);
    console.log(`📍 Index.html path: ${indexHtmlPath}`);
    console.log(`📍 Index.html exists: ${fs.existsSync(indexHtmlPath)}`);

    if (process.env.NODE_ENV === "production") {
      if (fs.existsSync(indexHtmlPath)) {
        console.log("✅ PRODUCTION MODE: Serving from dist/public");

        // Serve static assets with no caching
        app.use(
          express.static(distPublicPath, {
            etag: false,
            maxAge: 0,
          }),
        );

        // Catch-all: serve index.html for all non-API routes (SPA routing)
        app.all("*", (req, res) => {
          res.sendFile(indexHtmlPath);
        });
      } else {
        // If you hit this on Render, your build output path doesn't match runtime.
        console.warn(
          "⚠️ PRODUCTION MODE but dist/public/index.html was not found. " +
            "Check your build output path so it generates dist/public at the repo root.",
        );
      }
    } else {
      console.log("🔧 DEV MODE: Using Vite dev server");
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    console.log("✅ Startup sequence complete");
  } catch (err) {
    console.error("❌ Startup failed:", err);
    // If startup fails, exit so Render restarts the service and you see the error clearly.
    process.exit(1);
  }
})();
