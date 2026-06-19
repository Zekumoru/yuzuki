import { Collection } from "discord.js";
import type { DiscordCommand } from "../commands/create-command.js";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, DiscordCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
