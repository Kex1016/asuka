import { EmbedBuilder } from "@discordjs/builders";
import type {
  PartialEvent,
  PartialSettings,
  PartialSettingsNullable,
  PartialSubmission,
  PartialSubmissionNullable,
} from "../database/database.ts";
import AsukaSpotify, {
  type SpotifyAlbum,
  type SpotifyArtist,
  type SpotifyPlaylist,
  type SpotifyTrack,
  type SpotifyType,
  type SpotifyUser,
} from "../events/message/spotifyUtil.ts";
import AsukaI18n from "../i18n/i18n.ts";

export class AsukaEmbeds {
  public error(message: string) {
    const embedSettings = {
      color: 0xff0000,
      title: AsukaI18n.t("embed.error.title", "en-US"),
      description: AsukaI18n.t("embed.error.description", "en-US", { message }),
    };

    return new EmbedBuilder()
      .setColor(embedSettings.color)
      .setTitle(embedSettings.title)
      .setDescription(embedSettings.description);
  }

  public success(message: string) {
    const embedSettings = {
      color: 0x5edb81,
      title: AsukaI18n.t("embed.success.title", "en-US"),
      description: AsukaI18n.t("embed.success.description", "en-US", {
        message,
      }),
    };

    return new EmbedBuilder()
      .setColor(embedSettings.color)
      .setTitle(embedSettings.title)
      .setDescription(embedSettings.description);
  }

  public settings(settings: PartialSettings | PartialSettingsNullable) {
    const embedSettings = {
      color: 0x5edb81,
      title: AsukaI18n.t("setup.get.response.title", "en-US"),
      description: AsukaI18n.t("setup.get.response.description", "en-US"),
    };

    const embed = new EmbedBuilder();
    embed.setColor(embedSettings.color);
    embed.setTitle(embedSettings.title);
    embed.setDescription(embedSettings.description);

    if (
      settings.embed_fixer ||
      settings.announce_channel ||
      settings.admin_channel ||
      settings.timeout_nyaboom
    ) {
      embed.addFields({
        name: AsukaI18n.t("setup.get.response.general.title", "en-US"),
        value: AsukaI18n.t("setup.get.response.general.description", "en-US", {
          adminChannel: settings.admin_channel
            ? `<#${settings.admin_channel}>`
            : "`Not set`",
          announceChannel: settings.announce_channel
            ? `<#${settings.announce_channel}>`
            : "`Not set`",
          embedFixer: settings.embed_fixer ? "`Enabled`" : "`Disabled`",
          timeoutNyaboom: settings.timeout_nyaboom ? "`Enabled`" : "`Disabled`",
        }),
      });
    }

    if (
      settings.voting_enabled ||
      settings.voting_channel ||
      settings.max_suggestions ||
      settings.name_template
    ) {
      embed.addFields({
        name: AsukaI18n.t("setup.get.response.voting.title", "en-US"),
        value: AsukaI18n.t("setup.get.response.voting.description", "en-US", {
          votingChannel: settings.voting_channel
            ? `<#${settings.voting_channel}>`
            : "`Not set`",
          votingEnabled: settings.voting_enabled ? "`Enabled`" : "`Disabled`",
          maxSuggestions: settings.max_suggestions
            ? `\`${settings.max_suggestions}\``
            : "`Not set`",
          nameTemplate: settings.name_template
            ? `\`${settings.name_template}\``
            : "`Not set`",
          nameTemplateExample: settings.name_template
            ? settings.name_template.replace("%C%", "`Example`")
            : "`Cannot show example`",
        }),
      });
    }

    if (settings.event_channel) {
      embed.addFields({
        name: AsukaI18n.t("setup.get.response.event.title", "en-US"),
        value: AsukaI18n.t("setup.get.response.event.description", "en-US", {
          eventChannel: settings.event_channel
            ? `<#${settings.event_channel}>`
            : "`Not set`",
        }),
      });
    }

    return embed;
  }

