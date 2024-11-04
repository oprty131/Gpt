// server/app.js
const express = require('express');
const bodyParser = require('body-parser');
const obfuscateLua = require('./obfuscate'); // Obfuscation logic
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// Obfuscate endpoint
app.post('/obfuscate', (req, res) => {
    const luaCode = req.body.luaCode;
    if (!luaCode) return res.status(400).send('No Lua code provided');

    const obfuscatedCode = obfuscateLua(luaCode);
    res.json({ obfuscatedCode });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
