import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { listClubs } from "../../command-functions/Clubs/listClubs";
import { createClub } from "../../command-functions/Clubs/createClub";

@ApplyOptions<Subcommand.Options>({
  name: "club",
  description: "Club related commands",
  subcommands: [
    {
      name: "list",
      chatInputRun: "listClubs",
    },
    {
      name: "create",
      chatInputRun: "createClub",
    },
    {
      name: "join",
      chatInputRun: "joinClub",
    },
    {
      name: "leave",
      chatInputRun: "leaveClub",
    },
    {
      name: "info",
      chatInputRun: "clubInfo",
    },
    {
      name: "invite",
      chatInputRun: "inviteToClub",
    },
    {
      name: "kick",
      chatInputRun: "kickFromClub",
    },
    {
      name: "archive",
      chatInputRun: "archiveClub",
    },
  ],
})
export class UserCommand extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List all clubs"))
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setDescription("Create a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setRequired(true)
            )
            .addStringOption((option) =>
              option.setName("description").setDescription("The description of the club").setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName("topics")
                .setDescription('Comma separated list of topics (e.g. "sports, music"). Max 4 topics.')
                .setAutocomplete(true)
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("join")
            .setDescription("Join a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setAutocomplete(true).setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("leave")
            .setDescription("Leave a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setAutocomplete(true).setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("info")
            .setDescription("Get info about a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setAutocomplete(true).setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("invite")
            .setDescription("Invite a user to a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setAutocomplete(true).setRequired(true)
            )
            .addUserOption((option) => option.setName("user").setDescription("The user to invite").setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("kick")
            .setDescription("Kick a user from a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setAutocomplete(true).setRequired(true)
            )
            .addUserOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("archive")
            .setDescription("Archive a club")
            .addStringOption((option) =>
              option.setName("name").setDescription("The name of the club").setAutocomplete(true).setRequired(true)
            )
        )
    );
  }

  public async listClubs(interaction: Subcommand.ChatInputCommandInteraction) {
    return await listClubs(interaction, this.container.client);
  }

  public async createClub(interaction: Subcommand.ChatInputCommandInteraction) {
    return await createClub(interaction, this.container.client);
  }

  public async joinClub(interaction: Subcommand.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name", true);
    return interaction.reply({ content: `Joining club ${name}` });
  }

  public async leaveClub(interaction: Subcommand.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name", true);
    return interaction.reply({ content: `Leaving club ${name}` });
  }

  public async clubInfo(interaction: Subcommand.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name", true);
    return interaction.reply({ content: `Getting info about club ${name}` });
  }

  public async inviteToClub(interaction: Subcommand.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name", true);
    const user = interaction.options.getUser("user", true);
    return interaction.reply({ content: `Inviting ${user.username} to club ${name}` });
  }

  public async kickFromClub(interaction: Subcommand.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name", true);
    const user = interaction.options.getUser("user", true);
    return interaction.reply({ content: `Kicking ${user.username} from club ${name}` });
  }

  public async archiveClub(interaction: Subcommand.ChatInputCommandInteraction) {
    const name = interaction.options.getString("name", true);
    return interaction.reply({ content: `Archiving club ${name}` });
  }
}
