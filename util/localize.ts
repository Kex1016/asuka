import type {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandNumberOption,
  SlashCommandAttachmentOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandRoleOption,
  SlashCommandUserOption,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandMentionableOption,
} from "discord.js";
import AsukaI18n, { type I18nLanguages } from "../i18n/i18n";

type AcceptedOptions =
  | SlashCommandBuilder
  | SlashCommandSubcommandBuilder
  | SlashCommandNumberOption
  | SlashCommandAttachmentOption
  | SlashCommandChannelOption
  | SlashCommandIntegerOption
  | SlashCommandRoleOption
  | SlashCommandUserOption
  | SlashCommandStringOption
  | SlashCommandBooleanOption
  | SlashCommandMentionableOption;

const exampleLocale = {
  "en-US": {
    generic: {
      success: {
        settingsUpdated: "Settings updated successfully.",
      },
      error: {
        unknown: "An unknown error occurred.",
        noIconLocation: "No icon location provided.",
        invalidIconLocation: "Invalid icon location provided.",
        noGuild: "You need to be in a server to use this command.",
        noPermission: "You don't have permission to use this command.",
        noSubmission: "No submission found.",
        noDMChannel: "Could not create a DM channel.",
        noSettings: {
          nothing: "This server doesn't have Asuka set up yet!",
          events: "This server doesn't have events set up yet!",
          roles: "This server doesn't have roles set up yet!",
          voting: {
            disabled: "Voting is disabled or not set up yet in this server.",
            noChannel:
              "Voting is enabled, but no voting channel is set up yet in this server.",
            noMax:
              "Voting is enabled, but the maximum number of suggestions hasn't been set up yet in this server.",
            noNameTemplate:
              "Voting is enabled, but the name template hasn't been set up yet in this server.",
          },
          admin: {
            noChannel: "This server doesn't have an admin channel set up yet!",
            noRole: "This server doesn't have an admin role set up yet!",
          },
        },
      },
    },
    embed: {
      submission: {
        title: "New submission!",
        description: "A new submission has been made by {user}.",
        fields: {
          name: "Server name",
        },
        weekly: {
          title: "The week is over!",
          descriptionWinner:
            "And we have a winner from {user}!\nWith a score of {votes}, the theme of the week is...\n\n**{name}**!",
          descriptionNoWinner: "The week is over, but no winner was found.",
        },
      },
      error: {
        title: "Error",
        description: "An error occurred: {message}",
      },
      success: {
        title: "Success",
        description: "{message}",
      },
    },
    ping: {
      description: "Check Asuka's latency.",
      response: "Pong! My latency is {ping}ms.",
    },
    setup: {
      description: "Set up Asuka in your server.",
      get: {
        description: "Get the current settings for Asuka.",
        response: {
          title: "Asuka settings",
          description: "The current settings for this server:",
          general: {
            title: "General settings",
            description:
              "**Announcement channel:** {announceChannel}\n**Admin channel:** {adminChannel}\n**Embed fixer:** {embedFixer}\n**Timeout nyaboom:** {timeoutNyaboom}",
          },
          voting: {
            title: "Voting settings",
            description:
              "**Voting enabled:** {votingEnabled}\n**Voting channel:** {votingChannel}\n**Max suggestions:** {maxSuggestions}\n**Name template:** {nameTemplate}\n-# <:reply:1303321572592844813> *{nameTemplateExample}*",
          },
          event: {
            title: "Event settings",
            description: "**Event channel:** {eventChannel}",
          },
        },
      },
      general: {
        title: "General settings",
        description: "Set up the general settings for Asuka.",
        adminChannel: "The channel where Asuka sends admin messages.",
        embedFixer: "Enable the embed fixer.",
        timeoutNyaboom: "Enable the funniest feature ever.",
      },
      voting: {
        title: "Voting settings",
        description: "Set up the voting settings for Asuka.",
        votingEnabled: "Enable voting.",
        votingChannel: "The channel where voting takes place.",
        maxSuggestions: "The maximum number of suggestions per user.",
        nameTemplate:
          'The template for the server name, where %C% is the submitted name. E.g.: "%C% Club"',
      },
      event: {
        title: "Event settings",
        description: "Set up the event settings for Asuka.",
        eventChannel: "The channel where events are announced.",
      },
    },
    submit: {
      description: "Submit the server's next identity!",
      image: "The image to submit.",
      caption: "The server's name to go with the image.",
      response: {
        success: "Your submission has been successfully submitted.",
        votingChannel:
          "Your submission has been accepted and is now available in {channel}.",
      },
      admin: {
        accepted: "Submission accepted by {user}.",
        rejected: "Submission rejected by {user}.",
      },
      user: {
        accepted:
          "<:birthday_star:1303321829938692107> Your submission (`{submission}`) has been accepted!\n-# <:reply_continuing:1303321620047200317> [Go to channel]({channel})\n-# <:reply:1303321572592844813> [Download image]({image})",
        rejected:
          "<:kexDisgust3:783276543182110750> Your submission (`{submission}`) has been rejected.\n-# <:reply:1303321572592844813> [Download image]({image})",
        winner:
          "<:birthday_star:1303321829938692107> Your submission (`{submission}`) has won the voting!\n-# <:reply_continuing:1303321620047200317> [Go to channel]({channel})\n-# <:reply:1303321572592844813> [Download image]({image})",
      },
      error: {
        noImage: "You need to provide an image to submit.",
        noText: "You need to provide a server name to go with the image.",
        invalidImage: "The image you provided is invalid.",
        imageTooLarge: "The image you provided is too large.",
        noVotingChannel:
          "Voting is enabled, but the voting channel couldn't be found.",
        saveImage: "There was an error saving the image.",
        noUser: "There was an error getting the user.",
        maxSubmissions: "You've reached the maximum number of submissions.",
      },
    },
  },
};

