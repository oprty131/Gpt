import discord
from flask import Flask, jsonify
import os

app = Flask(__name__)

# Bot setup
intents = discord.Intents.default()
intents.guilds = True
intents.guild_messages = True
intents.messages = True

bot = discord.Client(intents=intents)

# Announcements storage
announcements = []

@bot.event
async def on_ready():
    print(f'Bot logged in as {bot.user}')
    guild = discord.utils.get(bot.guilds)  # Replace with your server ID
    channel = discord.utils.get(guild.channels, name="announcements")  # Replace with your channel name
    async for message in channel.history(limit=10):  # Fetch last 10 messages
        announcements.append({"author": message.author.name, "content": message.content})
    print("Fetched announcements")

@app.route('/announcements', methods=['GET'])
def get_announcements():
    return jsonify(announcements)

# Run the bot
def run_bot():
    bot.run("YOUR_DISCORD_BOT_TOKEN")  # Replace with your token

# Run Flask app
def run_app():
    app.run(host="0.0.0.0", port=5000)

if __name__ == "__main__":
    from threading import Thread
    Thread(target=run_bot).start()
    Thread(target=run_app).start()
