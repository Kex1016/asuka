import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import { ActivityType } from "discord-api-types/v10";
import { type Client, Events } from "discord.js";

class ReadyEventSubscriber extends AbstractDJSClientSubscriber<Events.ClientReady> {
  protected readonly event = Events.ClientReady;

  public handleEvent(meta: EventDispatchMeta, client: Client<true>) {
    console.log(`Logged in as ${client.user?.tag}`);

    if (client.user) {
      client.user.setPresence({
        activities: [
          {
            type: ActivityType.Watching,
            name: "you in the corner",
          },
        ],
      });
    }
  }
}

export default ReadyEventSubscriber;
