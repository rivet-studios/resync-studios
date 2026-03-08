import { REST, Routes } from "discord.js";

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

let rest: REST | null = null;
let botUserId: string | null = null;

export async function initializeDiscordBot() {
  if (!BOT_TOKEN) {
    console.warn(
      "⚠️ DISCORD_BOT_TOKEN not configured. Discord sync will be disabled.",
    );
    return null;
  }

  try {
    rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
    const botUser = (await rest.get(Routes.user())) as {
      id: string;
      username: string;
      discriminator: string;
    };
    botUserId = botUser.id;
    console.log(
      `✅ Discord bot connected as ${botUser.username}#${botUser.discriminator}`,
    );
    return rest;
  } catch (error) {
    console.error("❌ Failed to initialize Discord bot:", error);
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
