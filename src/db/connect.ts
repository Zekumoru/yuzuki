import mongoose from "mongoose";
import { env } from "../env.js";
import { logger } from "../utils/logger.js";

export default async function connect() {
  await mongoose.connect(env.MONGODB_URI);
  logger.info("Connected to MongoDB");
}
