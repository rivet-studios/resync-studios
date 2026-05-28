import { Client, GatewayIntentBits, Events, REST, Routes } from "discord.js";
import { storage } from "./storage";
import { or } from "drizzle-orm";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID || "1419115257753768031";

const RANK_NAMES_TO_DISCORD_ROLES: Record<string, string[]> = {
  Members: ["Verified Member"],
  "Active Member": ["Verified Member"],
  "Trusted Member": ["Trusted Member"],
  "Retired Team Member": ["Retired Team Member"],
  "Bronze VIP": ["Bronze Donator®"],
  "Diamond VIP": ["Diamond Donator®"],
  "Founders Edition VIP": ["Founders Edition®", "Founder's Edition®"],
  Lifetime: ["Founder's Lifetime®"],
  "Community Moderator": ["Moderator"],
  "Community Administrator": ["Admin"],
  "Community Senior Administrator": ["Senior Admin"],
  "Gameplay Engineer": ["Gameplay Engineer"],
  "Creative Designer": ["Creative Designer"],
  "Team Member": ["RIVET Studios™ Team"],
  "Staff Department Director": ["Community Staff Director"],
  "Operations Manager": ["Operations Manager"],
"Company Director": ["CEO & Founder"],
};

const RANK_HIERARCHY = [
  "Company Director",
  "Operations Manager",
  "Staff Department Director",
  "Team Member",
  "Gameplay Engineer",
  "Creative Designer",
  "Community Senior Administrator",
  "Community Administrator",
  "Community Moderator",
  "Appeals Moderator",
  "Customer Relations",
  "Retired Team Member",
  "Lifetime",
  "Founders Edition VIP",
  "Diamond VIP",
  "Bronze VIP",
  "Community Partner",
  "Trusted Member",
  "Vehicle Tester",
  "Active Member",
  "Members",
];

let RANK_TO_ROLE: Record<string, string> = {};
let ROLE_TO_RANK: Record<string, string> = {};
let VERIFIED_MEMBER_ROLE_ID: string | null = null;

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
    VERIFIED_MEMBER_ROLE_ID = newRankToRole["Members"] || roleNameToId["Verified Member"] || null;
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

        // Discord → app rank sync is intentionally disabled.
        // Role sync is one-way only (app → Discord, VIP roles only).
        // Discord role changes are ignored on purpose.
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

/**
 * VIP tiers that map to Discord roles. These are the ONLY roles the bot
 * is allowed to add/remove via VIP sync. Staff ranks are never touched.
 */
const VIP_TIER_RANKS = [
  "Bronze VIP",
  "Diamond VIP",
  "Founders Edition VIP",
  "Lifetime",
] as const;

export type VipTier = (typeof VIP_TIER_RANKS)[number] | "none" | null | undefined;

/**
 * One-way push of a user's current VIP tier to Discord.
 * Removes any other VIP role they currently have, then adds the role for
 * `newVipTier` (if it's a real tier). Never touches non-VIP roles.
 *
 * Safe to call repeatedly — idempotent.
 */
