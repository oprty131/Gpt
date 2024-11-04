// public/script.js
async function obfuscate() {
    const luaCode = document.getElementById('luaCode').value;

    const response = await fetch('/obfuscate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ luaCode })
    });

    const data = await response.json();
    document.getElementById('obfuscatedCode').value = data.obfuscatedCode;
}
