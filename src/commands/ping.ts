import { SlashCommandBuilder } from "discord.js";
import createCommand from "./create-command.js";

const pingCommand = createCommand({
  devOnly: true,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  execute: async (interaction) => {
    await interaction.reply("Pong!");
  },
});

export default pingCommand;
