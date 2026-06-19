import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface DiscordCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  cooldown?: number;
  devOnly?: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void;
}

export const isDiscordCommand = (
  command: unknown,
): command is DiscordCommand => {
  return (
    typeof command === "object" &&
    (command as DiscordCommand)["data"] !== undefined &&
    (command as DiscordCommand)["execute"] !== undefined
  );
};

/**
 * Factory function to create a Discord command.
 */
export default function createCommand(command: DiscordCommand): DiscordCommand {
  return command;
}
