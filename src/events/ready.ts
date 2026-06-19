import { Events } from "discord.js";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";
import createEvent from "./create-event.js";

const readyEvent = createEvent({
  name: Events.ClientReady,
  execute: async (client) => {
    logger.info(`Ready in ${env.NODE_ENV}! Logged in as ${client.user.tag}`);
  },
});

export default readyEvent;
