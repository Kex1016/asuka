import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import { type Client, Events } from "discord.js";
import AsukaDatabase, {
  type PartialSettingsNullable,
} from "../../database/database.ts";

class MakeServerSettingsSubscriber extends AbstractDJSClientSubscriber<Events.ClientReady> {
  protected readonly event = Events.ClientReady;

  public async handleEvent(meta: EventDispatchMeta, client: Client<true>) {
    console.log("Creating default server settings...");

    const guilds = client.guilds.cache;
    for (const guild of guilds) {
      const [id, _] = guild;
      console.log(`Checking guild ${id}`);

      let dbGuild;
      try {
        dbGuild = await AsukaDatabase.getGuild(id);
      } catch (e) {
        console.error(`Error getting guild ${id}: ${e}`);
      }

      if (!dbGuild) {
        console.log(`Creating guild entry ${id}`);

        const _g = guild[1];
        AsukaDatabase.createGuild(
          id,
          _g.name,
          _g.iconURL() ?? "",
          _g.ownerId,
          _g.memberCount,
          _g.channels.cache.size,
          _g.roles.cache.size,
          new Date(_g.createdTimestamp),
        );
      }

      let settings: PartialSettingsNullable | null;
      try {
        settings = await AsukaDatabase.getSettings(id);
      } catch (e) {
        console.error(`Error getting settings for ${id}: ${e}`);
      }

      let submissions;
      try {
        submissions = await AsukaDatabase.getSubmissions(id);
      } catch (e) {
        console.error(`Error getting submissions for ${id}: ${e}`);
      }

      if (!settings) {
        console.log(`Creating settings for ${id}`);

        AsukaDatabase.createSettings(id);
      }

      // Correct database changes
      console.log("Correcting database changes for guild", id);

      if (submissions) {
        for (const submission of submissions) {
          // 1) Added submission.archived (2024-12-04)
          if (submission.archived === undefined) {
            console.log(
              `Submission ${submission.id} for ${id} is missing archived field.`,
            );

            try {
              const today = new Date();
              const weekStart = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() - today.getDay(),
              );
              if (submission.created_at) {
                await AsukaDatabase.updateSubmission(submission.id, {
                  archived: submission.created_at < weekStart,
                });
              }
            } catch (e) {
              console.error(
                `Error updating submission ${submission.id} for ${id}: ${e}`,
              );
            }
          }
        }
      }
    }

    console.log("Default server settings created.");
  }
}

export default MakeServerSettingsSubscriber;
