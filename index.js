const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  try {
    // Check if the user has Administrator permissions
    const hasAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // Prepare the content
    let content = message.content;

    // Remove @everyone and @here mentions if the user doesn't have Administrator
    if (!hasAdmin) {
      content = content.replace(/@everyone|@here/g, '').trim();
    }

    // Create an array for the attachments
    const attachments = message.attachments.map((attachment) => attachment.url);

    // Check if the message is a reply
    if (message.reference) {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
      
      // Delete the user's message
      await message.delete();

      // Send the reply to the original message
      await message.channel.send({
        content: `${message.author.tag}: ${content || '[No Text]'}`,
        files: attachments,
        reply: { messageReference: repliedMessage.id }, // Reply to the referenced message
      });
    } else {
      // If the message is not a reply, send a normal message
      await message.delete();
      await message.channel.send({
        content: `${message.author.tag}: ${content || '[No Text]'}`,
        files: attachments,
      });
    }
  } catch (error) {
    console.error('Error during message handling:', error);
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
