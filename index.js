const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// A map to store the users being monitored
const onlineCheckMap = new Map();

// Notify when a user goes online or offline
client.on('presenceUpdate', (oldPresence, newPresence) => {
  const userId = newPresence.user.id;

  if (onlineCheckMap.has(userId)) {
    const user = newPresence.user;
    const status = newPresence.status;
    
    // Send a notification when a monitored user changes their status
    const channel = onlineCheckMap.get(userId);
    if (status === 'online') {
      channel.send(`${user.tag} is now online!`);
    } else if (status === 'offline') {
      channel.send(`${user.tag} is now offline.`);
    }
  }
});

// Command to check if a user is online
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  if (message.content.toLowerCase().startsWith('*checkonline')) {
    const userMention = message.mentions.users.first() || message.content.split(' ')[1];
    const userId = userMention.replace(/[<@!>]/g, ''); // Get userId from mention or the provided ID

    try {
      const user = await client.users.fetch(userId);

      if (!user) {
        return message.channel.send('User not found!');
      }

      const onlineStatus = user.presence ? user.presence.status : 'offline';
      
      if (onlineCheckMap.has(userId)) {
        return message.channel.send(`${user.tag} is already being monitored.`);
      }

      // Set up monitoring for the user and notify if they are online/offline
      onlineCheckMap.set(userId, message.channel);
      
      message.channel.send(`I will now send you a notification when ${user.tag} is online!`);

      if (onlineStatus === 'online') {
        message.channel.send(`${user.tag} is currently online!`);
      } else {
        message.channel.send(`${user.tag} is currently offline.`);
      }
    } catch (error) {
      message.channel.send('Error fetching user. Make sure the user ID or mention is correct.');
    }
  }

  if (message.content.toLowerCase().startsWith('*uncheckonline')) {
    const userMention = message.mentions.users.first() || message.content.split(' ')[1];
    const userId = userMention.replace(/[<@!>]/g, ''); // Get userId from mention or the provided ID

    if (!onlineCheckMap.has(userId)) {
      return message.channel.send('User is not being monitored.');
    }

    // Remove the user from monitoring
    onlineCheckMap.delete(userId);
    message.channel.send(`Stopped monitoring ${userId}.`);
  }
});

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
    process.exit(1);
  }
}

login();
