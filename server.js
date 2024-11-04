// server/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const obfuscateLua = require('./obfuscate');
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Obfuscate endpoint
app.post('/obfuscate', (req, res) => {
    const luaCode = req.body.luaCode;
    if (!luaCode) return res.status(400).send('No Lua code provided');

    const obfuscatedCode = obfuscateLua(luaCode);
    res.json({ obfuscatedCode });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
