import { PrismaClient } from "@prisma/client";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { type SapphireClient } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";

export async function listClubs(interaction: Subcommand.ChatInputCommandInteraction, client: SapphireClient) {
  const prisma = new PrismaClient();

  const clubs = await prisma.club.findMany({
    select: {
      name: true,
      channel: true,
      id: true,
      server: true,
      topics: true,
      members: true,
      isPending: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!clubs) {
    return interaction.reply({ content: "There are no clubs", ephemeral: true });
  }

  if (clubs.length <= 0) {
    return interaction.reply({ content: "There are no clubs", ephemeral: true });
  }

  const embed = new EmbedBuilder();
  embed.setTitle("Clubs");
  embed.setDescription("List of all clubs");
  embed.setColor("#00ff00");
  embed.setTimestamp();
  embed.setFooter({
    text: `Requested by ${interaction.user.username}`,
    iconURL: interaction.user.displayAvatarURL(),
  });

  for (const club of clubs) {
    const topicsRaw = club.topics.split(",").map((topic) => topic.trim());
    const topics = topicsRaw.slice(0, 4).join(", ");

    embed.addFields({
      name: club.name,
      value: `Topics: ${topics}\nMembers: ${club.members.length}\nPending: ${club.isPending ? "Yes" : "No"}`,
      inline: false,
    });
  }

  return interaction.reply({ embeds: [embed], ephemeral: true });
}
