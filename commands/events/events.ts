import {
  AbstractParentCommand,
  AbstractSubCommand,
} from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  type TextChannel,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import AsukaDatabase from "../../database/database.ts";
import AsukaI18n from "../../i18n/i18n.ts";
import AsukaEmbeds from "../../util/embeds.ts";
import {
  localizeChannel,
  localizeCmd,
  localizeString,
  localizeSubCmd,
} from "../../util/localize.ts";

export class EventsParentCommand extends AbstractParentCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("events")
      .setDescription("Manage events.");

    return localizeCmd(builder, "events.description");
  }
}

export class EventsCreateSubCommand extends AbstractSubCommand {
  protected createData() {
    const builder = new SlashCommandSubcommandBuilder()
      .setName("add")
      .setDescription("Create a new event.");

    builder.addStringOption((option) => {
      option
        .setName("name")
        .setDescription("The name of the event.")
        .setRequired(true);

      return localizeString(option, "events.create.name");
    });

    builder.addStringOption((option) => {
      option
        .setName("description")
        .setDescription("The description of the event.")
        .setRequired(true);

      return localizeString(option, "events.create.description");
    });

    builder.addStringOption((option) => {
      option
        .setName("date")
        .setDescription("The start date of the event.")
        .setRequired(true);

      return localizeString(option, "events.create.date");
    });

    builder.addStringOption((option) => {
      option
        .setName("duration")
        .setDescription("The duration of the event. (in minutes)")
        .setRequired(false);

      return localizeString(option, "events.create.duration");
    });

    builder.addChannelOption((option) => {
      option
        .setName("channel")
        .setDescription("The channel used for the event.")
        .setRequired(false);

      return localizeChannel(option, "events.create.channel");
    });

    return localizeSubCmd(builder, "events.create.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const locale = "en-US";
    const reply = await interaction.deferReply({ ephemeral: true });

    if (!interaction.inGuild() || !interaction.guild) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const settings = await AsukaDatabase.getSettings(interaction.guildId);
    if (!settings) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.nothing", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!settings.event_channel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings.event.noChannel", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const name = interaction.options.getString("name");
    const description = interaction.options.getString("description");
    const start_date = interaction.options.getString("date");
    const duration = interaction.options.getString("duration");
    const channel = interaction.options.getChannel("channel");

    if (!name || !description || !start_date) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("events.error.invalid", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    try {
      // Test if the date is valid
      new Date(start_date);
    } catch (_e) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("events.error.invalidDate", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (duration && Number.isNaN(Number(duration))) {
      try {
        // Test if the duration is a valid date
        new Date(duration);
      } catch (_e) {
        const embed = AsukaEmbeds.error(
          AsukaI18n.t("events.error.invalidDuration", locale),
        );
        await reply.edit({ embeds: [embed] });
        return;
      }
    }

    // Create a message in the event channel
    const eventChannel = interaction.guild.channels.cache.get(
      settings.event_channel,
    ) as TextChannel;

    if (!eventChannel) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("events.error.noEventChannel", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const eventObject = {
      name,
      description,
      start_date: new Date(start_date),
      end_date:
        duration && Number.isNaN(Number(duration))
          ? new Date(duration)
          : new Date(new Date(start_date).getTime() + 60 * 60 * 1000),
      channel: channel ? channel.id : undefined,
    };

    const embed = AsukaEmbeds.event(eventObject);
    const message = await eventChannel.send({ embeds: [embed] });
    message.react("🔔");

    await AsukaDatabase.createEvent(
      interaction.guildId,
      eventObject.name,
      eventObject.description,
      eventObject.start_date,
      eventObject.end_date,
      eventObject.channel,
      message.id,
    );

    await reply.edit(AsukaI18n.t("events.create.response", locale));
  }
}
