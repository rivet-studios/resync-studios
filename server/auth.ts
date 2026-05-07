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
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: (err: any, user?: any) => void,
      ) => {
        try {
          console.log("Discord auth started", {
            id: profile?.id,
            username: profile?.username,
            email: profile?.email,
          });

          const discordId = profile.id;
          const email =
            profile.email || `${profile.username || profile.id}@discord.local`;

          let user = await storage.getUserByDiscordId(discordId);

          if (!user) {
            let existingUser = null;

            if (email && !email.endsWith("@discord.local")) {
              existingUser = await storage.getUserByEmail(email);
            }

            if (existingUser) {
              user =
                (await storage.updateUser(existingUser.id, {
                  discordId,
                  discordUsername: profile.username,
                  discordAvatar: profile.avatar,
                  discordLinkedAt: new Date(),
                })) || existingUser;
            } else {
              const baseUsername =
                profile.username?.toLowerCase().replace(/[^a-z0-9_]/g, "") ||
                "user";

              const newUsername = `${baseUsername}_${profile.id.slice(-6)}`;

              user = await storage.upsertUser({
                // id: undefined removed/disabled here because it is breaking DiscordOAuth handshake and DB handles this field automatically
                email,
                password: null as any,
                firstName: profile.username || undefined,
                lastName: undefined,
                profileImageUrl: profile.avatar? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
                username: newUsername,
                discordId,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                discordLinkedAt: new Date(),
                userRank: "Active Members",
                vipTier: "none",
              });

              updateDiscordNickname(discordId, newUsername).catch((err) =>
                console.error(
                  "❌ Failed to update Discord nickname after signup:",
                  err,
                ),
              );

              sendSiteLog({
                title: "User Login",
                level: "success",
                fields: [
                  {
                    name: "User",
                    value: user.username || profile.username || "Unknown",
                  },
                  { name: "Discord ID", value: profile.id, inline: true },
                  { name: "Email", value: email || "No email", inline: true },
                ],
              }).catch((err) =>
                console.error("❌ Failed to send site log after signup:", err),
              );
            }
          } else {
            user =
              (await storage.updateUser(user.id, {
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                discordLinkedAt: new Date(),
              })) || user;

            syncUserFromDiscord(discordId).catch((err) =>
              console.error("❌ Login sync failed:", err),
            );
          }

          console.log("✅ Discord auth success for user:", user?.id);
          done(null, user as any);
        } catch (err) {
          console.error("❌ Discord auth verify failed:", err);
          done(err as any);
        }
      },
    ),
  );
}

export default passport;
