const fs = require("fs");

const lockfilePath = "package-lock.json";
const internalRegistryPrefix = "http://package-firewall.replit.local/npm/";
const publicRegistryPrefix = "https://registry.npmjs.org/";

if (!fs.existsSync(lockfilePath)) {
  console.log("No package-lock.json found; using package.json resolution.");
  process.exit(0);
}

const original = fs.readFileSync(lockfilePath, "utf8");
const rewritten = original.replaceAll(internalRegistryPrefix, publicRegistryPrefix);

if (rewritten !== original) {
  fs.writeFileSync(lockfilePath, rewritten);
  console.log("Prepared package-lock.json for the public npm registry.");
} else {
  console.log("package-lock.json already uses portable registry URLs.");
}