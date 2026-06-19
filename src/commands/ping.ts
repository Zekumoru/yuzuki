import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import createCommand from "./create-command.js";

const pingCommand = createCommand({
  devOnly: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  execute: async (interaction) => {
    await interaction.reply(
      `Hi! I'm up and running! Latency: ${interaction.client.ws.ping}`,
    );
  },
});

export default pingCommand;