  public submission(
    submission: PartialSubmission | PartialSubmissionNullable,
    nameTemplate: string,
  ) {
    const embedSettings = {
      color: 0x5edb81,
      title: AsukaI18n.t("embed.submission.title", "en-US"),
      description: AsukaI18n.t("embed.submission.description", "en-US", {
        user: `<@${submission.user}>`,
      }),
      thumbnail:
        submission.icon ?? "https://haiiro.moe/~asuka/icons/default.png",
      fields: {
        name: AsukaI18n.t("embed.submission.fields.name", "en-US"),
        value: nameTemplate
          ? nameTemplate.replace("%C%", submission.name ?? "Unknown")
          : (submission.name ?? "Unknown"),
      },
    };

    return new EmbedBuilder()
      .setColor(embedSettings.color)
      .setTitle(embedSettings.title)
      .setDescription(embedSettings.description)
      .setThumbnail(embedSettings.thumbnail)
      .addFields({
        name: embedSettings.fields.name,
        value: embedSettings.fields.value,
      });
  }

  public submissionWinner(
    submission: PartialSubmission | PartialSubmissionNullable,
    votes: number,
    nameTemplate: string,
  ) {
    const embedSettings = {
      color: 0x5edb81,
      title: AsukaI18n.t("embed.submission.weekly.title", "en-US"),
      description: AsukaI18n.t(
        "embed.submission.weekly.descriptionWinner",
        "en-US",
        {
          user: `<@${submission.user}>`,
          votes: votes.toString(),
          name: nameTemplate.replace("%C%", submission.name ?? "Unknown"),
        },
      ),
      thumbnail:
        submission.icon ?? "https://haiiro.moe/~asuka/icons/default.png",
    };

    return new EmbedBuilder()
      .setColor(embedSettings.color)
      .setTitle(embedSettings.title)
      .setDescription(embedSettings.description)
      .setThumbnail(embedSettings.thumbnail);
  }

  public submissionNoWinner() {
    const embedSettings = {
      color: 0xff0000,
      title: AsukaI18n.t("embed.submission.weekly.title", "en-US"),
      description: AsukaI18n.t(
        "embed.submission.weekly.descriptionNoWinner",
        "en-US",
      ),
    };

    return new EmbedBuilder()
      .setColor(embedSettings.color)
      .setTitle(embedSettings.title)
      .setDescription(embedSettings.description);
  }

  public event(event: PartialEvent) {
    const embed = new EmbedBuilder();
    embed.setColor(0x5edb81);
    embed.setTitle(event.name ?? "Unknown");
    embed.setDescription(event.description ?? "No description provided.");

    const discordStartDate = new Date(event.start_date ?? Date.now()).getTime();
    embed.addFields({
      name: "Date",
      value: `<t:${Math.floor(discordStartDate / 1000)}:F>`,
    });

    if (event.end_date) {
      const discordEndDate = new Date(event.end_date).getTime();
      embed.addFields({
        name: "End Date",
        value: `<t:${Math.floor(discordEndDate / 1000)}:F>`,
      });
    }

    if (event.channel) {
      embed.addFields({
        name: "Channel",
        value: `<#${event.channel}>`,
      });
    }

    return embed;
  }

