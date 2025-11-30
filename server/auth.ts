import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { storage } from "./storage";
import { updateDiscordNickname } from "./discord-bot";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || "http://localhost:5000/auth/discord/callback";

console.log(`🔐 Discord OAuth Callback URL: ${CALLBACK_URL}`);

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.warn("⚠️ Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to enable Discord login.");
} else {
  console.log(`✅ Discord OAuth configured with Client ID: ${DISCORD_CLIENT_ID.slice(0, 8)}...`);
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
            // Check if a user already exists with this email
            let existingUser = null;
            if (email && !email.endsWith("@discord.local")) {
              existingUser = await storage.getUserByEmail(email);
            }
            
            if (existingUser) {
              // Link Discord to existing email account
              user = await storage.updateUser(existingUser.id, {
                discordId,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                discordLinkedAt: new Date(),
              }) || existingUser;
            } else {
              // Create new user with Discord info
              const newUsername = profile.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") || profile.id;
              user = await storage.upsertUser({
                id: undefined,
                email,
                password: null as any,
                firstName: profile.username || undefined,
                lastName: undefined,
                profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
                username: newUsername,
                discordId,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                discordLinkedAt: new Date(),
                userRank: "member",
                vipTier: "none",
              });
              
              // Sync nickname to Discord server
              await updateDiscordNickname(discordId, newUsername);
            }
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
