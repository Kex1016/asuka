import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import {
  Events,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";

class ScheduleEventsOnMessageSubscriber extends AbstractDJSClientSubscriber<Events.MessageCreate> {
  protected readonly event = Events.MessageCreate;

  public async handleEvent(
    meta: EventDispatchMeta,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ) {
    if (message.author.bot && message.author.id !== message.client.user.id) {
      console.log("Message is from a bot");
      return;
    }
    if (!message.inGuild()) {
      console.log("Message is not in a guild");
      return;
    }
  }
}

export default ScheduleEventsOnMessageSubscriber;
