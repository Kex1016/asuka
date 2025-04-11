import { AbstractStandaloneCommand } from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  type TextChannel,
  SlashCommandBuilder,
} from "discord.js";
import AsukaI18n, { type I18nLanguages } from "../../i18n/i18n.ts";
import AsukaEmbeds from "../../util/embeds.ts";
import AsukaDatabase, {
  type PartialSettingsNullable,
  type Submission,
} from "../../database/database.ts";
import { randomID } from "../../util/misc.ts";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord-api-types/v10";
import {
  localizeAttachment,
  localizeCmd,
  localizeString,
} from "../../util/localize.ts";

/**
 * Gets the MIME type of an image from a DataView
 * @param view The DataView to get the MIME type of
 */
function getMime(view: DataView) {
  const type = view.getUint16(0, false);

  switch (type) {
    case 0x8950:
      return "image/png";
    case 0xffd8:
      return "image/jpeg";
    case 0x4749:
      return "image/gif";
    case 0x424d:
      return "image/bmp";
    case 0x4949:
      return "image/tiff";
    case 0x4d4d:
      return "image/tiff";
    case 0x5249:
      return "image/webp";
    default:
      return "";
  }
}

/**
 * Gets the file size of an image from a URL
 * @param url The URL of the image to get the size of
 */
function getImageSize(view: DataView) {
  const mime = getMime(view);

  if (!mime || !mime.startsWith("image/")) {
    throw new Error("Invalid image type");
  }

  // @ts-expect-error ArrayBufferLike is good enough here.
  const blob = new Blob([view.buffer], { type: mime });
  return blob.size;
}

class SubmitCommand extends AbstractStandaloneCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("submit")
      .setDescription("Check Asuka's latency!");

    builder.addAttachmentOption((option) => {
      option
        .setName("image")
        .setDescription("The image to submit")
        .setRequired(true);

      return localizeAttachment(option, "submit.image");
    });
    builder.addStringOption((option) => {
      option
        .setName("caption")
        .setDescription("The server name for the submission")
        .setRequired(true);

      return localizeString(option, "submit.caption");
    });

    return localizeCmd(builder, "submit.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ ephemeral: true });

    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    if (!interaction.guildId || !interaction.guild) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    // Get the server settings
    let settings: PartialSettingsNullable | null;
    try {
      settings = await AsukaDatabase.getSettings(interaction.guildId);
    } catch (_e) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.nothing", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.nothing", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings.voting_enabled) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.disabled", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings.voting_channel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.noChannel", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings.name_template) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.noNameTemplate", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings.max_suggestions) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.voting.noMax", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings.admin_channel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.admin.noChannel", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const weeklySubmissions = await AsukaDatabase.getSubmissionsFromUser(
      interaction.guildId,
      true,
    );
    if (weeklySubmissions.length >= settings.max_suggestions) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.maxSubmissions", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const image = interaction.options.getAttachment("image");
    const caption = interaction.options.getString("caption");

    if (!image) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.noImage", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!caption) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.noText", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const imageRes = await fetch(image.url);
    const imageBuf = await imageRes.arrayBuffer();
    const imageView = new DataView(imageBuf);

    let size: number;
    try {
      size = getImageSize(imageView);
    } catch (_e) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.invalidImage", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (size > 8 * 1024 * 1024) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.imageTooLarge", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    // Create a message in the admin channel
    const adminChannel = interaction.guild.channels.cache.get(
      settings.admin_channel,
    ) as TextChannel;

    if (!adminChannel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.noVotingChannel", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const submissionId = randomID();
    const submissionExtension = getMime(imageView).split("/")[1];
    if (!submissionExtension) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.invalidImage", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    // Save the submission
    const icon_location = Bun.env.ICON_LOCATION;
    if (!icon_location) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.noIconLocation", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    try {
      await Bun.write(
        `${icon_location}/${submissionId}.${submissionExtension}`,
        new Uint8Array(imageBuf),
      );
    } catch (_e) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("submit.error.saveImage", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const submission: Submission = {
      // id: submissionId,
      icon: `https://haiiro.moe/~asuka/icons/${submissionId}.${submissionExtension}`,
      name: caption,
      user: interaction.user.id,
      guild: interaction.guildId,
      accepted: false,
      winner: false,
      message_id: undefined,
      created_at: new Date(),
      archived: false,
    };

    const embed = AsukaEmbeds.submission(submission, settings.name_template);
    const buttonRow = new ActionRowBuilder<ButtonBuilder>();
    const acceptButton = new ButtonBuilder()
      .setCustomId(`sub:accept:${submissionId}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Primary);
    const rejectButton = new ButtonBuilder()
      .setCustomId(`sub:reject:${submissionId}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger);
    buttonRow.addComponents(acceptButton, rejectButton);

    await adminChannel.send({
      embeds: [embed],
      components: [buttonRow],
    });

    // Create the submission
    AsukaDatabase.createSubmission(
      submissionId,
      submission.icon,
      submission.name,
      submission.user,
      submission.guild,
    );

    await reply.edit({
      content: `> ${AsukaI18n.t("submit.response.success", locale, {
        caption: caption,
      })}`,
      embeds: [embed],
    });
  }
}

export default SubmitCommand;
