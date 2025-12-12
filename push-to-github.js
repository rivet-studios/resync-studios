import { Octokit } from "@octokit/rest";
import { spawn } from "child_process";
import fs from "fs";

let connectionSettings;

async function getAccessToken() {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=github",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    },
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("GitHub not connected");
  }
  return accessToken;
}

async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  try {
    console.log("🔐 Getting GitHub access...");
    const octokit = await getGitHubClient();

    console.log("👤 Fetching user info...");
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const username = user.login;
    console.log(`✓ Authenticated as: ${username}`);

    const repoName = "resync-studios";

    console.log(`📦 Creating GitHub repository: ${repoName}...`);
    try {
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: "REACT Studios Gaming Community Platform",
        private: false,
        auto_init: false,
      });
      console.log(`✓ Repository created: ${repoName}`);
    } catch (err) {
      if (err.status === 422) {
        console.log(`✓ Repository already exists: ${repoName}`);
      } else {
        throw err;
      }
    }

    console.log("🔗 Configuring git remote...");
    const gitUrl = `https://github.com/${username}/${repoName}.git`;

    // Remove old remote and add new one
    spawn("git", ["remote", "remove", "origin"], {
      cwd: process.cwd(),
      stdio: "ignore",
    });

    await new Promise((resolve) => {
      const proc = spawn("git", ["remote", "add", "origin", gitUrl], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      proc.on("exit", resolve);
    });

    console.log("📤 Pushing code to GitHub...");
    await new Promise((resolve, reject) => {
      const proc = spawn("git", ["push", "-u", "origin", "main"], {
        cwd: process.cwd(),
        stdio: "inherit",
        env: { ...process.env },
      });
      proc.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Git push failed with code ${code}`));
      });
    });

    console.log("✅ SUCCESS! Your code is now on GitHub!");
    console.log(
      `🌐 Repository URL: https://github.com/${username}/${repoName}`,
    );
    console.log("\n📋 Next steps for Render/Railway deployment:");
    console.log(`   1. Go to render.com or railway.app`);
    console.log(`   2. Connect your GitHub repo: ${username}/${repoName}`);
    console.log(`   3. Set Build: npm run build`);
    console.log(`   4. Set Start: npm run start`);
    console.log(`   5. Add environment variables (see DEPLOY_*.md files)`);
    console.log(`   6. Deploy!`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
