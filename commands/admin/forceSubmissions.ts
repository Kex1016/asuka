import { AbstractStandaloneCommand } from "@nyx-discord/framework";
import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";
import AsukaI18n from "../../i18n/i18n.ts";
import { doGuildSubmissions } from "../../util/doGuildSubmissions.ts";
import { localizeCmd } from "../../util/localize.ts";

class ForceSubmissionsCommand extends AbstractStandaloneCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("forcesubmissions")
      .setDescription("Force check the submissions for the guild.");

    return localizeCmd(builder, "forcesubmissions.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const locale = "en-US";

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

    const client = interaction.client;
    const reply = await interaction.deferReply({ ephemeral: true });
    await doGuildSubmissions(client);
    await reply.edit(AsukaI18n.t("forcesubmissions.response", locale));
  }
}

export default ForceSubmissionsCommand;
