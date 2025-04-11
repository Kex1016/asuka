import {
  AbstractParentCommand,
  AbstractSubCommand,
} from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  PermissionsBitField,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import AsukaDatabase from "../../database/database.ts";
import AsukaEmbeds from "../../util/embeds.ts";
import AsukaI18n, { type I18nLanguages } from "../../i18n/i18n.ts";
import {
  localizeBoolean,
  localizeChannel,
  localizeCmd,
  localizeNumber,
  localizeString,
  localizeSubCmd,
} from "../../util/localize.ts";

export class SetupParentCommand extends AbstractParentCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Set up the bot.");
    return localizeCmd(builder, "setup.description");
  }
}

export class SetupGetSettings extends AbstractSubCommand {
  protected createData() {
    const builder = new SlashCommandSubcommandBuilder()
      .setName("get")
      .setDescription("Get the current settings.");
    return localizeSubCmd(builder, "setup.get.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ ephemeral: true });

    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    if (!interaction.guildId) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const settings = await AsukaDatabase.getSettings(interaction.guildId);
    if (!settings) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noSettings", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const embed = AsukaEmbeds.settings(settings);
    await reply.edit({ embeds: [embed] });
  }
}

export class SetupGeneralSettings extends AbstractSubCommand {
  protected createData() {
    const builder = new SlashCommandSubcommandBuilder()
      .setName("general")
      .setDescription("Set up general settings.");

    builder.addChannelOption((option) =>
      localizeChannel(
        option
          .setName("admin_channel")
          .setDescription("The channel to send bot messages.")
          .setRequired(false),
        "setup.general.adminChannel",
      ),
    );

    builder.addChannelOption((option) =>
      localizeChannel(
        option
          .setName("announce_channel")
          .setDescription("The channel to send announcement messages.")
          .setRequired(false),
        "setup.general.accounceChannel",
      ),
    );

    builder.addBooleanOption((option) =>
      localizeBoolean(
        option
          .setName("embed_fixer")
          .setDescription("Enable the embed fixer.")
          .setRequired(false),
        "setup.general.embedFixer",
      ),
    );

    builder.addBooleanOption((option) =>
      localizeBoolean(
        option
          .setName("timeout_nyaboom")
          .setDescription("Enable mocking timed out people.")
          .setRequired(false),
        "setup.general.timeoutNyaboom",
      ),
    );

    return localizeSubCmd(builder, "setup.general.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ ephemeral: true });

    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    if (!interaction.guildId) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!interaction.member) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const member = interaction.member as GuildMember;
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noPermissions", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const adminChannel = interaction.options.getChannel("admin_channel");
    const announceChannel = interaction.options.getChannel("announce_channel");
    const embedFixer = interaction.options.getBoolean("embed_fixer");
    const timeoutNyaboom = interaction.options.getBoolean("timeout_nyaboom");

    if (adminChannel) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        admin_channel: adminChannel.id,
      });
    }

    if (announceChannel) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        announce_channel: announceChannel.id,
      });
    }

    if (embedFixer !== null) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        embed_fixer: embedFixer,
      });
    }

    if (timeoutNyaboom !== null) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        timeout_nyaboom: timeoutNyaboom,
      });
    }

    const embed = AsukaEmbeds.success(
      AsukaI18n.t("generic.success.settingsUpdated", locale),
    );
    await reply.edit({ embeds: [embed] });
  }
}

export class SetupVotingSettings extends AbstractSubCommand {
  protected createData() {
    const builder = new SlashCommandSubcommandBuilder()
      .setName("voting")
      .setDescription("Set up voting settings.");

    builder.addBooleanOption((option) =>
      localizeBoolean(
        option
          .setName("voting_enabled")
          .setDescription("Whether voting is enabled.")
          .setRequired(false),
        "setup.voting.votingEnabled",
      ),
    );

    builder.addChannelOption((option) =>
      localizeChannel(
        option
          .setName("voting_channel")
          .setDescription("The channel to send voting messages.")
          .setRequired(false),
        "setup.voting.votingChannel",
      ),
    );

    builder.addNumberOption((option) =>
      localizeNumber(
        option
          .setName("max_suggestions")
          .setDescription("The maximum number of suggestions per week.")
          .setRequired(false),
        "setup.voting.maxSuggestions",
      ),
    );

    builder.addStringOption((option) =>
      localizeString(
        option
          .setName("name_template")
          .setDescription(
            'The template for the server name, where %C% is the submitted name. E.g.: "%C% Club"',
          )
          .setRequired(false),
        "setup.voting.nameTemplate",
      ),
    );

    return localizeSubCmd(builder, "setup.voting.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ ephemeral: true });

    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    if (!interaction.guildId) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!interaction.member) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const member = interaction.member as GuildMember;
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noPermissions", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const votingEnabled = interaction.options.getBoolean("voting_enabled");
    const votingChannel = interaction.options.getChannel("voting_channel");
    const maxSuggestions = interaction.options.getNumber("max_suggestions");
    const nameTemplate = interaction.options.getString("name_template");

    if (votingEnabled !== null) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        voting_enabled: votingEnabled,
      });
    }

    if (votingChannel) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        voting_channel: votingChannel.id,
      });
    }

    if (maxSuggestions) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        max_suggestions: maxSuggestions,
      });
    }

    if (nameTemplate) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        name_template: nameTemplate,
      });
    }

    const embed = AsukaEmbeds.success(
      AsukaI18n.t("generic.success.settingsUpdated", locale),
    );
    await reply.edit({ embeds: [embed] });
  }
}

export class SetupEventSettings extends AbstractSubCommand {
  protected createData() {
    const builder = new SlashCommandSubcommandBuilder()
      .setName("event")
      .setDescription("Set up event settings.");

    builder.addChannelOption((option) =>
      localizeChannel(
        option
          .setName("event_channel")
          .setDescription("The channel to send events.")
          .setRequired(false),
        "setup.event.eventChannel",
      ),
    );

    return localizeSubCmd(builder, "setup.event.description");
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const reply = await interaction.deferReply({ ephemeral: true });

    const locale =
      (interaction.guild?.preferredLocale.toString() as I18nLanguages) ??
      "en-US";

    if (!interaction.guildId) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    if (!interaction.member) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noGuild", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const member = interaction.member as GuildMember;
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      const embed = AsukaEmbeds.error(
        AsukaI18n.t("generic.error.noPermissions", locale),
      );
      await reply.edit({ embeds: [embed] });
      return;
    }

    const eventChannel = interaction.options.getChannel("event_channel");

    if (eventChannel) {
      AsukaDatabase.updateSettings(interaction.guildId, {
        event_channel: eventChannel.id,
      });
    }

    const embed = AsukaEmbeds.success(
      AsukaI18n.t("generic.success.settingsUpdated", locale),
    );
    await reply.edit({ embeds: [embed] });
  }
}
