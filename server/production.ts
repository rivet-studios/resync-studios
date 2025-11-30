// Production-only entry point
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));

// Check if dist exists before importing app
const distPath = path.join(__dir, "..", "dist", "public", "index.html");
if (!fs.existsSync(distPath)) {
  console.error("❌ FATAL: dist/public/index.html not found");
  console.error(`Expected at: ${distPath}`);
  process.exit(1);
}

console.log("✅ Production build verified");
await import("./index.js");
