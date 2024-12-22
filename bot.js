const { Client, Intents } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Set up a simple web server with Express
app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(8080, () => {
    console.log('Web server running on port 8080');
});

// Set up the bot login
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

// Fetch the token from the environment variable
const token = process.env.TOKEN;
if (!token) {
    console.error("No token found! Please set the DISCORD_TOKEN environment variable.");
    process.exit(1);
}

client.login(token);