function localize(element: AcceptedOptions, key: string) {
  const localizations = AsukaI18n.getSupportedLocales();
  for (const locale of localizations) {
    let description: string;
    try {
      description = AsukaI18n.t(key, locale as I18nLanguages);
    } catch (_e) {
      description = AsukaI18n.t(key, "en-US");
    }

    if (locale === "en-US") {
      element.setDescriptionLocalization("en-US", description);
      element.setDescriptionLocalization("en-GB", description);
    } else {
      element.setDescriptionLocalization(locale as I18nLanguages, description);
    }
  }

  return element;
}

function localizeCmd(builder: SlashCommandBuilder, key: string) {
  return localize(builder, key) as SlashCommandBuilder;
}

function localizeSubCmd(builder: SlashCommandSubcommandBuilder, key: string) {
  return localize(builder, key) as SlashCommandSubcommandBuilder;
}

function localizeString(option: SlashCommandStringOption, key: string) {
  return localize(option, key) as SlashCommandStringOption;
}

function localizeNumber(option: SlashCommandNumberOption, key: string) {
  return localize(option, key) as SlashCommandNumberOption;
}

function localizeAttachment(option: SlashCommandAttachmentOption, key: string) {
  return localize(option, key) as SlashCommandAttachmentOption;
}

function localizeChannel(option: SlashCommandChannelOption, key: string) {
  return localize(option, key) as SlashCommandChannelOption;
}

function localizeInteger(option: SlashCommandIntegerOption, key: string) {
  return localize(option, key) as SlashCommandIntegerOption;
}

function localizeRole(option: SlashCommandRoleOption, key: string) {
  return localize(option, key) as SlashCommandRoleOption;
}

function localizeUser(option: SlashCommandUserOption, key: string) {
  return localize(option, key) as SlashCommandUserOption;
}

function localizeBoolean(option: SlashCommandBooleanOption, key: string) {
  return localize(option, key) as SlashCommandBooleanOption;
}

function localizeMentionable(
  option: SlashCommandMentionableOption,
  key: string,
) {
  return localize(option, key) as SlashCommandMentionableOption;
}

export {
  localizeCmd,
  localizeSubCmd,
  localizeString,
  localizeNumber,
  localizeAttachment,
  localizeChannel,
  localizeInteger,
  localizeRole,
  localizeUser,
  localizeBoolean,
  localizeMentionable,
  exampleLocale,
};
