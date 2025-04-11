import { AbstractStandaloneCommand } from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import AsukaDatabase from "../../database/database.ts";

class GetSubmissionsCommand extends AbstractStandaloneCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("getsubmissions")
      .setDescription("Get this week's submissions. (Admin only)");

    return builder;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()) {
      await interaction.reply("This command can only be run in a server.");
      return;
    }

    const user = interaction.member as GuildMember;
    if (!user) {
      await interaction.reply("No user found.");
      return;
    }

    if (!user.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply(
        "You do not have permission to run this command.",
      );
      return;
    }

    const reply = await interaction.deferReply({ ephemeral: true });

    const weeklySubmissions = await AsukaDatabase.getThisWeeksSubmissions(
      interaction.guildId,
    );

    if (!weeklySubmissions) {
      await reply.edit("No submissions found.");
      return;
    }

    await reply.edit(
      `There are ${weeklySubmissions.length} submissions this week:\n` +
        weeklySubmissions
          .map(
            (s) =>
              `- ${s.name} [\`image\`](<${s.icon}>) by <@${s.user}>\n  - ${
                s.accepted ? "Accepted" : "Not accepted"
              }\n  - ${s.created_at?.toISOString()}`,
          )
          .join("\n"),
    );
  }
}

export default GetSubmissionsCommand;
