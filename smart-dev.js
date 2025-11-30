#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dir, "dist", "index.cjs");
const hasProductionBuild = fs.existsSync(distPath);

console.log(`🔍 Checking for production build at: ${distPath}`);
console.log(`✓ Production build exists: ${hasProductionBuild}`);

// If production build exists and NODE_ENV is not explicitly set to development, use production
const useProduction = hasProductionBuild && process.env.NODE_ENV !== 'development-force';

if (useProduction) {
  console.log(`🚀 Production build detected! Running in PRODUCTION mode`);
  process.env.NODE_ENV = 'production';
  const proc = spawn('node', ['dist/index.cjs'], {
    stdio: 'inherit',
    env: process.env,
  });
  proc.on('exit', (code) => process.exit(code || 0));
} else {
  console.log(`🔧 Running in DEVELOPMENT mode`);
  process.env.NODE_ENV = 'development';
  const proc = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: process.env,
  });
  proc.on('exit', (code) => process.exit(code || 0));
}
