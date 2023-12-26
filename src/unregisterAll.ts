import 'dotenv/config';
import {REST, Routes, Client} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  throw new Error('Missing token');
}

if (!clientId) {
  throw new Error('Missing client ID');
}

if (!guildId) {
  throw new Error('Missing guild ID');
}

const commands = [];

// Spin up a quick discord bot to fetch all the commands
const client = new Client({intents: ['Guilds', 'GuildMessages']});
client.login(token);

client.on('ready', async () => {
  const commands = await client.application?.commands.fetch();

  if (!commands) {
    throw new Error('No commands found');
  }

  // Delete all the commands
  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token);

  for (const command of commands.values()) {
    await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id))
            .then(() => console.log('Successfully deleted guild command ' + command.name))
            .catch(console.error);

    await rest.delete(Routes.applicationCommand(clientId, command.id))
            .then(() => console.log('Successfully deleted application command ' + command.name))
            .catch(console.error);
  }

  // Destroy the client
  await client.destroy();
});
