import type { EventDispatchMeta } from "@nyx-discord/core";
import { AbstractDJSClientSubscriber } from "@nyx-discord/framework";
import {
  Events,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import AsukaDatabase from "../../database/database";
import AsukaEmbeds from "../../util/embeds";
import type { SpotifyType } from "./spotifyUtil";

class EmbedFixer extends AbstractDJSClientSubscriber<Events.MessageCreate> {
  protected readonly event = Events.MessageCreate;

  public async handleEvent(
    meta: EventDispatchMeta,
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ) {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    const settings = await AsukaDatabase.getSettings(message.guildId);
    if (!settings) return;
    if (!settings.embed_fixer) return;

    // A regex that captures any URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const urls = message.content.match(urlRegex);
    if (!urls) return;

    const validUrls = [
      "twitter.com",
      "instagram.com",
      "x.com",
      "reddit.com",
      "spotify.com",
      "open.spotify.com",
    ];

    const replacements = new Map<string, string>([
      ["twitter.com", "girlcockx.com"],
      ["instagram.com", "ddinstagram.com"],
      ["x.com", "girlcockx.com"],
      ["reddit.com", "rxddit.com"],
    ]);

    // Check if the URLs are valid
    const valid = urls.some((url) =>
      validUrls.some((validUrl) => {
        const uri = new URL(url);
        const newHost = uri.hostname
          .replace(/^www\./gi, "")
          .replace(/^m\./gi, "")
          .replace(/^mobile\./gi, "")
          .replace(/^d\./gi, "")
          .replace(/^t\./gi, "")
          .replace(/^g\./gi, "");
        console.log(newHost);
        console.log(validUrl);

        return newHost === validUrl;
      }),
    );
    console.log(valid);

    if (!valid) return;

    await message.suppressEmbeds(true);

    let response = "";
    const embeds = [];
    for (const url of urls) {
      const uri = new URL(url);

      if (uri.hostname === "open.spotify.com") {
        const type = uri.pathname.match(/\/(track|playlist|album|artist)\//);
        if (!type) continue;
        let embed;
        try {
          embed = await AsukaEmbeds.spotify(uri.href, type[1] as SpotifyType);
        } catch (e) {
          continue;
        }

        embeds.push(embed);
        continue;
      }

      // Get rid of popular tracking parameters
      // ex: https://x.com/forestwithout/status/1863631455282196489?t=hOBB6ePDzTWsgaEX8zUNnw&s=19
      uri.searchParams.delete("utm_source");
      uri.searchParams.delete("utm_medium");
      uri.searchParams.delete("utm_campaign");
      uri.searchParams.delete("utm_term");
      uri.searchParams.delete("t");
      uri.searchParams.delete("s");
      uri.searchParams.delete("ref");
      uri.searchParams.delete("si");

      // Replace
      for (const [key, value] of replacements) {
        if (url.includes(key)) {
          uri.hostname = uri.hostname.replace(key, value);
        }
      }

      response += `-# ${uri.href}\n`;
    }

    await message.suppressEmbeds(true);

    try {
      await message.reply({
        content: response,
        embeds,
        allowedMentions: { repliedUser: false },
      });
    } catch (e) {
      await message.reply({
        content:
          "There were embeds to fix, but something went seriously wrong.",
        allowedMentions: { repliedUser: false },
      });
    }
  }
}

export default EmbedFixer;
