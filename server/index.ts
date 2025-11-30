import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import passport from "./auth";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";
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

// Session store
const PgSession = ConnectPgSimple(session);
const sessionStore = new PgSession({
  pool,
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
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
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
  await registerRoutes(httpServer, app);

  // CRITICAL: Add static file serving middleware BEFORE error handler
  // This serves index.html for all non-API routes (SPA routing)
  const distPublicPath = path.join(process.cwd(), "dist", "public");
  const indexHtmlPath = path.join(distPublicPath, "index.html");
  
  console.log(`📍 CWD: ${process.cwd()}`);
  console.log(`📍 Checking for index.html at: ${indexHtmlPath}`);
  console.log(`📍 Exists: ${fs.existsSync(indexHtmlPath)}`);
  
  if (fs.existsSync(indexHtmlPath)) {
    console.log("✅ PRODUCTION MODE: Serving static files from:", distPublicPath);
    app.use(express.static(distPublicPath, { etag: false }));
    
    // Serve index.html for all non-API, non-auth routes (SPA routing)
    app.use((req, res, next) => {
      // Only serve index.html for HTML requests to non-API routes
      if (!req.path.startsWith("/api") && !req.path.startsWith("/auth")) {
        return res.sendFile(indexHtmlPath);
      }
      next();
    });
  } else {
    console.log("🔧 DEV MODE: dist/public not found, using Vite dev server");
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
