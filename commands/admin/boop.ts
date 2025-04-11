import { AbstractStandaloneCommand } from "@nyx-discord/framework";
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import {
  localizeCmd,
  localizeInteger,
  localizeUser,
} from "../../util/localize.ts";
import AsukaDatabase from "../../database/database.ts";
import AsukaI18n from "../../i18n/i18n.ts";

class BoopCommand extends AbstractStandaloneCommand {
  protected createData() {
    const builder = new SlashCommandBuilder()
      .setName("boop")
      .setDescription("Get booped, idiot.");

    builder.addUserOption((option) => {
      option
        .setName("user")
        .setDescription("The user to boop.")
        .setRequired(true);

      return localizeUser(option, "boop.user.name");
    });

    builder.addIntegerOption((option) => {
      option
        .setName("time")
        .setDescription("The user to boop.")
        .setRequired(true);

      option.addChoices([
        { name: "1 second", value: 1000 },
        { name: "1 minute", value: 60000 },
        { name: "5 minutes", value: 300000 },
        { name: "30 minutes", value: 1800000 },
        { name: "1 hour", value: 3600000 },
        { name: "1 day", value: 86400000 },
        { name: "3 days", value: 259200000 },
        { name: "Random", value: 69 },
      ]);

      return localizeInteger(option, "boop.time.name");
    });

    return localizeCmd(builder, "boop.description");
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

    // Check for admin permissions
    if (!user.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply(
        "You do not have permission to run this command.",
      );
      return;
    }

    const reply = await interaction.deferReply();
    const target = interaction.options.getUser("user");
    let time = interaction.options.getInteger("time");

    if (!target || !time) {
      await reply.edit("Invalid user or time.");
      return;
    }

    const targetMember = interaction.guild?.members.cache.get(
      target.id,
    ) as GuildMember;

    if (time === 69) {
      time = Math.floor(Math.random() * 259200000) + 1;
    }

    try {
      await targetMember.timeout(time);
    } catch (e) {
      console.log(
        `Failed to time out user ${target.id} in guild ${interaction.guildId}`,
      );
      await reply.edit(
        AsukaI18n.t("boop.error", "en-US", {
          user: `<@${target.id}>`,
        }),
      );
      return;
    }

    function formatTime(ms: number) {
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      const daysms = ms % (24 * 60 * 60 * 1000);
      const hours = Math.floor(daysms / (60 * 60 * 1000));
      const hoursms = ms % (60 * 60 * 1000);
      const minutes = Math.floor(hoursms / (60 * 1000));
      const minutesms = ms % (60 * 1000);
      const seconds = Math.floor(minutesms / 1000);

      const strings = [];
      if (days) strings.push(`${days} days`);
      if (hours) strings.push(`${hours} hours`);
      if (minutes) strings.push(`${minutes} minutes`);
      if (seconds) strings.push(`${seconds} seconds`);

      // If more than one, remove the last one and add an "and"
      if (strings.length > 1) {
        const last = strings.pop();
        strings.push(`and ${last}`);
      }

      return strings.join(", ");
    }

    // Add negative (time / 1000) credits to the user
    const credits = Math.floor(time / 10000);
    await AsukaDatabase.addUserCredits(target.id, credits * -1);

    await reply.edit(
      `> ${AsukaI18n.t("boop.response", "en-US", {
        user: `<@${target.id}>`,
      })}\n-# <:reply:1303321572592844813> Timed out for ${formatTime(time)}. -${credits} social credit.`,
    );
  }
}

export default BoopCommand;
