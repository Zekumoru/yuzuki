import {
  REST,
  Routes,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { argv } from "process";
import loadCommands from "./load-commands.js";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";

// Check whether to deploy globally or locally to guild development
const isGlobal = argv.some(
  (option) => option === "--global" || option === "-g",
);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(env.DISCORD_TOKEN);

interface RestResult {
  length: number;
}

const registerCommands = async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  for (const [, command] of await loadCommands()) {
    commands.push(command.data.toJSON());
  }

  logger.info(
    `Started refreshing${isGlobal ? " globally " : " "}${
      commands.length
    } application (/) commands.`,
  );

  const route = isGlobal
    ? Routes.applicationCommands(env.CLIENT_ID)
    : Routes.applicationGuildCommands(env.CLIENT_ID, env.DEV_GUILD_ID);

  // The put method is used to fully refresh all
  // commands in the guild with the current set
  try {
    const data = (await rest.put(route, { body: commands })) as RestResult;

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    logger.error(
      error,
      "An error has occurred while registering the commands.",
    );
  }
};

export default registerCommands;
