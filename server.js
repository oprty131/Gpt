require('dotenv').config();
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = 3000;

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

app.use(express.json());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userMessage }]
        });
        const botReply = response.data.choices[0].message.content;
        res.json({ reply: botReply });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ reply: "Sorry, I'm having trouble responding right now." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
