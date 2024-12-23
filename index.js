const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
});

// Store the forwarding channel, user mappings, and copied users
let forwardingChannel = null;
const userMappings = new Map(); // Map of userID to DM forwarding channel
let copiedUsers = new Set(); // Set of user IDs to copy messages from
let copyAllEnabled = false; // Flag to enable copying from everyone

// Function to get user ID from mention
function getUserIDFromMention(mention) {
  const regex = /^<@!?(\d+)>$/;
  const match = mention.match(regex);
  return match ? match[1] : null;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  const args = message.content.split(' ');

  // Handle *set command
  if (message.content.startsWith('*set')) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('You do not have permission to use this command.');
    }

    const channel = message.mentions.channels.first() || client.channels.cache.get(args[1]);
    if (channel) {
      forwardingChannel = channel.id;
      await message.reply(`Forwarding channel set to <#${channel.id}>.`);
    } else {
      await message.reply('Please mention a valid channel or provide a valid channel ID.');
    }
    return;
  }

  // Handle *setuser command
  if (message.content.startsWith('*setuser')) {
    if (!forwardingChannel) {
      return message.reply('No forwarding channel is set. Use *set first.');
    }

    const targetUser = message.mentions.users.first() || client.users.cache.get(args[1]);
    if (targetUser) {
      userMappings.set(targetUser.id, forwardingChannel);
      await message.reply(`Messages for <@${targetUser.id}> will now be forwarded to their DMs.`);
    } else {
      await message.reply('Please mention a valid user or provide a valid user ID.');
    }
    return;
  }

  // Handle the *copy command
  if (message.content.startsWith('*copy')) {
    if (args[1] === 'all') {
      copyAllEnabled = true;
      copiedUsers.add('all');
      await message.reply('Now copying messages from all users.');
      return;
    }

    const targetUser = getUserIDFromMention(args[1]) || args[1];
    if (targetUser) {
      copiedUsers.add(targetUser);
      await message.reply(`Now copying messages from <@${targetUser}> (ID: ${targetUser}).`);
    } else {
      await message.reply('Please mention a user or provide a valid user ID.');
    }
    return;
  }

  // Handle *uncopy command
  if (message.content.startsWith('*uncopy')) {
    if (args[1] === 'all') {
      copyAllEnabled = false;
      copiedUsers.delete('all');
      await message.reply('No longer copying messages from all users.');
    } else if (args[1]) {
      const targetUser = getUserIDFromMention(args[1]) || args[1];
      if (targetUser) {
        copiedUsers.delete(targetUser);
        await message.reply(`No longer copying messages from <@${targetUser}> (ID: ${targetUser}).`);
      } else {
        await message.reply('Please mention a user or provide a valid user ID.');
      }
    } else {
      await message.reply('Please specify who to stop copying from (either a user or "all").');
    }
    return;
  }

  // Forward DMs to the set channel
  if (message.channel.type === 'DM' && forwardingChannel) {
    const channel = client.channels.cache.get(forwardingChannel);
    if (channel) {
      await channel.send(`DM from **${message.author.tag}** (ID: ${message.author.id}):\n${message.content}`);
    }
    return;
  }

  // Forward channel messages to user DMs
  if (message.channel.id === forwardingChannel && userMappings.size > 0) {
    const targetUserID = [...userMappings.keys()].find((id) => message.mentions.users.has(id) || id === args[1]);
    if (targetUserID) {
      const targetUser = client.users.cache.get(targetUserID);
      if (targetUser) {
        try {
          await targetUser.send(message.content);
        } catch (err) {
          console.error(`Could not send DM to ${targetUser.tag}:`, err);
          await message.reply(`Could not send DM to <@${targetUserID}>.`);
        }
      }
    }
  }

  // Copy messages based on the copy command
  if (copyAllEnabled || copiedUsers.has(message.author.id)) {
    try {
      await message.channel.send({
        content: `${message.author.tag}: ${message.content}`,
        files: message.attachments.map((attachment) => attachment.url),
      });
    } catch (error) {
      console.error('Error copying message:', error);
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
