import { Client, GatewayIntentBits } from "discord.js";
import { Bot } from "@nyx-discord/framework";
import AsukaI18n from "./i18n/i18n.ts";
import AsukaDatabase from "./database/database.ts";
import fs from "node:fs";

// IDEA: no more i18n lol

// Commands
import PingCommand from "./commands/ping.ts";
import SubmitCommand from "./commands/submissions/submit.ts";

// Events
import ReadyEventSubscriber from "./events/ready/setupBotPresence.ts";
import {
  SetupEventSettings,
  SetupGeneralSettings,
  SetupGetSettings,
  SetupParentCommand,
  SetupVotingSettings,
} from "./commands/admin/setup.ts";
import MakeServerSettingsSubscriber from "./events/ready/makeServerSettings.ts";
import SubmissionAcceptSubscriber from "./events/buttons/submissions/accept.ts";
import SubmissionRejectSubscriber from "./events/buttons/submissions/reject.ts";

// Schedules
import WeeklySubmissionSchedule from "./schedules/checkSubmissions.ts";
import EventSchedule from "./schedules/eventSchedule.ts";
import EmbedFixer from "./events/message/embedFixer.ts";
import GetSubmissionsCommand from "./commands/admin/getSubmissions.ts";
import UpdateGuildDatabaseSubscriber from "./events/guildUpdate/updateGuildDatabase.ts";
import ForceSubmissionsCommand from "./commands/admin/forceSubmissions.ts";
import {
  EventsCreateSubCommand,
  EventsParentCommand,
} from "./commands/events/events.ts";
import ScheduleEventsOnMessageSubscriber from "./events/message/scheduleEventsOnMessage.ts";
import ScheduleEventsSchedule from "./schedules/scheduleEvents.ts";
import BoopCommand from "./commands/admin/boop.ts";
import TimeoutMockEvent from "./events/message/timeoutNya.ts";
import ProfileCommand from "./commands/profile.ts";

// Sessions
// ...

const token = Bun.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("No token provided.");
}

const icon_location = Bun.env.ICON_LOCATION;
if (!icon_location) {
  throw new Error("No icon location provided.");
}

const _path = Bun.pathToFileURL(icon_location);
if (
  !fs.existsSync(_path.pathname.replace("%7E", "~")) ||
  !fs.lstatSync(_path.pathname.replace("%7E", "~")).isDirectory()
) {
  throw new Error("Invalid icon location provided.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const bot = Bot.create((_bot) => ({
  token,
  client,
  id: Symbol("Asuka"),
  logger: console,
  deployCommands: true,
}));

await AsukaI18n.loadLocale();
await AsukaDatabase.connect();

// ------- Commands -------
const commandManager = bot.getCommandManager();
console.log("Command manager created. Adding commands...");

await commandManager.addCommands(new PingCommand());
console.log("Ping command added.");

await commandManager.addCommands(new SubmitCommand());
console.log("Submit command added.");

const setupCommand = new SetupParentCommand();
const setupGetSettings = new SetupGetSettings(setupCommand);
const setupGeneralSettings = new SetupGeneralSettings(setupCommand);
const setupVotingSettings = new SetupVotingSettings(setupCommand);
const setupEventsSettings = new SetupEventSettings(setupCommand);
setupCommand.addChildren(
  setupGetSettings,
  setupGeneralSettings,
  setupVotingSettings,
  setupEventsSettings,
);
await commandManager.addCommands(setupCommand);
console.log("Setup command added.");

const getSubmissionsCommand = new GetSubmissionsCommand();
await commandManager.addCommands(getSubmissionsCommand);
console.log("Get submissions command added.");

const forceSubmissionsCommand = new ForceSubmissionsCommand();
await commandManager.addCommands(forceSubmissionsCommand);
console.log("Force submissions command added.");

const boopCommand = new BoopCommand();
await commandManager.addCommands(boopCommand);
console.log("Boop command added.");

const profileCommand = new ProfileCommand();
await commandManager.addCommands(profileCommand);
console.log("Profile command added.");

// const eventCommandParent = new EventsParentCommand();
// const eventAddCommand = new EventsCreateSubCommand(eventCommandParent);
// eventCommandParent.addChildren(eventAddCommand);
// await commandManager.addCommands(eventCommandParent);
// console.log("Events command added.");

// ------- Events -------
const eventManager = bot.getEventManager();
console.log("Event manager created. Adding events...");

await eventManager.subscribeClient(new ReadyEventSubscriber());
console.log("Ready event subscribed.");

await eventManager.subscribeClient(new MakeServerSettingsSubscriber());
console.log("Make server settings subscribed.");

await eventManager.subscribeClient(
  new SubmissionAcceptSubscriber(),
  new SubmissionRejectSubscriber(),
);
console.log("Submission accept/reject subscribed.");

await eventManager.subscribeClient(new EmbedFixer());
console.log("Embed fixer subscribed.");

await eventManager.subscribeClient(new UpdateGuildDatabaseSubscriber());
console.log("Update guild database subscribed.");

await eventManager.subscribeClient(new TimeoutMockEvent());
console.log("Timeout mock event subscribed.");

// ------- Schedules -------
const scheduleManager = bot.getScheduleManager();
console.log("Schedule manager created. Adding schedules...");

await scheduleManager.addSchedule(new WeeklySubmissionSchedule());
console.log("Weekly submission schedule added.");

// await scheduleManager.addSchedule(new ScheduleEventsSchedule());
// console.log("Event scheduler added.");

// Events got fixed by Discord. Kind of. I am also not willing to fix any of this.
// await scheduleManager.addSchedule(new EventSchedule("*/1 * * * * *", "test"));

await bot.start();

// TODO: Middlewares to check for permissions and guilds and stuff
