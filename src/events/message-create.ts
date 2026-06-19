import {
  channelMention,
  EmbedBuilder,
  Events,
  TextChannel,
  userMention,
} from "discord.js";
import createEvent from "./create-event.js";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";

// TODO: Create db persistence for custom timeout
const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 hour

const messageCreateEvent = createEvent({
  name: Events.MessageCreate,
  execute: async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== env.HONEYPOT_CHANNEL_ID) return;

    const { member, guild } = message;
    if (!member || !guild) return;

    try {
      await member.timeout(TIMEOUT_DURATION, "Caught by honeypot channel.");
      logger.info(`Timed out ${member.user.tag} (${member.id})`);

      // Delete their messages from the past hour across all channels
      const oneHourAgo = Date.now() - TIMEOUT_DURATION;
      const channels = guild.channels.cache.filter(
        (ch) => ch.isTextBased() && member.permissionsIn(ch),
      );

      for (const [, channel] of channels) {
        try {
          const textChannel = channel as TextChannel;
          const messages = await textChannel.messages.fetch({ limit: 100 });
          const userMessages = messages.filter(
            (msg) =>
              msg.author.id === member.id && msg.createdTimestamp >= oneHourAgo,
          );

          if (userMessages.size > 0) {
            await textChannel.bulkDelete(userMessages);
          }
        } catch {
          // The `?` denotes the fact that the channels filtered should be the
          // channels that the spammer can access, thus, if this is logged,
          // then there might be some weird error.
          logger.warn(
            `Channel skipped, possibly lacking access(?), for checking messages to delete: ${channel.name} (${channel.id})`,
          );
        }
      }

      // Send report embed
      const reportChannel = guild.channels.cache.get(env.REPORT_CHANNEL_ID);
      if (!reportChannel?.isTextBased()) {
        logger.warn("Report channel not found or not text-based.");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Honeypot Triggered")
        .setColor(0xff0000)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          {
            name: "User",
            value: userMention(member.id),
          },
          {
            name: "Message",
            value: message.content || "No text content.",
          },
          {
            name: "Channel",
            value: channelMention(message.channel.id),
          },
        )
        .setTimestamp();

      await (reportChannel as TextChannel).send({ embeds: [embed] });
      logger.info(`Report sent for ${member.user.tag} (${member.user.id})`);
    } catch (error) {
      logger.error(
        error,
        `Failed to handle honeypot trigger for ${member.user.tag}`,
      );
    }
  },
});

export default messageCreateEvent;
