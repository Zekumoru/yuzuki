import { env } from "./env.js";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { argv } from "process";
import { logger } from "./utils/logger.js";
import loadCommands from "./commands/load-commands.js";
import loadEvents from "./events/load-events.js";
import registerCommands from "./commands/register-commands.js";
import connect from "./db/connect.js";

// To use args in dev, run: nx serve zekuru --args="-r"
const toRegister = argv.some(
  (option) => option === "--register" || option === "-r",
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages, // for receiving messageCreate events
    GatewayIntentBits.MessageContent, // used for reading the actual message (for review)
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

for (const [, command] of await loadCommands()) {
  client.commands.set(command.data.name, command);
  logger.info(`Loaded command: ${command.data.name}`);
}

for (const [, event] of await loadEvents()) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (event.once) client.once(event.name, event.execute as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  else client.on(event.name, event.execute as any);
  logger.info(`Loaded event: ${event.name}`);
}

const start = async () => {
  try {
    await connect();
    await client.login(env.DISCORD_TOKEN);
  } catch (error) {
    logger.error(error, "Failed to start app");
  }
};

if (toRegister) {
  registerCommands().then(start);
} else {
  start();
}
