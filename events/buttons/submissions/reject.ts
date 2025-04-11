import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import {
  Events,
  PermissionFlagsBits,
  type GuildMember,
  type Interaction,
} from "discord.js";
import AsukaDatabase from "../../../database/database";
import AsukaI18n from "../../../i18n/i18n";
import AsukaEmbeds from "../../../util/embeds";

class SubmissionRejectSubscriber extends AbstractDJSClientSubscriber<Events.InteractionCreate> {
  protected readonly event = Events.InteractionCreate;

  public async handleEvent(meta: EventDispatchMeta, interaction: Interaction) {
    const locale = "en-US"; // TODO: user's locale

    if (!interaction.member || !interaction.guild || !interaction.guildId)
      return;
    const member = interaction.member as GuildMember;

    if (!interaction.isButton()) return;
    const button = interaction.customId;
    if (!button.startsWith("sub:reject")) return;

    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noPermission", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const submissionId = button.split(":")[2];
    const submission = await AsukaDatabase.getSubmissionFromId(submissionId);

    if (!submission) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSubmission", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (!submission.user) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.noUser", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const settings = await AsukaDatabase.getSettings(interaction.guildId);
    if (!settings) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.nothing", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (!settings.name_template) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.noNameTemplate", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Notify user
    const user = (await interaction.guild.members.fetch(
      submission.user,
    )) as GuildMember;
    if (!user) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.noUser", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const dmChannel = await user.createDM();
    if (!dmChannel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noDMChannel", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      await dmChannel.send({
        content: AsukaI18n.t("submit.user.rejected", locale, {
          submission: settings.name_template.replace(
            "%C%",
            submission.name ?? "Unknown",
          ),
          image: submission.icon ?? "default.png",
        }),
      });
    } catch (e) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noDMChannel", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Delete submission
    await AsukaDatabase.deleteSubmission(submissionId);

    // Update original message and reply
    await interaction.message.edit({
      components: [],
      content: AsukaI18n.t("submit.admin.rejected", locale, {
        user: `<@${interaction.user.id}>`,
      }),
    });

    await interaction.reply({
      content: AsukaI18n.t("submit.admin.rejected", locale, {
        user: `<@${interaction.user.id}>`,
      }),
      ephemeral: true,
    });
  }
}

export default SubmissionRejectSubscriber;
