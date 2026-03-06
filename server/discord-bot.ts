import { Client, GatewayIntentBits, REST, Routes } from "discord.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1419115257753768031";

const RANK_TO_ROLE: Record<string, string> = {
  "Member": process.env.DISCORD_ROLE_CIVILIAN || "",
  "Team Member": process.env.DISCORD_ROLE_TEAM_MEMBER || "",
  "Operations Manager": process.env.DISCORD_ROLE_OPS_MANAGER || "",
  "Company Director": process.env.DISCORD_ROLE_COMPANY_DIRECTOR || "",
  "Community Moderator": process.env.DISCORD_ROLE_COMMUNITY_MOD || "",
  "Community Senior Moderator": process.env.DISCORD_ROLE_COMMUNITY_SR_MOD || "",
  "Community Administrator": process.env.DISCORD_ROLE_COMMUNITY_ADMIN || "",
  "Community Senior Administrator":
    process.env.DISCORD_ROLE_COMMUNITY_SR_ADMIN || "",
  "RS Trust & Safety Team": process.env.DISCORD_ROLE_TRUST_SAFETY || "",
  "Staff Department Director": process.env.DISCORD_ROLE_MI_DIRECTOR || "",
  "Bronze VIP": process.env.DISCORD_ROLE_VIP || "",
  "Diamond VIP": process.env.DISCORD_ROLE_VIP_PLUS || "",
  "Founder's Edition VIP": process.env.DISCORD_ROLE_VIP_PLUS_PLUS || "",
  Lifetime: process.env.DISCORD_ROLE_LIFETIME || "",
};

let discordClient: Client | null = null;

export async function initializeDiscordBot() {
  if (!BOT_TOKEN) {
    console.warn(
      "⚠️ DISCORD_BOT_TOKEN not configured. Discord nickname sync will be disabled.",
    );
    return null;
  }

  try {
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
    });

    discordClient.once("ready", () => {
      console.log(`✅ Discord bot logged in as ${discordClient?.user?.tag}`);
    });

    await discordClient.login(BOT_TOKEN);
    return discordClient;
  } catch (error) {
    console.error("❌ Failed to initialize Discord bot:", error);
    return null;
  }
}

export async function updateDiscordNickname(
  discordId: string,
  newNickname: string,
): Promise<boolean> {
  if (!discordClient) {
    console.warn("⚠️ Discord bot not initialized. Cannot update nickname.");
    return false;
  }

  try {
    const guild = await discordClient.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(discordId);

    if (!member) {
      console.warn(`⚠️ Discord member not found: ${discordId}`);
      return false;
    }

    await member.setNickname(newNickname);
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
  if (!discordClient) {
    console.warn("⚠️ Discord bot not initialized. Cannot update roles.");
    return false;
  }

  try {
    const guild = await discordClient.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(discordId);

    if (!member) {
      console.warn(`⚠️ Discord member not found: ${discordId}`);
      return false;
    }

    const allManagedRoleIds = Object.values(RANK_TO_ROLE).filter(Boolean);

    if (oldRank && RANK_TO_ROLE[oldRank]) {
      const oldRoleId = RANK_TO_ROLE[oldRank];
      if (oldRoleId && member.roles.cache.has(oldRoleId)) {
        await member.roles.remove(oldRoleId);
        console.log(
          `🔄 Removed Discord role for "${oldRank}" from ${discordId}`,
        );
      }
    } else {
      for (const roleId of allManagedRoleIds) {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId);
        }
      }
    }

    const newRoleId = RANK_TO_ROLE[newRank];
    if (newRoleId) {
      await member.roles.add(newRoleId);
      console.log(`✅ Added Discord role for "${newRank}" to ${discordId}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to update Discord roles for ${discordId}:`, error);
    return false;
  }
}

export function getDiscordClient(): Client | null {
  return discordClient;
}
