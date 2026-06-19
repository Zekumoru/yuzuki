import type { ClientEvents } from "discord.js";

export interface DiscordEvent<Event extends keyof ClientEvents> {
  name: Event;
  execute: (...args: ClientEvents[Event]) => Promise<void> | void;
  once?: boolean;
}

export type AnyDiscordEvent = {
  [Event in keyof ClientEvents]: DiscordEvent<Event>;
}[keyof ClientEvents];

export const isDiscordEvent = (event: unknown): event is AnyDiscordEvent => {
  return (
    typeof event === "object" &&
    (event as AnyDiscordEvent)["name"] !== undefined &&
    (event as AnyDiscordEvent)["execute"] !== undefined
  );
};

/**
 * Factory function to create a Discord event.
 */
export default function createEvent<Event extends keyof ClientEvents>(
  event: DiscordEvent<Event>,
): DiscordEvent<Event> {
  return event;
}