export async function syncDiscordVipRole(
  discordId: string,
  newVipTier: VipTier,
): Promise<boolean> {
  if (!rest) {
    console.warn("⚠️ Discord bot not initialized. Cannot sync VIP role.");
    return false;
  }

  if (!rolesDiscovered) {
    await discoverGuildRoles();
  }

  const vipRoleIds = VIP_TIER_RANKS
    .map((tier) => RANK_TO_ROLE[tier])
    .filter((id): id is string => Boolean(id));
  const vipRoleIdSet = new Set(vipRoleIds);

  const targetRoleId =
    newVipTier && newVipTier !== "none" ? RANK_TO_ROLE[newVipTier] : undefined;

  try {
    const member = (await rest.get(
      Routes.guildMember(GUILD_ID, discordId),
    )) as { roles: string[] };
    const currentRoles = new Set(member.roles);

    for (const roleId of vipRoleIds) {
      if (roleId === targetRoleId) continue;
      if (currentRoles.has(roleId)) {
        await rest.delete(
          Routes.guildMemberRole(GUILD_ID, discordId, roleId),
        );
        console.log(`🔄 Removed VIP role ${roleId} from ${discordId}`);
      }
    }

    if (targetRoleId && !currentRoles.has(targetRoleId)) {
      await rest.put(
        Routes.guildMemberRole(GUILD_ID, discordId, targetRoleId),
      );
      console.log(`✅ Added VIP role for "${newVipTier}" to ${discordId}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to sync VIP role for ${discordId}:`, error);
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

  const protectedRoleId = VERIFIED_MEMBER_ROLE_ID || RANK_TO_ROLE["Members"];

  try {
    const member = (await rest.get(
      Routes.guildMember(GUILD_ID, discordId),
    )) as { roles: string[] };
    const currentRoles = new Set(member.roles);

    if (oldRank && RANK_TO_ROLE[oldRank]) {
      const oldRoleId = RANK_TO_ROLE[oldRank];
      if (oldRoleId && oldRoleId !== protectedRoleId && currentRoles.has(oldRoleId)) {
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
        if (roleId === protectedRoleId) continue;
        if (currentRoles.has(roleId)) {
          await rest.delete(
            Routes.guildMemberRole(GUILD_ID, discordId, roleId),
          );
        }
      }
    }

    const newRoleId = RANK_TO_ROLE[newRank];
    if (newRoleId && newRoleId !== protectedRoleId && !currentRoles.has(newRoleId)) {
      await rest.put(Routes.guildMemberRole(GUILD_ID, discordId, newRoleId));
      console.log(`✅ Added Discord role for "${newRank}" to ${discordId}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to update Discord roles for ${discordId}:`, error);
    return false;
  }
}

export async function ensureVerifiedMemberRole(discordId: string): Promise<boolean> {
  if (!rest) {
    console.warn("⚠️ Discord bot not initialized. Cannot ensure Verified Member role.");
    return false;
  }

  if (!rolesDiscovered) {
    await discoverGuildRoles();
  }

  const roleId = VERIFIED_MEMBER_ROLE_ID || RANK_TO_ROLE["Members"];
  if (!roleId) {
    console.warn("⚠️ Verified Member role not found in Discord guild. Check role name mapping.");
    return false;
  }

  try {
    const member = (await rest.get(Routes.guildMember(GUILD_ID, discordId))) as { roles: string[] };
    if (!member.roles.includes(roleId)) {
      await rest.put(Routes.guildMemberRole(GUILD_ID, discordId, roleId));
      console.log(`✅ Added Verified Member role to ${discordId}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Failed to ensure Verified Member role for ${discordId}:`, error);
    return false;
  }
}

export async function removeVerifiedMemberRole(discordId: string): Promise<boolean> {
  if (!rest) {
    console.warn("⚠️ Discord bot not initialized. Cannot remove Verified Member role.");
    return false;
  }

  if (!rolesDiscovered) {
    await discoverGuildRoles();
  }

  const roleId = VERIFIED_MEMBER_ROLE_ID || RANK_TO_ROLE["Members"];
  if (!roleId) {
    console.warn("⚠️ Verified Member role not found in Discord guild.");
    return false;
  }

  try {
    await rest.delete(Routes.guildMemberRole(GUILD_ID, discordId, roleId));
    console.log(`🔄 Removed Verified Member role from ${discordId} (account unlinked)`);
    return true;
  } catch (error: any) {
    if (error?.status === 404) {
      return true;
    }
    console.error(`❌ Failed to remove Verified Member role for ${discordId}:`, error);
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

    // Rank sync from Discord is intentionally disabled.
    // Role sync is one-way only (app → Discord, VIP roles only).
    // We only refresh nickname/avatar metadata here.

    if (Object.keys(updates).length > 0) {
      await storage.updateUser(user.id, updates as any);
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
