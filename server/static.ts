import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // When bundled, __dirname is the dist folder, so we need ./public
  // In development, __dirname is the workspace root, so we need dist/public
  const distPath = process.env.NODE_ENV === "production" 
    ? path.resolve(__dirname, "./public")
    : path.resolve(__dirname, "./dist/public");
    
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first. Run: npm run build`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
