import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try multiple possible paths for the public folder
  let distPath: string;
  
  const possiblePaths = [
    // When bundled and deployed by Replit
    path.resolve(__dirname, "./public"),
    // When bundled but in workspace
    path.resolve(__dirname, "../dist/public"),
    // When running from workspace root in production
    path.resolve(process.cwd(), "dist/public"),
  ];
  
  // Find the first path that exists
  distPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  
  if (!fs.existsSync(distPath)) {
    console.error(`Available paths checked: ${possiblePaths.join(", ")}`);
    console.error(`CWD: ${process.cwd()}, __dirname: ${__dirname}`);
    throw new Error(
      `Could not find the build directory at ${distPath}. Ensure npm run build was executed.`,
    );
  }

  console.log(`📁 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // Fallback to index.html for client-side routing
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
