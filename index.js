const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
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

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
});

// Store states for copied users and modes
let copyMode = 'none'; // 'all' | 'user' | 'none'
let copiedUsers = new Set(); // Set of user IDs to copy messages from

// Function to get user ID from mention
function getUserIDFromMention(mention) {
  const regex = /^<@!?(\d+)>$/;
  const match = mention.match(regex);
  return match ? match[1] : null;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  // Handle commands to enable/disable copying
  if (message.content.startsWith('*copy')) {
    const args = message.content.split(' ');

    if (args[1] === 'all') {
      copyMode = 'all';
      copiedUsers.clear(); // Clear specific user settings
      await message.reply('Copying all messages is now enabled.');
    } else if (args[1] === 'user') {
      const targetUser = args[2] || message.mentions.users.first()?.id;
      if (targetUser) {
        copyMode = 'user';
        copiedUsers.add(targetUser);
        await message.reply(`Copying messages from <@${targetUser}> is now enabled.`);
      } else {
        await message.reply('Please mention a user or provide a user ID.');
      }
    } else if (args[1] === 'uncopy') {
      if (args[2] === 'all') {
        copyMode = 'none';
        copiedUsers.clear();
        await message.reply('Copying all messages is now disabled.');
      } else if (args[2] === 'user') {
        const targetUser = args[3] || message.mentions.users.first()?.id;
        if (targetUser) {
          copiedUsers.delete(targetUser);
          await message.reply(`Stopped copying messages from <@${targetUser}>.`);
        } else {
          await message.reply('Please mention a user or provide a user ID.');
        }
      }
    }
    return; // Return early to avoid further processing of messages
  }

  // If copying is enabled for all messages
  if (copyMode === 'all') {
    try {
      // Delete the user's message
      await message.delete();

      // Send the same message back with the text and attachments
      await message.channel.send({
        content: `${message.author.tag}: ${message.content}`,
        files: message.attachments.map((attachment) => attachment.url),
      });
    } catch (error) {
      console.error('Error during message handling:', error);
    }
  }

  // If copying is enabled for specific users
  else if (copyMode === 'user' && copiedUsers.has(message.author.id)) {
    try {
      // Delete the user's message
      await message.delete();

      // Send the same message back with the text and attachments
      await message.channel.send({
        content: `${message.author.tag}: ${message.content}`,
        files: message.attachments.map((attachment) => attachment.url),
      });
    } catch (error) {
      console.error('Error during message handling:', error);
    }
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
