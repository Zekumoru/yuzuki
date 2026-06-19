import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isDiscordEvent, type AnyDiscordEvent } from "./create-event.js";

// "entry" because the event could be in a file directly or
// within its own folder with the same name.
const eventEntryRegex = /^[\w-]*\.ts$/i;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsFolderPath = path.join(__dirname); // this folder

// Get the event's file path: either the file directly or
// if a folder then grab the file within it with the same
// folder name.
const getEventPath = (entry: string): string | undefined => {
  if (entry.endsWith(".ts")) {
    return path.join(eventsFolderPath, entry); // is a file
  }

  const eventPath = path.join(eventsFolderPath, entry, `${entry}.ts`);

  // Check if the folder has a file with the same name
  if (!fs.existsSync(eventPath)) return;

  return eventPath;
};

const loadEvents = async (): Promise<[string, AnyDiscordEvent][]> => {
  const eventEntries = fs
    .readdirSync(eventsFolderPath)
    .filter((entry) => entry.match(eventEntryRegex));

  const events: [string, AnyDiscordEvent][] = [];

  for (const entry of eventEntries) {
    const eventPath = getEventPath(entry);
    if (!eventPath) continue;

    const mod = await import(eventPath);
    const event = mod.default;
    if (!isDiscordEvent(event)) continue;

    events.push([eventPath, event]);
  }

  return events;
};

export default loadEvents;
