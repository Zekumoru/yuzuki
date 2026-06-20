import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  channelMention,
  EmbedBuilder,
  Events,
  TextChannel,
  userMention,
} from "discord.js";
import createEvent from "./create-event.js";
import { logger } from "../utils/logger.js";
import Guild from "../db/guild.js";

const messageCreateEvent = createEvent({
  name: Events.MessageCreate,
  execute: async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.member?.isCommunicationDisabled()) return;

    const guildConfig = await Guild.findById(message.guild.id);
    if (!guildConfig?.honeypotChannelId || !guildConfig.reportChannelId) return;
    if (message.channel.id !== guildConfig.honeypotChannelId) return;

    const { member, guild } = message;
    if (!member || !guild) return;

    try {
      const timeoutDuration = guildConfig.timeoutDuration ?? 60 * 60 * 1000; // default is 1 hr
      const deleteLimit = guildConfig.deleteLimit ?? 20; // default is up to 20 messages

      await member.timeout(timeoutDuration, "Caught by honeypot channel.");
      logger.info(`Timed out ${member.user.tag} (${member.id})`);

      // Delete their messages from the past hour across all channels
      const channels = guild.channels.cache.filter(
        (ch) => ch.isTextBased() && member.permissionsIn(ch).has("ViewChannel"),
      );

      await Promise.all(
        channels.map(async (channel) => {
          try {
            const textChannel = channel as TextChannel;
            const messages = await textChannel.messages.fetch({
              limit: deleteLimit,
            });
            const userMessages = messages.filter(
              (msg) => msg.author.id === member.id,
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
        }),
      );

      // Send report embed
      const reportChannel = guild.channels.cache.get(
        guildConfig.reportChannelId,
      );
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
          {
            name: "Note",
            value:
              "All messages of this user in the past hour have been automatically deleted. To ban this user, please do so manually. The bot does not have ban permissions.",
          },
          {
            name: "Status",
            value: "Pending review",
          },
        )
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`honeypot:untimeout:${member.id}`)
          .setLabel("Untimeout")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`honeypot:dismiss:${member.id}`)
          .setLabel("Dismiss")
          .setStyle(ButtonStyle.Secondary),
      );

      await (reportChannel as TextChannel).send({
        embeds: [embed],
        components: [row],
      });
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
