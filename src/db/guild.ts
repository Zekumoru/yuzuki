import { model, Schema } from "mongoose";

interface IGuild {
  _id: string;
  honeypotChannelId: string | null;
  reportChannelId: string | null;
}

const guildSchema = new Schema<IGuild>({
  _id: String,
  honeypotChannelId: { type: String, default: null },
  reportChannelId: { type: String, default: null },
});

const Guild = model<IGuild>("Guild", guildSchema);
export default Guild;
