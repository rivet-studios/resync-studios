import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { storage } from "./storage";
import { updateDiscordNickname, syncUserFromDiscord } from "./discord-bot";
import { sendSiteLog } from "./lib/discord-webhooks";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.NODE_ENV === 'production' 
  ? "https://rivetstudiosus.com/api/auth/discord/callback" 
  : `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/discord/callback`;

console.log(`🔐 Discord OAuth Callback URL: ${CALLBACK_URL}`);

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
                userRank: "Active Members",
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

          // 3. BACKGROUND TASKS (Don't let these crash the login!)
          if (user) {
            updateDiscordNickname(discordId, user.username || "User").catch((_e) => 
  console.error("Nickname sync failed")
);
            syncUserFromDiscord(discordId).catch(_e => console.error("Data sync failed"));
            
            sendSiteLog({
              title: "User Login",
              level: "success",
              fields: [
                { name: "User", value: user.username },
                { name: "Discord ID", value: discordId },
              ]
            }).catch(_e => {});
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