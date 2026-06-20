import {
  channelMention,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import createCommand from "./create-command.js";
import Guild from "../db/guild.js";

const configCommand = createCommand({
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure bot settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((sub) =>
      sub
        .setName("honeypot-channel")
        .setDescription("Set the honeypot channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to use as a honeypot.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("report-channel")
        .setDescription("Set the report channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to send reports to.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("timeout-duration")
        .setDescription(
          "Set the timeout duration in minutes. If not set, default is 60.",
        )
        .addIntegerOption((option) =>
          option
            .setName("minutes")
            .setDescription("Duration in minutes (max 40320 = 28 days).")
            .setMinValue(1)
            .setMaxValue(40320)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("delete-limit")
        .setDescription(
          "Set the max number of recent messages to check per channel for deletion. If not set, default is 20.",
        )
        .addIntegerOption((option) =>
          option
            .setName("limit")
            .setDescription("Max limit of messages (max 100).")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("reset").setDescription("Reset all settings."),
    ),
  execute: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "reset") {
      await Guild.findByIdAndUpdate(interaction.guildId, {
        honeypotChannelId: null,
        reportChannelId: null,
        timeoutDuration: null,
        deleteLimit: null,
      });
      await interaction.reply({
        content: "All settings have been reset.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "timeout-duration") {
      const minutes = interaction.options.getInteger("minutes", true);
      await Guild.findByIdAndUpdate(
        interaction.guildId,
        { timeoutDuration: minutes * 60 * 1000 },
        { upsert: true },
      );
      await interaction.reply({
        content: `Timeout duration set to ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "delete-limit") {
      const limit = interaction.options.getInteger("limit", true);
      await Guild.findByIdAndUpdate(
        interaction.guildId,
        { deleteLimit: limit },
        { upsert: true },
      );
      await interaction.reply({
        content: `Delete limit set to ${limit}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channel = interaction.options.getChannel("channel", true);

    const update =
      subcommand === "honeypot-channel"
        ? { honeypotChannelId: channel.id }
        : { reportChannelId: channel.id };

    await Guild.findByIdAndUpdate(interaction.guildId, update, {
      upsert: true,
    });

    await interaction.reply({
      content: `${subcommand === "honeypot-channel" ? "Honeypot" : "Report"} channel set to ${channelMention(channel.id)}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
});

export default configCommand;
