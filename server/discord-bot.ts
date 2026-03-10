import { Client, GatewayIntentBits, Events, REST, Routes } from "discord.js";
import { storage } from "./storage";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1419115257753768031";

const RANK_TO_ROLE: Record<string, string> = {
  "Active Members": process.env.DISCORD_ROLE_CIVILIAN || "",
  "Team Member": process.env.DISCORD_ROLE_TEAM_MEMBER || "",
  "Operations Manager": process.env.DISCORD_ROLE_OPS_MANAGER || "",
  "Company Director": process.env.DISCORD_ROLE_COMPANY_DIRECTOR || "",
  "Trial Moderator": process.env.DISCORD_ROLE_COMMUNITY_MOD || "",
  Moderator: process.env.DISCORD_ROLE_COMMUNITY_SR_MOD || "",
  Administrator: process.env.DISCORD_ROLE_COMMUNITY_ADMIN || "",
  "Senior Administrator": process.env.DISCORD_ROLE_COMMUNITY_SR_ADMIN || "",
  "RS Trust & Safety Team": process.env.DISCORD_ROLE_TRUST_SAFETY || "",
  "Staff Department Director": process.env.DISCORD_ROLE_MI_DIRECTOR || "",
  "Bronze VIP": process.env.DISCORD_ROLE_VIP || "",
  "Diamond VIP": process.env.DISCORD_ROLE_VIP_PLUS || "",
  "Founder's Edition VIP": process.env.DISCORD_ROLE_VIP_PLUS_PLUS || "",
  Lifetime: process.env.DISCORD_ROLE_LIFETIME || "",
};

const ROLE_TO_RANK: Record<string, string> = {};
for (const [rank, roleId] of Object.entries(RANK_TO_ROLE)) {
  if (roleId) ROLE_TO_RANK[roleId] = rank;
}

let client: Client | null = null;
let rest: REST | null = null;

export async function initializeDiscordBot() {
  if (!BOT_TOKEN) {
    console.warn(
      "⚠️ DISCORD_BOT_TOKEN not configured. Discord sync will be disabled.",
    );
    return null;
  }

  try {
    rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
      ],
    });

    client.once(Events.ClientReady, (readyClient) => {
      console.log(
        `✅ Discord bot connected as ${readyClient.user.username}#${readyClient.user.discriminator}`,
      );
    });

    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
      try {
        if (newMember.guild.id !== GUILD_ID) return;

        const discordId = newMember.id;
        const user = await storage.getUserByDiscordId(discordId);
        if (!user) return;

        const oldUsername = oldMember.user?.username;
        const newUsername = newMember.user?.username;
        const oldDisplayName = oldMember.displayName;
        const newDisplayName = newMember.displayName;
        const oldAvatar = oldMember.user?.avatar;
        const newAvatar = newMember.user?.avatar;

        if (oldUsername !== newUsername || oldDisplayName !== newDisplayName || oldAvatar !== newAvatar) {
          const updates: Record<string, any> = {};

          if (oldUsername !== newUsername && newUsername) {
            updates.discordUsername = newUsername;
            if (!user.email) {
              updates.username = newUsername;
            }
          }

          if (oldAvatar !== newAvatar) {
            const avatarUrl = newMember.user?.avatarURL({ size: 256 });
            if (avatarUrl) {
              updates.discordAvatar = avatarUrl;
              updates.profileImageUrl = avatarUrl;
            }
          }

          if (Object.keys(updates).length > 0) {
            await storage.updateUser(user.id, updates as any);
            console.log(
              `🔄 Synced Discord profile changes for ${discordId}: ${Object.keys(updates).join(", ")}`,
            );
          }
        }

        const oldRoleIds = new Set(oldMember.roles.cache.map((r) => r.id));
        const newRoleIds = new Set(newMember.roles.cache.map((r) => r.id));

        const addedRoles = [...newRoleIds].filter((id) => !oldRoleIds.has(id));
        const removedRoles = [...oldRoleIds].filter((id) => !newRoleIds.has(id));

        if (addedRoles.length === 0 && removedRoles.length === 0) return;

        const managedRoleIds = new Set(Object.values(RANK_TO_ROLE).filter(Boolean));
        const relevantAdded = addedRoles.filter((id) => managedRoleIds.has(id));
        const relevantRemoved = removedRoles.filter((id) => managedRoleIds.has(id));

        if (relevantAdded.length === 0 && relevantRemoved.length === 0) return;

        const currentManagedRoles = [...newRoleIds]
          .filter((id) => managedRoleIds.has(id))
          .map((id) => ROLE_TO_RANK[id])
          .filter(Boolean);

        const rankHierarchy = [
          "Company Director",
          "Operations Manager",
          "Staff Department Director",
          "Team Member",
          "Staff Internal Affairs",
          "Developer",
          "Senior Administrator",
          "Administrator",
          "Moderator",
          "Trial Moderator",
          "Appeals Moderator",
          "Customer Relations",
          "Lifetime",
          "Founder's Edition VIP",
          "Diamond VIP",
          "Bronze VIP",
          "Community Partner",
          "Trusted Member",
          "Vehicle Tester",
          "Active Members",
        ];

        let highestRank = "Active Members";
        for (const rank of rankHierarchy) {
          if (currentManagedRoles.includes(rank)) {
            highestRank = rank;
            break;
          }
        }

        if (user.userRank !== highestRank) {
          const oldRank = user.userRank;
          await storage.updateUserRank(user.id, highestRank);
          console.log(
            `🔄 Synced rank from Discord for ${discordId}: "${oldRank}" → "${highestRank}"`,
          );
        }
      } catch (error) {
        console.error(
          `❌ Error handling GuildMemberUpdate for ${newMember.id}:`,
          error,
        );
      }
    });

    try {
      await client.login(BOT_TOKEN);
    } catch (gatewayError) {
      console.warn(
        "⚠️ Discord Gateway connection failed (privileged intents may not be enabled). " +
        "Falling back to REST-only mode. To enable real-time sync from Discord, " +
        "enable the 'Server Members Intent' in your Discord Developer Portal → Bot settings.",
      );
      client = null;
    }
    return rest;
  } catch (error) {
    console.error("❌ Failed to initialize Discord bot:", error);
    client = null;
    rest = null;
    return null;
  }
}