  public async spotify(url: string, type: SpotifyType = "track") {
    const id = AsukaSpotify.spotifyIdFromUrl(url);

    // Trim `` strings' whitespace after the linebreaks
    function trim(str: string) {
      return str.replace(/^\s+/gm, "");
    }

    switch (type) {
      case "track": {
        let track: SpotifyTrack;
        let artist: SpotifyArtist;
        try {
          track = await AsukaSpotify.getSpotifyTrack(id);
          artist = await AsukaSpotify.getSpotifyArtist(track.artists[0].id);
        } catch (error) {
          console.log(`Error fetching track: ${error}`);

          return new EmbedBuilder().setTitle("Spotify Track").setDescription(
            trim(`*Could not fetch track details.*
                [Listen on Spotify](https://open.spotify.com/track/${id})`),
          );
        }
        const embed = new EmbedBuilder();
        embed.setTitle(track.name);
        embed.setThumbnail(track.album.images[0].url);
        embed.setAuthor({
          name: track.artists.map((artist) => artist.name).join(", "),
          url: track.artists[0].external_urls.spotify,
        });
        embed.setDescription(
          trim(`**Album:** [${track.album.name}](${track.album.external_urls.spotify})
          **Release Date:** ${track.album.release_date}
          \n[Listen on Spotify](${track.external_urls.spotify})`),
        );
        embed.setURL(track.external_urls.spotify);
        embed.setColor(0x1db954);
        if (artist.images)
          embed.setAuthor({
            name: track.artists.map((artist) => artist.name).join(", "),
            iconURL: artist.images[0].url,
            url: track.artists[0].external_urls.spotify,
          });
        return embed;
      }
      case "playlist": {
        let playlist: SpotifyPlaylist;
        let user: SpotifyUser;
        try {
          playlist = await AsukaSpotify.getSpotifyPlaylist(id);
          user = await AsukaSpotify.getSpotifyUser(playlist.owner.id);
        } catch (error) {
          return new EmbedBuilder().setTitle("Spotify Playlist").setDescription(
            trim(`*Could not fetch playlist details.*
                [Listen on Spotify](https://open.spotify.com/playlist/${id})`),
          );
        }
        return new EmbedBuilder()
          .setColor(0x1db954)
          .setTitle(playlist.name)
          .setThumbnail(playlist.images[0].url)
          .setAuthor({
            name: playlist.owner.display_name,
            url: playlist.owner.external_urls.spotify,
            iconURL: user.images[0].url || playlist.images[0].url || undefined,
          })
          .setDescription(
            trim(`${playlist.description}
          \n[Listen on Spotify](${playlist.external_urls.spotify})`),
          )
          .setURL(playlist.external_urls.spotify)
          .addFields({
            name: `Tracks (${playlist.tracks.total})`,
            // First 5 tracks and then "... and x more"
            value: playlist.tracks.items
              .slice(0, 5)
              .map(
                (item) =>
                  `[${item.track.name}](${item.track.external_urls.spotify})`,
              )
              .join("\n")
              .concat(
                playlist.tracks.total > 5
                  ? `\n... and ${playlist.tracks.total - 5} more`
                  : "",
              ),
            inline: true,
          });
      }
      case "album": {
        let album: SpotifyAlbum;
        let artist: SpotifyArtist;
        try {
          album = await AsukaSpotify.getSpotifyAlbum(id);
          artist = await AsukaSpotify.getSpotifyArtist(album.artists[0].id);
        } catch (error) {
          return new EmbedBuilder().setTitle("Spotify Album").setDescription(
            trim(`*Could not fetch album details.*
                [Listen on Spotify](https://open.spotify.com/album/${id})`),
          );
        }

        console.log(album);
        console.log(artist);

        return new EmbedBuilder()
          .setColor(0x1db954)
          .setTitle(album.name)
          .setThumbnail(album.images[0].url)
          .setAuthor({
            name: album.artists.map((artist) => artist.name).join(", "),
            url: album.artists[0].external_urls.spotify,
            iconURL: artist.images?.[0]?.url || undefined,
          })
          .setDescription(
            trim(`**Type:** ${album.album_type}
          **Release Date:** ${album.release_date}
          \n[Listen on Spotify](${album.external_urls.spotify})`),
          )
          .setURL(album.external_urls.spotify)
          .addFields({
            name: `Tracks (${album.tracks.total})`,
            value: album.tracks.items
              .slice(0, 5)
              .map((track) => `[${track.name}](${track.external_urls.spotify})`)
              .join("\n")
              .concat(
                album.tracks.total > 5
                  ? `\n... and ${album.tracks.total - 5} more`
                  : "",
              ),
            inline: true,
          });
      }
      case "artist": {
        let artist: SpotifyArtist;
        try {
          artist = await AsukaSpotify.getSpotifyArtist(id);
        } catch (error) {
          return new EmbedBuilder().setTitle("Spotify Artist").setDescription(
            trim(`*Could not fetch artist details.*
                [Listen on Spotify](https://open.spotify.com/artist/${id})`),
          );
        }

        return new EmbedBuilder()
          .setColor(0x1db954)
          .setTitle(artist.name)
          .setThumbnail(artist.images?.[0]?.url || "")
          .setURL(artist.external_urls.spotify)
          .setDescription(
            trim(`**Popularity:** ${artist.popularity}
          **Followers:** ${artist.followers?.total || "Unknown"}
          \n[Listen on Spotify](https://open.spotify.com/artist/${id})`),
          );
      }
      default:
        return new EmbedBuilder()
          .setTitle("Spotify")
          .setDescription(
            `[Listen on Spotify](https://open.spotify.com/${type}/${id})`,
          );
    }
  }
}

export default new AsukaEmbeds();
