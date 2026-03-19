import { Client, GatewayIntentBits, Events, REST, Routes } from "discord.js";
import { storage } from "./storage";
import { or } from "drizzle-orm";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1419115257753768031";

const RANK_NAMES_TO_DISCORD_ROLES: Record<string, string[]> = {
  "Active Members": ["RS Member", "Verified Member"],
  "Trusted Member": ["Trusted Member"],
  "Community Partner": ["TJ Studios"],
  "Vehicle Tester": ["Vehicle Tester"],
  "Bronze VIP": ["Bronze VIP®"],
  "Diamond VIP": ["Diamond VIP®"],
  "Founders Edition VIP": ["Founders Edition VIP®", "Founder's Edition VIP®"],
  Lifetime: ["Founder's Edition Lifetime®"],
  "Customer Relations": ["Customer Relations"],
  "Appeals Moderator": ["Appeal Analyst"],
  "Trial Moderator": ["Trial Moderator"],
  Moderator: ["Moderator"],
  Administrator: ["Admin"],
  "Senior Administrator": ["Senior Admin"],
  Developer: ["Gameplay Engineer", "Creative Designer"],
  "Staff Internal Affairs": ["Staff Internal Affairs"],
  "Team Member": ["RS™ Team Member"],
  "Staff Department Director": ["Staff Director"],
  "Operations Manager": ["RS™ Operations Manager"],
  "Company Director": ["RS™ Chief Executive Officer"],
};

const RANK_HIERARCHY = [
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
  "Founders Edition VIP",
  "Diamond VIP",
  "Bronze VIP",
  "Community Partner",
  "Trusted Member",
  "Vehicle Tester",
  "Active Members",
];

let RANK_TO_ROLE: Record<string, string> = {};
let ROLE_TO_RANK: Record<string, string> = {};

let client: Client | null = null;
let rest: REST | null = null;
let rolesDiscovered = false;

