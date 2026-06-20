import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isDiscordCommand, type DiscordCommand } from "./create-command.js";

// "entry" because it could either be a folder or a file.
// If it is a folder, it is a command if the folder name
// matches the name of a file within
const commandEntryRegex = /^[\w-]*\.[jt]s$/i;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsFolder = path.join(__dirname); // this folder

const getCommandPath = (entry: string): string | undefined => {
  if (entry.endsWith(".ts") || entry.endsWith(".js")) {
    return path.join(commandsFolder, entry); // is a file
  }

  const ext = fs.existsSync(path.join(commandsFolder, entry, `${entry}.js`))
    ? ".js"
    : ".ts";
  const commandPath = path.join(commandsFolder, entry, `${entry}${ext}`);
  if (!fs.existsSync(commandPath)) return;
  return commandPath;
};

const loadCommands = async (): Promise<[string, DiscordCommand][]> => {
  const commandEntries = fs
    .readdirSync(commandsFolder)
    .filter((entry) => entry.match(commandEntryRegex));

  const commands: [string, DiscordCommand][] = [];

  for (const entry of commandEntries) {
    const commandPath = getCommandPath(entry);
    if (!commandPath) continue;

    const mod = await import(commandPath);
    const command = mod.default;
    if (!isDiscordCommand(command)) continue;

    commands.push([commandPath, command]);
  }

  return commands;
};

export default loadCommands;
