import {PrismaClient} from '@prisma/client';
import {Subcommand} from "@sapphire/plugin-subcommands";
import {type SapphireClient} from "@sapphire/framework";
import {EmbedBuilder, TextChannel} from "discord.js";
import {checkChannels, checkValid} from "./checks";
import {getServerChannels} from "../../util/getters";

export async function createClub(interaction: Subcommand.ChatInputCommandInteraction, client: SapphireClient) {
  if (!interaction.guildId) {
    return interaction.reply({content: 'This command can only be used in a server', ephemeral: true});
  }
  const prisma = new PrismaClient();

  if (!(await checkChannels(prisma, interaction))) {
    return interaction.reply({
      content: 'Clubs are not set up yet!',
      ephemeral: true
    });
  }

  if (!(await checkValid(prisma, interaction))) {
    return interaction.reply({
      content: 'You already own a club',
      ephemeral: true
    });
  }

  const name = interaction.options.getString('name', true);
  const description = interaction.options.getString('description', true);
  const topicsRaw = interaction.options.getString('topics', true);

  // Format the topics to a uniform format
  const topics = topicsRaw.split(',').map((topic) => {
    // Get rid of any whitespace, make it lowercase and replace any non-alphanumeric characters
    return topic.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }).join(',');

  // const club = await prisma.club.create({
  //   data: {
  //     id: BigInt(interaction.user.id),
  //     name: name,
  //     description: description,
  //     topics: topics,
  //     server: {
  //       connect: {
  //         id: BigInt(interaction.guildId),
  //       }
  //     },
  //     channel: interaction.channelId,
  //     members: {
  //       connect: {
  //         id: BigInt(interaction.user.id),
  //       }
  //     },
  //     owner: {
  //       connect: {
  //         id: BigInt(interaction.user.id),
  //       }
  //     },
  //     isPending: true,
  //   },
  //   select: {
  //     name: true,
  //     description: true,
  //     topics: true,
  //     isPending: true,
  //     createdAt: true,
  //     updatedAt: true,
  //   }
  // });

  // FIXME: the code hangs here
  await prisma.club.create({
    data: {
      id: BigInt(interaction.user.id),
      name: name,
      description: description,
      topics: topics,
      server: {
        connect: {
          id: BigInt(interaction.guildId),
        }
      },
      channel: interaction.channelId,
      members: {
        connect: {
          id: BigInt(interaction.user.id),
        }
      },
      owner: {
        connect: {
          id: BigInt(interaction.user.id),
        }
      },
      isPending: true,
    }
  });

  return interaction.reply({content: 'Creating club...', ephemeral: true});

  // if (!club) {
  //   return interaction.reply({content: 'Failed to create club', ephemeral: true});
  // }
  //
  // const channels = await getServerChannels(interaction.guildId || '0', prisma);
  // if (!channels) {
  //   return interaction.reply({content: 'Failed to create club', ephemeral: true});
  // }
  //
  // const clubAnnouncementChannel = await client.channels.fetch(channels.clubAnnouncementChannel);
  // if (!clubAnnouncementChannel) {
  //   return interaction.reply({content: 'Failed to create club', ephemeral: true});
  // }
  //
  // if (!(clubAnnouncementChannel instanceof TextChannel)) {
  //   return interaction.reply({content: 'Failed to create club', ephemeral: true});
  // }
  //
  // const clubAnnounceEmbed = new EmbedBuilder();
  // clubAnnounceEmbed.setTitle('Club Created');
  // clubAnnounceEmbed.setDescription(`Club ${club.name} has been created!`);
  // clubAnnounceEmbed.setColor('#00ff00');
  // clubAnnounceEmbed.setTimestamp();
  // clubAnnounceEmbed.setFooter({
  //   text: `Created by ${interaction.user.username}`,
  //   iconURL: interaction.user.displayAvatarURL(),
  // });
  //
  // clubAnnounceEmbed.addFields([
  //   {
  //     name: 'Name',
  //     value: club.name,
  //     inline: true,
  //   },
  //   {
  //     name: 'Description',
  //     value: club.description,
  //     inline: true,
  //   },
  //   {
  //     name: 'Topics',
  //     value: club.topics,
  //     inline: true,
  //   },
  //   {
  //     name: 'Pending',
  //     value: club.isPending ? 'Yes' : 'No',
  //     inline: true,
  //   },
  //   {
  //     name: 'Created At',
  //     value: club.createdAt.toDateString(),
  //     inline: true,
  //   },
  //   {
  //     name: 'Updated At',
  //     value: club.updatedAt.toDateString(),
  //     inline: true,
  //   }
  // ]);
  //
  // await clubAnnouncementChannel.send({embeds: [clubAnnounceEmbed]});
  //
  // const successEmbed = new EmbedBuilder();
  // successEmbed.setTitle('Club Created');
  // successEmbed.setDescription(`Club ${club.name} has been created!`);
  // successEmbed.setColor('#00ff00');
  // successEmbed.setTimestamp();
  // successEmbed.setFooter({
  //   text: `Requested by ${interaction.user.username}`,
  //   iconURL: interaction.user.displayAvatarURL(),
  // });
  //
  // return interaction.reply({embeds: [successEmbed], ephemeral: true});
}