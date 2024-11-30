import discord
import openai
import os

# Set your OpenAI API key
openai.api_key = 'sk-proj-hi7CtmKyloUQyoC73ry2T3BlbkFJjaGgx5Y6uUG0ScgdPT4P'

# Create a Discord client
client = discord.Client()

# The command prefix you want to use
COMMAND_PREFIX = "!"

# Function to call GPT-3.5
def ask_gpt(question):
    try:
        # Use GPT-3.5 model for better performance
        response = openai.Completion.create(
            model="gpt-3.5-turbo",  # Switching to GPT-3.5
            prompt=question,
            max_tokens=150,  # Limit token usage to keep responses concise
            temperature=0.7,  # Control creativity/variability
            top_p=1.0,  # Use nucleus sampling
            frequency_penalty=0.0,
            presence_penalty=0.0
        )
        return response.choices[0].text.strip()
    except Exception as e:
        return f"An error occurred: {str(e)}"

# Event when the bot is ready
@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

# Event when a message is received
@client.event
async def on_message(message):
    if message.author == client.user:
        return

    # If the message starts with !ask or !question
    if message.content.startswith(('!ask', '!question')):
        question = message.content[len(COMMAND_PREFIX):].strip()

        # Call the GPT function and get the answer
        answer = ask_gpt(question)

        # Send the answer back to the Discord channel
        await message.channel.send(answer)

# Run the bot with your token
client.run('MTI3OTE0NTc0NDg3NTY1MTE2Mw.G6woVV.bXTDTGTZFKu-Mu1N1GTHcjtUCOODBm946iIXno')
