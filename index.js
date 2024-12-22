const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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

let lastDeletedMessage = null; // Store the last deleted message

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  try {
    // Delete the user's message and store it for snipe command
    lastDeletedMessage = {
      content: message.content,
      author: message.author.tag,
      time: new Date(),
    };

    // Delete the message
    await message.delete();
  } catch (error) {
    console.error('Error during message delete operation:', error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Snipe command
  if (message.content.toLowerCase() === '!snipe') {
    try {
      if (!lastDeletedMessage) {
        return message.channel.send('No recent messages have been deleted.');
      }

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Snipe Command')
        .setDescription(`Message from ${lastDeletedMessage.author}:`)
        .addFields({
          name: 'Message Content:',
          value: lastDeletedMessage.content || 'No content',
        })
        .setFooter({ text: `Deleted at ${lastDeletedMessage.time.toLocaleString()}` })
        .setTimestamp();

      // Send the embed with the deleted message content
      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error during snipe operation:', error);
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
