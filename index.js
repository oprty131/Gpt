const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
});

// Store the set of users to copy messages from (using their Discord ID or mention)
let copiedUsers = new Set(); 

// Flag to determine if copying should be enabled for everyone
let copyAllEnabled = false;

// Function to get user ID from mention
function getUserIDFromMention(mention) {
  const regex = /^<@!?(\d+)>$/;
  const match = mention.match(regex);
  return match ? match[1] : null;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  // Handle the *copy command to enable or disable message copying from specific users
  if (message.content.startsWith('*copy')) {
    const args = message.content.split(' ');

    if (args[1] === 'all') {
      // Enable copying for everyone
      copyAllEnabled = true;
      copiedUsers.add('all'); // Add 'all' to the set to indicate copying for everyone
      await message.reply('Now copying messages from all users.');
      return;
    }

    if (args[1]) {
      const targetUser = getUserIDFromMention(args[1]) || args[1]; // Either mention or user ID

      if (targetUser) {
        copiedUsers.add(targetUser); // Add the user to the copiedUsers set
        await message.reply(`Now copying messages from <@${targetUser}> (ID: ${targetUser}).`);
      } else {
        await message.reply('Please mention a user or provide a valid user ID.');
      }
    } else {
      await message.reply('Please mention a user or provide a valid user ID.');
    }
    return; // Return early to avoid further processing of messages
  }

  // Handle *uncopy all to stop copying messages from everyone
  if (message.content.startsWith('*uncopy all')) {
    copyAllEnabled = false;
    copiedUsers.delete('all');
    await message.reply('No longer copying messages from all users.');
    return;
  }

  // Check if the message is a reply and if the user is in the copiedUsers set (or if copyAllEnabled is true)
  if (copyAllEnabled || copiedUsers.has(message.author.id) || copiedUsers.has('all')) {
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
