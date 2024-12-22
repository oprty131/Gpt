import discord
from discord.ext import commands
from flask import Flask
import threading
import os  # For accessing environment variables

# Set up Flask app
app = Flask("")

@app.route('/')
def home():
    return "Bot is running!"

def run_flask():
    app.run(host="0.0.0.0", port=8080)

# Set up the Discord bot
bot = commands.Bot(command_prefix="!")

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def ping(ctx):
    await ctx.send("Pong!")

def run_bot():
    # Fetch the token from the environment variable
    bot_token = os.getenv("TOKEN")
    if bot_token is None:
        print("No token found! Please set the TOKEN environment variable.")
        return
    bot.run(bot_token)

# Create separate threads for Flask and the bot
if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask)
    bot_thread = threading.Thread(target=run_bot)

    flask_thread.start()
    bot_thread.start()
