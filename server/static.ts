import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try multiple paths for the public directory
  const possiblePaths = [
    path.resolve(__dirname, "./public"), // After bundling: dist/public
    path.resolve(__dirname, "../dist/public"), // If running from root
    path.join(process.cwd(), "dist/public"), // Fallback to cwd
    path.join(process.cwd(), "public"), // Direct public folder
  ];
  
  let distPath: string | null = null;
  let indexPath: string | null = null;

  for (const p of possiblePaths) {
    const idx = path.resolve(p, "index.html");
    if (fs.existsSync(idx)) {
      distPath = p;
      indexPath = idx;
      console.log(`✅ Found static files at: ${distPath}`);
      break;
    }
  }

  if (!distPath || !indexPath) {
    console.error(`❌ Could not find static files. Checked:`);
    possiblePaths.forEach(p => {
      console.error(`   - ${p}`);
      try {
        const contents = fs.readdirSync(p);
        console.error(`     Contains: ${contents.join(", ")}`);
      } catch (e) {
        console.error(`     [not accessible]`);
      }
    });
    throw new Error("Static files directory not found");
  }

  app.use(express.static(distPath, { 
    maxAge: "1h",
    etag: false 
  }));

  // Fallback to index.html for all routes (SPA routing)
  app.use("*", (_req, res) => {
    res.sendFile(indexPath!);
  });
}
