import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { storage } from "./storage";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || "http://localhost:5000/auth/discord/callback";

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.warn("⚠️ Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to enable Discord login.");
}

// Passport user serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Discord Strategy
if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ["identify", "email", "guilds"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const discordId = profile.id;
          const email = profile.email || `${profile.username}@discord.local`;
          
          // Try to find existing user by Discord ID
          let user = await storage.getUserByDiscordId(discordId);
          
          if (!user) {
            // Create new user with Discord info
            user = await storage.upsertUser({
              id: undefined, // Will be auto-generated
              email,
              firstName: profile.username || undefined,
              lastName: undefined,
              profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
              username: profile.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") || profile.id,
              discordId,
              discordUsername: profile.username,
              discordAvatar: profile.avatar,
              discordLinkedAt: new Date(),
              userRank: "member",
              vipTier: "none",
            });
          } else {
            // Update existing user with latest Discord info
            user = await storage.updateUser(user.id, {
              discordUsername: profile.username,
              discordAvatar: profile.avatar,
              discordLinkedAt: new Date(),
            }) || user;
          }
          
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

export default passport;
