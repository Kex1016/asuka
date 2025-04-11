import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import {
  Events,
  PermissionFlagsBits,
  type GuildMember,
  type Interaction,
  type TextChannel,
} from "discord.js";
import AsukaDatabase, {
  type PartialSubmissionNullable,
} from "../../../database/database";
import AsukaI18n from "../../../i18n/i18n";
import AsukaEmbeds from "../../../util/embeds";

class SubmissionAcceptSubscriber extends AbstractDJSClientSubscriber<Events.InteractionCreate> {
  protected readonly event = Events.InteractionCreate;

  public async handleEvent(meta: EventDispatchMeta, interaction: Interaction) {
    const locale = "en-US";

    if (!interaction.member || !interaction.guild || !interaction.guildId)
      return;
    const member = interaction.member as GuildMember;

    if (!interaction.isButton()) return;
    const button = interaction.customId;
    if (!button.startsWith("sub:accept")) return;

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

    if (!settings.voting_channel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.noChannel", locale),
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

    const channel = interaction.guild.channels.cache.get(
      settings.voting_channel,
    ) as TextChannel;
    if (!channel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.noChannel", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Create message in voting channel
    const _s: PartialSubmissionNullable = {
      accepted: true,
      created_at: submission.created_at,
      guild: submission.guild,
      icon: submission.icon,
      name: submission.name,
      user: submission.user,
      message_id: submission.message_id,
    };
    const embed = AsukaEmbeds.submission(_s, settings.name_template);
    const message = await channel.send({ embeds: [embed] });
    await message.react("👍");
    await message.react("👎");

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
        content: AsukaI18n.t("submit.user.accepted", locale, {
          submission: settings.name_template.replace(
            "%C%",
            submission.name ?? "Unknown",
          ),
          image:
            submission.icon || "https://haiiro.moe/~asuka/icons/default.png",
          channel: message.url,
        }),
      });
    } catch (e) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noDMChannel", locale),
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Update submission
    await AsukaDatabase.updateSubmission(submissionId, {
      accepted: true,
      message_id: message.id,
    });

    // Update original message and reply
    await interaction.message.edit({
      components: [],
      content: AsukaI18n.t("submit.admin.accepted", locale, {
        user: `<@${interaction.user.id}>`,
      }),
    });

    await interaction.reply({
      content: AsukaI18n.t("submit.admin.accepted", locale, {
        user: `<@${interaction.user.id}>`,
      }),
      ephemeral: true,
    });
  }
}

export default SubmissionAcceptSubscriber;
