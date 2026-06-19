import {
  Collection,
  Events,
  inlineCode,
  MessageFlags,
  time,
  TimestampStyles,
  type InteractionReplyOptions,
} from "discord.js";
import createEvent from "./create-event.js";
import { logger } from "../utils/logger.js";

const interactionCreateEvent = createEvent({
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        throw new Error(
          `No command matching ${interaction.commandName} was found.`,
        );
      }

      // Cooldown check
      const defaultCooldown = 1; // seconds
      const cooldownAmount = (command.cooldown ?? defaultCooldown) * 1000;
      const { cooldowns } = interaction.client;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const timestamps = cooldowns.get(command.data.name)!;
      const now = Date.now();

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id)! + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          await interaction.reply({
            content: `Please wait, you are on a cooldown. You can use ${inlineCode(command.data.name)} again in ${time(expiredTimestamp, TimestampStyles.RelativeTime)}`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      await command.execute(interaction);
    } catch (error) {
      let message;
      if (error instanceof Error) {
        message = error.message;
        logger.error(error, message);
      } else {
        message = "An internal error occurred.";
        logger.error(message);
      }

      const payload: InteractionReplyOptions = {
        content: message,
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    }
  },
});

export default interactionCreateEvent;
