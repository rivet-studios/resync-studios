import { Client, GatewayIntentBits, REST, Routes } from "discord.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1419115257753768031";

let discordClient: Client | null = null;

export async function initializeDiscordBot() {
  if (!BOT_TOKEN) {
    console.warn("⚠️ DISCORD_BOT_TOKEN not configured. Discord nickname sync will be disabled.");
    return null;
  }

  try {
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
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
  newNickname: string
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
    console.log(`✅ Updated Discord nickname for ${discordId} to "${newNickname}"`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update Discord nickname for ${discordId}:`, error);
    return false;
  }
}

export function getDiscordClient(): Client | null {
  return discordClient;
}
