import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { storage } from "./storage";
import { updateDiscordNickname, syncUserFromDiscord, ensureVerifiedMemberRole } from "./discord-bot";
import { sendSiteLog } from "./lib/discord-webhooks";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

// Resolve the callback URL. Order of precedence:
//   1. DISCORD_CALLBACK_URL env override (always wins if set)
//   2. Production → https://rivetstudiosus.com/api/auth/discord/callback
//   3. Replit dev domain (REPLIT_DEV_DOMAIN, modern format)
//   4. Legacy ${REPL_SLUG}.${REPL_OWNER}.repl.co (older Repls)
//   5. Localhost fallback
function resolveCallbackUrl(): string {
  if (process.env.DISCORD_CALLBACK_URL) return process.env.DISCORD_CALLBACK_URL;
  if (process.env.NODE_ENV === "production")
    return "https://rivetstudiosus.com/api/auth/discord/callback";
  if (process.env.REPLIT_DEV_DOMAIN)
    return `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/discord/callback`;
  if (process.env.REPL_SLUG && process.env.REPL_OWNER)
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/discord/callback`;
  return "http://localhost:5000/api/auth/discord/callback";
}
const CALLBACK_URL = resolveCallbackUrl();

console.log(`🔐 Discord OAuth Callback URL: ${CALLBACK_URL}`);
console.log(`   ↳ This MUST match EXACTLY one of the Redirects registered at:`);
console.log(`     https://discord.com/developers/applications/${DISCORD_CLIENT_ID || "<APP_ID>"}/oauth2`);
console.log(`   ↳ Common 500 causes: trailing slash mismatch, http vs https, www vs non-www,`);
console.log(`     wrong DISCORD_CLIENT_SECRET, or stale CALLBACK_URL after a domain change.`);

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.warn(
    "⚠️ Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to enable Discord login.",
  );
} else {
  console.log(
    `✅ Discord OAuth configured with Client ID: ${DISCORD_CLIENT_ID.slice(0, 8)}...`,
  );
}

// Passport user serialization
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Convert nulls to undefined to match User type if necessary,
      // but usually casting is enough for passport
      done(null, user as any);
    } catch (err) {
      done(err);
    }
  },
);

// Discord Strategy
if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ["identify", "email", "guilds"],
        state: false,
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
          // 1. DATA PREP - Use fallbacks to prevent NULL crashes
          const discordId = profile.id;
          const email = profile.email || `${profile.username || profile.id}@discord.local`;
          const avatarUrl = profile.avatar 
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` 
            : null; // Use null instead of undefined for Postgres

          console.log("🚀 Discord auth started for:", profile.username);

          // 2. CHECK BY DISCORD ID FIRST
          let user = await storage.getUserByDiscordId(discordId);

          if (!user) {
            console.log("🔍 No Discord ID match, checking email...");
            let existingUser = null;
            if (email && !email.endsWith("@discord.local")) {
              existingUser = await storage.getUserByEmail(email);
            }

            if (existingUser) {
              console.log("🔗 Email match found! Linking account...");
              user = await storage.updateUser(existingUser.id, {
                discordId,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                discordLinkedAt: new Date(),
              });
            } else {
              console.log("✨ Creating brand new user...");
              const baseUsername = profile.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user";
              const newUsername = `${baseUsername}_${profile.id.slice(-6)}`;

              // FAILSAFE: Ensure every field has a value to satisfy NOT NULL constraints
              user = await storage.upsertUser({
                email,
                username: newUsername,
                password: null as any,
                firstName: profile.username || "User",
                profileImageUrl: avatarUrl,
                discordId,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                discordLinkedAt: new Date(),
                userRank: "Members",
                vipTier: "none",
              });
            }
          } else {
            console.log("🔄 Existing Discord user found, refreshing data...");
            user = await storage.updateUser(user.id, {
              discordUsername: profile.username,
              discordAvatar: profile.avatar,
              discordLinkedAt: new Date(),
            });
          }

          // 3. BACKGROUND TASKS (Run sequentially to avoid rate limits)
if (user) {
  (async () => {
    try {
      await updateDiscordNickname(discordId, user.username || "User");
      await new Promise(resolve => setTimeout(resolve, 500));
      await syncUserFromDiscord(discordId);
      await ensureVerifiedMemberRole(discordId);
      sendSiteLog({ title: "User Login Successful", level: "success" });
    } catch (e) {
      console.error("Non-critical background task failed:", e);
    }
  })();
}

          return done(null, user);
        } catch (err) {
          // THE ULTIMATE FAILSAFE
          console.error("❌ CRITICAL AUTH CRASH:", err);
          return done(null, false, { message: "Authentication failed at database level" });
        }
      },
    ),
  );
}
export default passport;