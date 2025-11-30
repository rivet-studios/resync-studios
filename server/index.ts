import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "./auth";
import { initializeDatabase, pool } from "./db";
import { initializeDiscordBot } from "./discord-bot";
import fs from "fs";
import path from "path";

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
      vipTier?: string;
    }
  }
}

// Session store - using PostgreSQL for persistence
const PgSession = pgSession(session);
const sessionStore = new PgSession({
  pool,
  tableName: "sessions",
  createTableIfMissing: true,
});

// Session middleware
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    name: "resync.sid", // Custom session cookie name
  })
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

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database tables on startup
  await initializeDatabase();
  
  // Initialize Discord bot for nickname syncing
  await initializeDiscordBot();
  
  await registerRoutes(httpServer, app);

  // Static file serving for SPA
  const distPublicPath = path.join(process.cwd(), "dist", "public");
  const indexHtmlPath = path.join(distPublicPath, "index.html");
  
  console.log(`📍 CWD: ${process.cwd()}`);
  console.log(`📍 Index.html path: ${indexHtmlPath}`);
  console.log(`📍 Index.html exists: ${fs.existsSync(indexHtmlPath)}`);
  
  // Health check endpoint
  app.get("/_health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  if (fs.existsSync(indexHtmlPath)) {
    console.log("✅ PRODUCTION MODE: Serving from dist/public");
    
    // Serve all static assets with no caching
    app.use(express.static(distPublicPath, { 
      etag: false,
      maxAge: 0
    }));
    
    // Catch-all: serve index.html for all non-API routes (SPA routing)
    app.all("*", (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    console.log("🔧 DEV MODE: Using Vite dev server");
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
