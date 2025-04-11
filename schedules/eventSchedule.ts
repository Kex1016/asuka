import type { ScheduleTickMeta } from "@nyx-discord/core";
import { AbstractSchedule } from "@nyx-discord/framework";
import type { Event } from "../database/database";

class EventSchedule extends AbstractSchedule {
  protected readonly interval: Date;
  private readonly event: Event;
  private readonly eventId: string;

  constructor(timeAt: Date, event: Event, eventId: string) {
    super();
    this.interval = timeAt;
    this.event = event;
    this.eventId = eventId;
  }

  public async tick(meta: ScheduleTickMeta) {
    const now = new Date();
    console.log(
      `EventSchedule: ${this.event.name} ticked at ${now.toISOString()}`
    );
  }
}

export default EventSchedule;
