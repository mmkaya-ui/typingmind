const fs = require('fs');
const path = require('path');

const backupFile = '../src/_next/static/chunks/pages/_app-16e42bf212981984.js.bak';
const pluginsFile = '../src/api/plugins.json';

try {
    // 1. Read backup file
    console.log('Reading backup file...');
    const appContent = fs.readFileSync(path.join(__dirname, backupFile), 'utf8');

    // 2. Find the target module and extract string
    const startMarker = '79983:e=>{"use strict";e.exports=JSON.parse(\'';
    const startIndex = appContent.indexOf(startMarker);

    if (startIndex === -1) {
        throw new Error('Could not find start marker in backup file.');
    }

    const contentStart = startIndex + startMarker.length;
    let contentEnd = -1;
    let i = contentStart;

    // Find the end of the string
    while (i < appContent.length) {
        if (appContent[i] === "'" && appContent[i - 1] !== '\\') {
            if (appContent.substring(i + 1, i + 3) === ')}') {
                contentEnd = i;
                break;
            }
        }
        i++;
    }

    if (contentEnd === -1) {
        throw new Error('Could not find end of JSON string.');
    }

    console.log('Extracted plugin string. Parsing...');
    const jsonString = appContent.substring(contentStart, contentEnd);
    // Unescape the string: just like the browser would do. 
    // It's a JS string literal. mainly \' -> ' and \\ -> \
    // But verify if JSON.parse needs more. 
    // Actually, JSON.parse expects a JSON string.
    // The content inside '...' is escaped JSON.
    // So we need to unescape the JS string first.
    // Simplest way: eval? No, unsafe. 
    // JSON.parse(`"${jsonString}"`)? No, it's single quoted.
    // Let's manually replace the known escapes.
    // The string was likely created by JSON.stringify then escaped.

    // Replace \' with '
    // Replace \\ with \
    let unescaped = jsonString
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");

    // Now it should be valid JSON
    const originalPlugins = JSON.parse(unescaped);
    console.log(`Found ${originalPlugins.length} plugins in backup.`);

    // 3. Read current plugins
    console.log('Reading current plugins.json...');
    const currentPluginsRaw = fs.readFileSync(path.join(__dirname, pluginsFile), 'utf8');
    const currentPlugins = JSON.parse(currentPluginsRaw);

    // 4. Merge
    let addedCount = 0;
    const currentIds = new Set(currentPlugins.map(p => p.id));

    for (const p of originalPlugins) {
        if (!currentIds.has(p.id)) {
            currentPlugins.push(p);
            currentIds.add(p.id);
            console.log(`Adding plugin: ${p.title || p.id}`);
            addedCount++;
        }
    }

    // 5. Write back
    if (addedCount > 0) {
        fs.writeFileSync(path.join(__dirname, pluginsFile), JSON.stringify(currentPlugins, null, 4), 'utf8');
        console.log(`Successfully added ${addedCount} plugins to plugins.json.`);
    } else {
        console.log('No new plugins to add.');
    }

} catch (err) {
    console.error('Error:', err);
}
