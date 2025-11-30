import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Determine the public directory path
  // When bundled, __dirname = /path/to/dist, so ./public = /path/to/dist/public
  const distPath = path.resolve(__dirname, "./public");
  
  console.log(`📁 Looking for static files at: ${distPath}`);
  console.log(`📁 __dirname: ${__dirname}`);
  console.log(`📁 process.cwd(): ${process.cwd()}`);
  
  // Check if index.html exists
  const indexPath = path.resolve(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ index.html not found at: ${indexPath}`);
    console.error(`📁 Checking what's in ${distPath}:`);
    try {
      const contents = fs.readdirSync(distPath);
      console.error(`   Contents: ${contents.join(", ")}`);
    } catch (e) {
      console.error(`   Directory doesn't exist or can't be read`);
    }
    throw new Error(`Static files directory not found at ${distPath}`);
  }

  console.log(`✅ Static files found. Serving from: ${distPath}`);
  app.use(express.static(distPath, { 
    maxAge: "1h",
    etag: false 
  }));

  // Fallback to index.html for all routes (SPA routing)
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}