async function discoverGuildRoles(): Promise<void> {
  if (!rest || rolesDiscovered) return;

  try {
    const guildRoles = (await rest.get(Routes.guildRoles(GUILD_ID))) as Array<{
      id: string;
      name: string;
    }>;

    const roleNameToId: Record<string, string> = {};
    for (const role of guildRoles) {
      roleNameToId[role.name] = role.id;
    }

    const newRankToRole: Record<string, string> = {};
    const newRoleToRank: Record<string, string> = {};

    for (const [rank, possibleNames] of Object.entries(
      RANK_NAMES_TO_DISCORD_ROLES,
    )) {
      const envKey = `DISCORD_ROLE_${rank.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
      const envValue = process.env[envKey];

      if (envValue) {
        newRankToRole[rank] = envValue;
        newRoleToRank[envValue] = rank;
        continue;
      }

      for (const name of possibleNames) {
        if (roleNameToId[name]) {
          newRankToRole[rank] = roleNameToId[name];
          newRoleToRank[roleNameToId[name]] = rank;
          break;
        }
      }
    }

    RANK_TO_ROLE = newRankToRole;
    ROLE_TO_RANK = newRoleToRank;
    rolesDiscovered = true;

    const mapped = Object.keys(newRankToRole);
    const unmapped = Object.keys(RANK_NAMES_TO_DISCORD_ROLES).filter(
      (r) => !newRankToRole[r],
    );

    console.log(
      `✅ Discord role discovery complete: ${mapped.length} ranks mapped, ${unmapped.length} unmapped`,
    );
    if (mapped.length > 0) {
      console.log(`   Mapped: ${mapped.join(", ")}`);
    }
    if (unmapped.length > 0) {
      console.log(
        `   Unmapped (no matching Discord role found): ${unmapped.join(", ")}`,
      );
    }
  } catch (error) {
    console.error("❌ Failed to discover guild roles:", error);
  }
}

export async function initializeDiscordBot() {
  if (!BOT_TOKEN) {
    console.warn(
      "⚠️ DISCORD_BOT_TOKEN not configured. Discord sync will be disabled.",
    );
    return null;
  }

  try {
    rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

    await discoverGuildRoles();

    client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    client.once(Events.ClientReady, (readyClient) => {
      console.log(
        `✅ Discord bot connected as ${readyClient.user.username}#${readyClient.user.discriminator}`,
      );
    });

    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
      try {
        if (newMember.guild.id !== GUILD_ID) return;

        if (!rolesDiscovered) {
          await discoverGuildRoles();
        }

        const discordId = newMember.id;
        const user = await storage.getUserByDiscordId(discordId);
        if (!user) return;

        const oldUsername = oldMember.user?.username;
        const newUsername = newMember.user?.username;
        const oldDisplayName = oldMember.displayName;
        const newDisplayName = newMember.displayName;
        const oldAvatar = oldMember.user?.avatar;
        const newAvatar = newMember.user?.avatar;

        if (
          oldUsername !== newUsername ||
          oldDisplayName !== newDisplayName ||
          oldAvatar !== newAvatar
        ) {
          const updates: Record<string, any> = {};

          if (oldUsername !== newUsername && newUsername) {
            updates.discordUsername = newUsername;
          }

          if (oldDisplayName !== newDisplayName && newDisplayName) {
            updates.username = newDisplayName;
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
        const removedRoles = [...oldRoleIds].filter(
          (id) => !newRoleIds.has(id),
        );

        if (addedRoles.length === 0 && removedRoles.length === 0) return;

        const managedRoleIds = new Set(
          Object.values(RANK_TO_ROLE).filter(Boolean),
        );
        const relevantAdded = addedRoles.filter((id) => managedRoleIds.has(id));
        const relevantRemoved = removedRoles.filter((id) =>
          managedRoleIds.has(id),
        );

        if (relevantAdded.length === 0 && relevantRemoved.length === 0) return;

        const currentManagedRoles = [...newRoleIds]
          .filter((id) => managedRoleIds.has(id))
          .map((id) => ROLE_TO_RANK[id])
          .filter(Boolean);

        let highestRank = "Active Members";
        for (const rank of RANK_HIERARCHY) {
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

  if (!rolesDiscovered) {
    await discoverGuildRoles();
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

export async function syncUserFromDiscord(discordId: string): Promise<boolean> {
  if (!rest) return false;

  if (!rolesDiscovered) {
    await discoverGuildRoles();
  }

  try {
    const member = (await rest.get(
      Routes.guildMember(GUILD_ID, discordId),
    )) as {
      roles: string[];
      nick: string | null;
      user: { username: string; avatar: string | null; id: string };
    };

    const user = await storage.getUserByDiscordId(discordId);
    if (!user) return false;

    const updates: Record<string, any> = {};

    if (member.nick && member.nick !== user.username) {
      updates.username = member.nick;
    } else if (!member.nick && member.user.username !== user.discordUsername) {
      updates.discordUsername = member.user.username;
    }

    if (member.user.avatar) {
      const avatarUrl = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=256`;
      if (avatarUrl !== user.discordAvatar) {
        updates.discordAvatar = avatarUrl;
        updates.profileImageUrl = avatarUrl;
      }
    }

    const managedRoleIds = new Set(Object.values(RANK_TO_ROLE).filter(Boolean));
    const currentManagedRoles = member.roles
      .filter((id) => managedRoleIds.has(id))
      .map((id) => ROLE_TO_RANK[id])
      .filter(Boolean);

    let highestRank = "Active Members";
    for (const rank of RANK_HIERARCHY) {
      if (currentManagedRoles.includes(rank)) {
        highestRank = rank;
        break;
      }
    }

    if (Object.keys(updates).length > 0) {
      await storage.updateUser(user.id, updates as any);
    }

    if (user.userRank !== highestRank) {
      await storage.updateUserRank(user.id, highestRank);
      console.log(
        `🔄 Manual sync rank for ${discordId}: "${user.userRank}" → "${highestRank}"`,
      );
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to sync user from Discord ${discordId}:`, error);
    return false;
  }
}

export function getDiscordClient(): REST | null {
  return rest;
}

export async function getDiscordMemberCount(): Promise<number> {
  if (!rest) return 0;
  try {
    const guild = (await rest.get(Routes.guild(GUILD_ID), {
      query: new URLSearchParams({ with_counts: "true" }),
    })) as { approximate_member_count?: number };
    return guild.approximate_member_count || 0;
  } catch (error) {
    console.error("❌ Failed to fetch Discord member count:", error);
    return 0;
  }
}

export function getRoleMappingStatus(): {
  mapped: string[];
  unmapped: string[];
  total: number;
} {
  const mapped = Object.keys(RANK_TO_ROLE);
  const unmapped = Object.keys(RANK_NAMES_TO_DISCORD_ROLES).filter(
    (r) => !RANK_TO_ROLE[r],
  );
  return {
    mapped,
    unmapped,
    total: Object.keys(RANK_NAMES_TO_DISCORD_ROLES).length,
  };
}
