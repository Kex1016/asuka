import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import { Events, type Guild } from "discord.js";
import AsukaDatabase from "../../database/database";

class UpdateGuildDatabaseSubscriber extends AbstractDJSClientSubscriber<Events.GuildUpdate> {
  protected readonly event = Events.GuildUpdate;

  public async handleEvent(
    meta: EventDispatchMeta,
    oldGuild: Guild,
    newGuild: Guild,
  ) {
    if (oldGuild.name !== newGuild.name) {
      console.log(
        `Guild name changed from ${oldGuild.name} to ${newGuild.name}`,
      );
      try {
        await AsukaDatabase.updateGuild(newGuild.id, { name: newGuild.name });
      } catch (e) {
        console.error(`Error updating guild name for ${newGuild.name}: ${e}`);
      }
    }

    if (oldGuild.iconURL() !== newGuild.iconURL()) {
      console.log(`Guild icon changed for ${newGuild.name}`);
      try {
        await AsukaDatabase.updateGuild(newGuild.id, {
          icon: newGuild.iconURL() ?? "",
        });
      } catch (e) {
        console.error(`Error updating guild icon for ${newGuild.name}: ${e}`);
      }
    }

    if (oldGuild.ownerId !== newGuild.ownerId) {
      console.log(`Guild owner changed for ${newGuild.name}`);
      try {
        await AsukaDatabase.updateGuild(newGuild.id, {
          owner: newGuild.ownerId,
        });
      } catch (e) {
        console.error(`Error updating guild owner for ${newGuild.name}: ${e}`);
      }
    }

    if (oldGuild.memberCount !== newGuild.memberCount) {
      console.log(`Guild member count changed for ${newGuild.name}`);
      try {
        await AsukaDatabase.updateGuild(newGuild.id, {
          members: newGuild.memberCount,
        });
      } catch (e) {
        console.error(
          `Error updating guild member count for ${newGuild.name}: ${e}`,
        );
      }
    }

    if (oldGuild.channels.cache.size !== newGuild.channels.cache.size) {
      console.log(`Guild channel count changed for ${newGuild.name}`);
      try {
        await AsukaDatabase.updateGuild(newGuild.id, {
          channels: newGuild.channels.cache.size,
        });
      } catch (e) {
        console.error(
          `Error updating guild channel count for ${newGuild.name}: ${e}`,
        );
      }
    }

    if (oldGuild.roles.cache.size !== newGuild.roles.cache.size) {
      console.log(`Guild role count changed for ${newGuild.name}`);
      try {
        await AsukaDatabase.updateGuild(newGuild.id, {
          roles: newGuild.roles.cache.size,
        });
      } catch (e) {
        console.error(
          `Error updating guild role count for ${newGuild.name}: ${e}`,
        );
      }
    }
  }
}

export default UpdateGuildDatabaseSubscriber;
