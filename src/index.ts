import { SapphireClient } from '@sapphire/framework';
import "util/init";

const client = new SapphireClient({
    intents: ['Guilds', 'GuildMessages'],
    loadMessageCommandListeners: true, // TODO: commands and listeners
});

client.login(process.env.TOKEN);