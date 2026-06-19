import pino from "pino";
import type { PrettyOptions } from "pino-pretty";

const isDev = process.env["NODE_ENV"] !== "production";

const prettyOptions: PrettyOptions = {
  colorize: true,
  translateTime: "HH:MM:ss.l",
  ignore: "pid,hostname",
};

export const logger = pino({
  level: isDev ? "debug" : "info",
  transport: {
    target: "pino-pretty",
    options: prettyOptions,
  },
});
