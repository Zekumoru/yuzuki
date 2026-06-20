# Yuzuki

A Discord bot that automatically catches spammers using a honeypot channel. When a user sends a message in the honeypot channel, Yuzuki will:

- Time them out for 1 hour (configurable).
- Delete their recent messages across all accessible channels.
- Send a report to a designated channel for moderators to review.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-bot-client-id
DEV_GUILD_ID=your-dev-server-id
MONGODB_URI=mongodb://localhost:27017/yuzuki
```

### Discord Developer Portal

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application and navigate to **Bot**
3. Enable **Message Content Intent** under **Privileged Gateway Intents**

### Bot Permissions

When inviting the bot to your server, it needs the following permissions:

- View Channels
- Send Messages
- Read Message History
- Moderate Members
- Embed Links
- Manage Messages

### Register Commands

Run with the `--register` or `-r` flag to register slash commands:

```bash
# Register to dev guild only
pnpm start -- -r

# Register globally (all servers)
pnpm start -- -r -g
```

### Running

```bash
# Development (with hot reload)
pnpm dev

# Production
pnpm start
```

## Usage

### Configuring the Honeypot

Before Yuzuki can catch spammers, a moderator needs to configure two channels:

1. **Set the honeypot channel**: a dummy channel that looks like a normal channel to bait spammers:

   `/config honeypot-channel #channel`

2. **Set the report channel**: where Yuzuki sends reports for moderators to review:

   `/config report-channel #channel`

3. **Set the timeout duration** (default: 1 hour):

   `/config timeout-duration <minutes>`

4. **Set the delete limit** — max recent messages to check per channel for deletion (default: 20):

   `/config delete-limit <limit>`

5. **Reset all settings:**

   `/config reset`

### Report Actions

When a spammer is caught, Yuzuki sends an embed in the report channel with two actions:

- **Untimeout**: removes the timeout if it was a false positive
- **Dismiss**: marks the report as resolved

To ban a user, moderators need to do so manually since the bot intentionally does not have ban permissions.

### Other Commands

| Command | Description |
| ------- | ----------- |
| `/ping` | Check if the bot is online and view its latency |
