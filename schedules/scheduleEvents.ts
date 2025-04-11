import type { ScheduleTickMeta } from "@nyx-discord/core";
import { AbstractSchedule } from "@nyx-discord/framework";
import AsukaDatabase, { type Event } from "../database/database";
import EventSchedule from "./eventSchedule";

class ScheduleEventsSchedule extends AbstractSchedule {
  protected readonly interval = "* * * * *";

  private scheduledEvents = new Map<string, Event>();

  public async tick(meta: ScheduleTickMeta) {
    const bot = meta.getBot();
    if (!bot) {
      console.error("Bot is not available");
      return;
    }

    console.log("Scheduling events...");

    const guilds = meta.getBot().getClient().guilds.cache;

    for (const [, guild] of guilds) {
      const settings = await AsukaDatabase.getSettings(guild.id);
      if (!settings) {
        console.log(`No settings found for guild ${guild.id}`);
        continue;
      }
      if (!settings.event_channel) {
        console.log(`No event channel found for guild ${guild.id}`);
        continue;
      }

      const events = await AsukaDatabase.getEvents(guild.id);
      if (!events) {
        console.log("No events found");
        continue;
      }

      for (const event of events) {
        if (this.scheduledEvents.has(event.id)) {
          // TODO: update event if necessary
          console.log(`Event ${event.name} is already scheduled`);
          continue;
        }

        if (
          !event.guild ||
          !event.name ||
          !event.description ||
          !event.start_date ||
          !event.end_date ||
          !event.message_id
        ) {
          console.log("Event is missing required fields");
          continue;
        }

        const eventObject: Event = {
          guild: event.guild,
          name: event.name,
          description: event.description,
          start_date: event.start_date,
          channel: event.channel ?? settings.event_channel,
          end_date: event.end_date,
          message_id: event.message_id,
          participants: event.participants,
        };

        console.log(`Event ${event.name} is ready to be scheduled`);
        const bot = meta.getBot();
        if (!bot) {
          console.error("Bot is not available");
          continue;
        }

        const scheduler = bot.getScheduleManager();
        if (!scheduler) {
          console.error("Scheduler is not available");
          continue;
        }

        await scheduler.addSchedule(
          new EventSchedule(eventObject.start_date, eventObject, event.id),
        );
        console.log(`Event ${event.name} has been scheduled`);
        this.scheduledEvents.set(event.id, eventObject);
      }
    }
  }
}

export default ScheduleEventsSchedule;
