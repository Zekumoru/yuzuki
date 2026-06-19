import * as z from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CLIENT_ID: z.string().min(1),
  DISCORD_TOKEN: z.string().min(1),
  DEV_GUILD_ID: z.string().min(1),
  HONEYPOT_CHANNEL_ID: z.string().min(1),
  REPORT_CHANNEL_ID: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
