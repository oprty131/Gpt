// server/obfuscate.js

function obfuscateLua(luaCode) {
    // Basic obfuscation steps
    let obfuscatedCode = luaCode;

    // Example: Simple variable name obfuscation
    obfuscatedCode = obfuscatedCode.replace(/\bvar([0-9]+)\b/g, (match, p1) => {
        return `v${p1}_${Math.floor(Math.random() * 10000)}`;
    });

    // Example: Encode strings
    obfuscatedCode = obfuscatedCode.replace(/"([^"]*)"/g, (match, p1) => {
        return `"${Buffer.from(p1).toString('base64')}"`;
    });

    // Example: Add random comments for confusion
    obfuscatedCode = obfuscatedCode.replace(/;/g, `; -- Obfuscated by lua-obfuscator`);

    return obfuscatedCode;
}

module.exports = obfuscateLua;
