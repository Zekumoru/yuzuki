import { EmbedBuilder, Events, MessageFlags, userMention } from "discord.js";
import createEvent from "./create-event.js";
import { logger } from "../utils/logger.js";

const honeypotInteractionEvent = createEvent({
  name: Events.InteractionCreate,
  execute: async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("honeypot:")) return;

    const [, action, userId] = interaction.customId.split(":");
    const { guild } = interaction;
    if (!guild) return;

    switch (action) {
      case "untimeout": {
        try {
          const member = await guild.members.fetch(userId!);
          await member.timeout(null, `Untimeout by ${interaction.user.tag}`);

          const embed = EmbedBuilder.from(
            interaction.message.embeds[0]!,
          ).setColor(0x57f287);
          replaceStatusField(
            embed,
            `Untimed out by ${userMention(interaction.user.id)}`,
          );

          await interaction.update({
            embeds: [embed],
            components: [],
          });
          logger.info(
            `${interaction.user.tag} (${interaction.user.id}) untimed out: ${member.user.tag} (${member.user.id})`,
          );
        } catch (error) {
          logger.error(error, `Failed to untimeout user ${userId}`);
          await interaction.reply({
            content: `Failed to untimeout ${userMention(userId!)}. They may have left the server.`,
            flags: MessageFlags.Ephemeral,
          });
        }
        break;
      }
      case "dismiss": {
        const embed = EmbedBuilder.from(
          interaction.message.embeds[0]!,
        ).setColor(0x99aab5);
        replaceStatusField(
          embed,
          `Dismissed by ${userMention(interaction.user.id)}`,
        );

        await interaction.update({
          embeds: [embed],
          components: [],
        });
        break;
      }
    }
  },
});

function replaceStatusField(embed: EmbedBuilder, status: string) {
  const fields = embed.data.fields ?? [];
  const statusIndex = fields.findIndex((f) => f.name === "Status");

  if (statusIndex !== -1) {
    fields[statusIndex]!.value = status;
  } else {
    fields.push({ name: "Status", value: status });
  }
}

export default honeypotInteractionEvent;
