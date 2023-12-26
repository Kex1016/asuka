import {SapphireClient} from '@sapphire/framework';
import {configDotenv} from "dotenv";

configDotenv();

const client = new SapphireClient({
  intents: ['Guilds', 'GuildMessages'],
  loadMessageCommandListeners: true,
});

client.login(process.env.TOKEN);