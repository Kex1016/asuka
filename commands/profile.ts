import { AbstractStandaloneCommand } from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import AsukaI18n, { type I18nLanguages } from "../i18n/i18n.ts";
import { localizeCmd, localizeUser } from "../util/localize.ts";
import AsukaDatabase from "../database/database.ts";

class ProfileCommand extends AbstractStandaloneCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("profile")
      .setDescription("Check a user's profile.");

    builder.addUserOption((option) => {
      option
        .setName("user")
        .setDescription("The user to check.")
        .setRequired(false);

      return localizeUser(option, "profile.user.name");
    });

    return localizeCmd(builder, "profile.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    const reply = await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser("user") ?? interaction.user;
    const member = await interaction.guild?.members.fetch(user.id);

    if (!member) {
      await reply.edit(
        AsukaI18n.t("profile.error.noProfile", locale, {
          user: `<@${user.id}>`,
        }),
      );
      return;
    }

    const userEntry = await AsukaDatabase.getUser(member.id);
    if (!userEntry) {
      await reply.edit(
        AsukaI18n.t("profile.error.noProfile", locale, {
          user: member.displayName,
        }),
      );
      return;
    }

    const embed = new EmbedBuilder();

    embed.setAuthor({
      name: `${member.displayName}'s Profile`,
    });

    if (member.isCommunicationDisabled()) {
      const timestamp = member.communicationDisabledUntilTimestamp;
      const date = new Date(timestamp);
      embed.setDescription(
        `This user is currently timed out. It runs out <t:${Math.floor(date.getTime() / 1000)}:R>.`,
      );
    }

    embed.setThumbnail(member.user.displayAvatarURL());

    const birthday = (userEntry.settings?.birthday || new Date(0)).getTime();
    console.log(birthday);
    if (birthday > 1) {
      embed.addFields([
        {
          name: "Birthday",
          value: `${
            userEntry.settings?.birthday?.toLocaleDateString() ?? "Unknown"
          }`,
        },
      ]);
    }

    embed.addFields([
      {
        name: "Social Credit",
        value: `${userEntry.credits} points`,
      },
    ]);

    await reply.edit({ embeds: [embed] });
  }
}

export default ProfileCommand;
