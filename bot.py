const { Client, GatewayIntentBits } = require('discord.js');

// Initialize the Discord bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Replace with your bot token
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Login to Discord
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(DISCORD_BOT_TOKEN);

// API endpoint to keep the bot alive
module.exports = (req, res) => {
  res.status(200).send("Bot is online!");
};
