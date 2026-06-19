import { Events, MessageFlags, type InteractionReplyOptions } from "discord.js";
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
