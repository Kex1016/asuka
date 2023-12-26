import {ApplyOptions} from '@sapphire/decorators';
import {Subcommand} from "@sapphire/plugin-subcommands";
import {PrismaClient} from "@prisma/client";
import {ChannelType} from "discord-api-types/v10";

@ApplyOptions<Subcommand.Options>({
  name: 'admin',
  description: 'Various staff commands',
  subcommands: [
    {
      type: 'group',
      name: 'clubs',
      entries: [
        {
          name: 'list-channel',
          chatInputRun: 'setListChannel',
        },
        {
          name: 'announce-channel',
          chatInputRun: 'setAnnounceChannel',
        }
      ]
    }
  ]
})
export class UserCommand extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
            builder //
                    .setName(this.name)
                    .setDescription(this.description)
                    .addSubcommandGroup((subcommandGroup) =>
                            subcommandGroup
                                    .setName('clubs')
                                    .setDescription('Club related commands')
                                    .addSubcommand((subcommand) =>
                                            subcommand
                                                    .setName('list-channel')
                                                    .setDescription('Set the channel where the club list is sent')
                                                    .addChannelOption((option) =>
                                                            option
                                                                    .setName('channel')
                                                                    .setDescription('The channel to send the list to')
                                                                    .setRequired(true)
                                                    )
                                    )
                                    .addSubcommand((subcommand) =>
                                            subcommand
                                                    .setName('announce-channel')
                                                    .setDescription('Set the channel where club announcements are sent')
                                                    .addChannelOption((option) =>
                                                            option
                                                                    .setName('channel')
                                                                    .setDescription('The channel to send the announcements to')
                                                                    .setRequired(true)
                                                    )
                                    )
                    )
    );
  }

  public async setListChannel(interaction: Subcommand.ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({
      content: 'This command can only be used in a server!',
      ephemeral: true
    });

    const channel = interaction.options.getChannel('channel', true);

    if (channel.type !== ChannelType.GuildText) return interaction.reply({
      content: 'The channel must be a text channel!',
      ephemeral: true
    });

    const prisma = new PrismaClient();
    // Create or update the server
    await prisma.server.upsert({
      where: {
        id: BigInt(interaction.guildId),
      },
      create: {
        id: BigInt(interaction.guildId),
        name: interaction.guild!.name,
        clubAnnouncementChannel: "",
        clubListChannel: channel.id,
        minimumVotesToPass: 5,
        minimumVotesToBlacklist: -10,
        minimumVotesToFail: -5
      },
      update: {
        clubListChannel: channel.id,
      }
    });

    return interaction.reply({content: `Set club list channel to ${channel}`, ephemeral: true});
  }

  public async setAnnounceChannel(interaction: Subcommand.ChatInputCommandInteraction) {
    if (!interaction.guildId) return interaction.reply({
      content: 'This command can only be used in a server!',
      ephemeral: true
    });
    const channel = interaction.options.getChannel('channel', true);

    if (channel.type !== ChannelType.GuildText) return interaction.reply({
      content: 'The channel must be a text channel!',
      ephemeral: true
    });

    const prisma = new PrismaClient();
    // Create or update the server
    await prisma.server.upsert({
      where: {
        id: BigInt(interaction.guildId),
      },
      create: {
        id: BigInt(interaction.guildId),
        name: interaction.guild!.name,
        clubAnnouncementChannel: channel.id,
        clubListChannel: "",
        minimumVotesToPass: 5,
        minimumVotesToBlacklist: -10,
        minimumVotesToFail: -5
      },
      update: {
        clubAnnouncementChannel: channel.id,
      }
    });


    return interaction.reply({content: `Set club announce channel to ${channel}`, ephemeral: true});
  }
}
