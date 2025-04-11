import type { ScheduleTickMeta } from "@nyx-discord/core";
import { AbstractSchedule } from "@nyx-discord/framework";
import { doGuildSubmissions } from "../util/doGuildSubmissions";

class WeeklySubmissionSchedule extends AbstractSchedule {
  // Cron every Sunday at 11:00 AM
  protected readonly interval = "0 11 * * 7";
  // Cron every 5 minutes for testing
  // protected readonly interval = "*/5 * * * *";

  public async tick(meta: ScheduleTickMeta) {
    const bot = meta.getBot();
    const client = bot.getClient();
    await doGuildSubmissions(client);
  }
}

export default WeeklySubmissionSchedule;
