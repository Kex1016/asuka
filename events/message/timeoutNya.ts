import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import {
  Events,
  type User,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import AsukaDatabase from "../../database/database";
import AsukaI18n from "../../i18n/i18n";

class TimeoutMockEvent extends AbstractDJSClientSubscriber<Events.MessageCreate> {
  protected readonly event = Events.MessageCreate;

  public async handleEvent(
    meta: EventDispatchMeta,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ) {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    const settings = await AsukaDatabase.getSettings(message.guildId);
    if (!settings) return;
    if (!settings.timeout_nyaboom) return;

    // Check if the message contains a reply to a message or mentions user(s)
    if (message.reference === null && message.mentions.users.size === 0) {
      return;
    }

    // Check who the message is replying to
    let target: User | undefined;
    if (message.reference !== null) {
      if (!message.reference.messageId) return;
      const targetMessage = await message.channel.messages.fetch(
        message.reference.messageId,
      );
      target = targetMessage.author;
    } else {
      target = message.mentions.users.first();
    }

    if (!target) return;
    if (target.bot) return;

    // Get the user as a guild member
    const targetMember = await message.guild.members.fetch(target.id);
    if (!targetMember) return;

    // Check if the target user is timed out
    if (!targetMember.isCommunicationDisabled()) return;

    message.reply(
      AsukaI18n.t("boop.booped", "en-US", {
        user: `${targetMember.displayName}`,
      }),
    );
  }
}

export default TimeoutMockEvent;
