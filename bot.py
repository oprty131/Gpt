import discord
from discord.ext import commands
import random
import requests
import asyncio
import os

# For loading from a .env file (optional)
from dotenv import load_dotenv
load_dotenv()  # This will load the environment variables from a .env file if you use one

# Get the bot token from environment variable
TOKEN = os.getenv('TOKEN')

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Fun Commands
@bot.command()
async def meme(ctx):
    response = requests.get("https://meme-api.herokuapp.com/gimme")
    data = response.json()
    await ctx.send(data['url'])

@bot.command()
async def joke(ctx):
    response = requests.get("https://official-joke-api.appspot.com/random_joke")
    data = response.json()
    await ctx.send(f"{data['setup']} - {data['punchline']}")

@bot.command()
async def quote(ctx):
    response = requests.get("https://api.quotable.io/random")
    data = response.json()
    await ctx.send(f"\"{data['content']}\" - {data['author']}")

@bot.command()
async def ball(ctx, *, question: str):
    responses = [
        "Yes", "No", "Maybe", "Ask again later", "Definitely", "Absolutely not"
    ]
    await ctx.send(f"Question: {question}\nAnswer: {random.choice(responses)}")

# Utility Commands
@bot.command()
async def userinfo(ctx, member: discord.Member = None):
    member = member or ctx.author
    await ctx.send(f"Username: {member.name}\nJoined at: {member.joined_at}\nRoles: {', '.join([role.name for role in member.roles])}")

@bot.command()
async def serverinfo(ctx):
    server = ctx.guild
    await ctx.send(f"Server name: {server.name}\nMember count: {server.member_count}\nRegion: {server.region}")

@bot.command()
async def avatar(ctx, member: discord.Member = None):
    member = member or ctx.author
    await ctx.send(member.avatar_url)

@bot.command()
async def ping(ctx):
    await ctx.send(f"Pong! Latency: {round(bot.latency * 1000)}ms")

@bot.command()
async def clear(ctx, amount: int):
    await ctx.channel.purge(limit=amount)
    await ctx.send(f"Cleared {amount} messages.", delete_after=3)

# Moderation Commands
@bot.command()
@commands.has_permissions(kick_members=True)
async def kick(ctx, member: discord.Member, *, reason: str = "No reason provided"):
    await member.kick(reason=reason)
    await ctx.send(f"Kicked {member.name} for {reason}")

@bot.command()
@commands.has_permissions(ban_members=True)
async def ban(ctx, member: discord.Member, *, reason: str = "No reason provided"):
    await member.ban(reason=reason)
    await ctx.send(f"Banned {member.name} for {reason}")

@bot.command()
@commands.has_permissions(manage_roles=True)
async def mute(ctx, member: discord.Member, time: int, *, reason: str = "No reason provided"):
    muted_role = discord.utils.get(ctx.guild.roles, name="Muted")
    if not muted_role:
        muted_role = await ctx.guild.create_role(name="Muted", permissions=discord.Permissions(send_messages=False))
        for channel in ctx.guild.text_channels:
            await channel.set_permissions(muted_role, send_messages=False)
    await member.add_roles(muted_role)
    await ctx.send(f"Muted {member.name} for {time} minutes")
    await asyncio.sleep(time * 60)
    await member.remove_roles(muted_role)
    await ctx.send(f"Unmuted {member.name}")

@bot.command()
@commands.has_permissions(manage_roles=True)
async def unmute(ctx, member: discord.Member):
    muted_role = discord.utils.get(ctx.guild.roles, name="Muted")
    if muted_role:
        await member.remove_roles(muted_role)
        await ctx.send(f"Unmuted {member.name}")

@bot.command()
async def warn(ctx, member: discord.Member, *, reason: str = "No reason provided"):
    await ctx.send(f"Warned {member.name} for: {reason}")

# Music Commands (stub, needs an actual music module like `discord.py[voice]`)
@bot.command()
async def play(ctx, url: str):
    await ctx.send(f"Playing {url} (This is a placeholder for actual music functionality)")

@bot.command()
async def pause(ctx):
    await ctx.send("Music paused (Placeholder)")

@bot.command()
async def skip(ctx):
    await ctx.send("Skipped the song (Placeholder)")

@bot.command()
async def stop(ctx):
    await ctx.send("Stopped the music (Placeholder)")

# Game Commands
@bot.command()
async def guess(ctx, number: int):
    secret_number = random.randint(1, 10)
    if number == secret_number:
        await ctx.send(f"Correct! The number was {secret_number}")
    else:
        await ctx.send(f"Wrong! The number was {secret_number}")

@bot.command()
async def rps(ctx, choice: str):
    options = ["rock", "paper", "scissors"]
    bot_choice = random.choice(options)
    if choice not in options:
        await ctx.send("Invalid choice! Choose rock, paper, or scissors.")
        return
    if choice == bot_choice:
        result = "It's a tie!"
    elif (choice == "rock" and bot_choice == "scissors") or (choice == "paper" and bot_choice == "rock") or (choice == "scissors" and bot_choice == "paper"):
        result = "You win!"
    else:
        result = "You lose!"
    await ctx.send(f"Bot chose {bot_choice}. {result}")

# Custom Commands
@bot.command()
async def remindme(ctx, time: int, *, message: str):
    await ctx.send(f"Reminder set! I'll remind you in {time} seconds.")
    await asyncio.sleep(time)
    await ctx.send(f"Reminder: {message}")

@bot.command()
async def weather(ctx, *, city: str):
    api_key = "YOUR_API_KEY"
    response = requests.get(f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}")
    data = response.json()
    if data.get("cod") != 200:
        await ctx.send("City not found.")
    else:
        await ctx.send(f"Weather in {city}: {data['weather'][0]['description'].capitalize()} with temperature {data['main']['temp'] - 273.15:.2f}°C")

# Server Customization
@bot.command()
async def setwelcome(ctx, channel: discord.TextChannel, *, message: str):
    # Example of setting up a welcome message (you could save it to a database/file)
    await ctx.send(f"Welcome message for {channel.name} set: {message}")

@bot.command()
async def nickname(ctx, member: discord.Member, nickname: str):
    await member.edit(nick=nickname)
    await ctx.send(f"Changed nickname for {member.name} to {nickname}")

bot.run(TOKEN)