export async function updateDiscordNickname(
  discordId: string,
  newNickname: string,
): Promise<boolean> {
  if (!rest) {
    console.warn("⚠️ Discord bot not initialized. Cannot update nickname.");
    return false;
  }

  try {
    await rest.patch(Routes.guildMember(GUILD_ID, discordId), {
      body: { nick: newNickname },
    });
    console.log(
      `✅ Updated Discord nickname for ${discordId} to "${newNickname}"`,
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to update Discord nickname for ${discordId}:`,
      error,
    );
    return false;
  }
}

export async function updateDiscordRoles(
  discordId: string,
  newRank: string,
  oldRank?: string,
): Promise<boolean> {
  if (!rest) {
    console.warn("⚠️ Discord bot not initialized. Cannot update roles.");
    return false;
  }

  try {
    const member = (await rest.get(
      Routes.guildMember(GUILD_ID, discordId),
    )) as { roles: string[] };
    const currentRoles = new Set(member.roles);

    if (oldRank && RANK_TO_ROLE[oldRank]) {
      const oldRoleId = RANK_TO_ROLE[oldRank];
      if (oldRoleId && currentRoles.has(oldRoleId)) {
        await rest.delete(
          Routes.guildMemberRole(GUILD_ID, discordId, oldRoleId),
        );
        console.log(
          `🔄 Removed Discord role for "${oldRank}" from ${discordId}`,
        );
      }
    } else {
      const allManagedRoleIds = Object.values(RANK_TO_ROLE).filter(Boolean);
      for (const roleId of allManagedRoleIds) {
        if (currentRoles.has(roleId)) {
          await rest.delete(
            Routes.guildMemberRole(GUILD_ID, discordId, roleId),
          );
        }
      }
    }

    const newRoleId = RANK_TO_ROLE[newRank];
    if (newRoleId) {
      await rest.put(Routes.guildMemberRole(GUILD_ID, discordId, newRoleId));
      console.log(`✅ Added Discord role for "${newRank}" to ${discordId}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to update Discord roles for ${discordId}:`, error);
    return false;
  }
}

export function getDiscordClient(): REST | null {
  return rest;
}
