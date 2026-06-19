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
        .setName("reset")
        .setDescription("Reset the honeypot and report channel settings."),
    ),
  execute: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "reset") {
      await Guild.findByIdAndUpdate(interaction.guildId, {
        honeypotChannelId: null,
        reportChannelId: null,
      });
      await interaction.reply(
        "Honeypot and report channel settings have been reset.",
      );
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
