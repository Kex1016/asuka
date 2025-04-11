import { AbstractStandaloneCommand } from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import AsukaI18n, { type I18nLanguages } from "../i18n/i18n.ts";
import { localizeCmd } from "../util/localize.ts";

class PingCommand extends AbstractStandaloneCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Check Asuka's latency!");

    return localizeCmd(builder, "ping.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    const now = Date.now();
    const sent = await interaction.deferReply({ ephemeral: true });
    const ping = Date.now() - now;

    await sent.edit(
      AsukaI18n.t("ping.response", locale, { ping: ping.toString() }),
    );
  }
}

export default PingCommand;
