import {Subcommand} from "@sapphire/plugin-subcommands";
import {PrismaClient} from "@prisma/client";

/*
* Checks if the server has the correct channels for clubs
* @param prisma - The prisma client
* @param interaction - The interaction
* @returns {boolean} - True if the server has the correct channels, false if not
 */
export async function checkChannels(prisma: PrismaClient, interaction: Subcommand.ChatInputCommandInteraction) {
  if (!interaction.guildId) return false;

  // Get server settings, check if there's an announcement or list channel for clubs
  const server = await prisma.server.findUnique({
    where: {
      id: BigInt(interaction.guildId),
    },
    select: {
      clubAnnouncementChannel: true,
      clubListChannel: true,
    }
  });

  if (!server) {
    return false;
  }

  if (!server.clubAnnouncementChannel) {
    return false;
  }

  if (!server.clubListChannel) {
    return false;
  }

  return true;
}

/*
* Checks if the user has a club already
* @param prisma - The prisma client
* @param interaction - The interaction
* @returns {boolean} - True if the user is allowed to create a club, false if not
*/
export async function checkValid(prisma: PrismaClient, interaction: Subcommand.ChatInputCommandInteraction) {
  const vals = await prisma.club.findMany({
    where: {
      ownerId: parseInt(interaction.user.id),
    },
    select: {
      ownerId: true,
    }
  });

  if (vals.length > 0) {
    return false;
  }

  return true;
}