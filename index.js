import discord
import openai
import os

# Fetch environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TOKEN = os.getenv("TOKEN")

# Initialize OpenAI
openai.api_key = OPENAI_API_KEY

# Initialize Discord client
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Bot is ready. Logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    if message.content.startswith("!chat"):
        prompt = message.content[len("!chat"):].strip()
        
        if prompt:
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}]
                )
                ai_response = response['choices'][0]['message']['content']
                await message.channel.send(ai_response)
            except Exception as e:
                await message.channel.send(f"Error: {e}")
        else:
            await message.channel.send("Please provide a prompt after the command.")
