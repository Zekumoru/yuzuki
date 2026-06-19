import { model, Schema } from "mongoose";

interface IGuild {
  _id: string;
  honeypotChannelId: string | null;
  reportChannelId: string | null;
  timeoutDuration: number | null;
}

const guildSchema = new Schema<IGuild>({
  _id: String,
  honeypotChannelId: { type: String, default: null },
  reportChannelId: { type: String, default: null },
  timeoutDuration: { type: Number, default: null }, // default 1 hour in messageCreate event
});

const Guild = model<IGuild>("Guild", guildSchema);
export default Guild;
