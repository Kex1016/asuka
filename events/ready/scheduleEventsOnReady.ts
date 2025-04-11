import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import { type Client, Events } from "discord.js";

class ScheduleEventsOnReadySubscriber extends AbstractDJSClientSubscriber<Events.ClientReady> {
  protected readonly event = Events.ClientReady;

  public handleEvent(meta: EventDispatchMeta, client: Client<true>) {
    console.log("Scheduling events...");
    console.log("TODO: Implement scheduling events");
  }
}

export default ScheduleEventsOnReadySubscriber;
