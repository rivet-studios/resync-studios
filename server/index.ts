import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "./auth";
import { initializeDatabase, pool } from "./db";
import { initializeDiscordBot } from "./discord-bot";
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
