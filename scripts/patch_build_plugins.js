const fs = require('fs');
const path = require('path');

const appFile = '../src/_next/static/chunks/pages/_app-16e42bf212981984.js';
const pluginsFile = '../src/api/plugins.json';

try {
    // 1. Read plugins
    const pluginsRaw = fs.readFileSync(pluginsFile, 'utf8');
    const plugins = JSON.parse(pluginsRaw);
    console.log(`Loaded ${plugins.length} plugins from json.`);

    // 2. Prepare replacement string
    // We need to match the format inside the file: e.exports=JSON.parse('STRING')
    // So we need to stringify, then escape for usage inside single-quoted string.
    const jsonString = JSON.stringify(plugins);

    // Escape backslashes first, then single quotes
    const escapedString = jsonString.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    // 3. Read app file
    let appContent = fs.readFileSync(appFile, 'utf8');

    // 4. Find the target module
    // The identifier we found
    const startMarker = '79983:e=>{"use strict";e.exports=JSON.parse(\'';
    const startIndex = appContent.indexOf(startMarker);

    if (startIndex === -1) {
        console.error('Could not find start marker in app file.');
        process.exit(1);
    }

    console.log(`Found start marker at index ${startIndex}`);

    // Find the end of the string. It ends with ')}
    // We start searching AFTER the startMarker
    // The content is: ...JSON.parse('<JSON_CONTENT>')}
    // So we look for '}
    // But be careful if existing content has '} inside strings.
    // However, since it is a JSON string literal, it ends with ' (quote) then )}

    // Let's find ')} starting from startIndex
    // But we need to ensure we don't match something inside.
    // The previous content was valid JSON, so it shouldn't have unescaped '

    const contentStart = startIndex + startMarker.length;
    let contentEnd = -1;

    // Simple parser to find the closing quote
    // Since it's a JS string literal, we just look for ' that is not escaped
    let i = contentStart;
    while (i < appContent.length) {
        if (appContent[i] === "'" && appContent[i - 1] !== '\\') {
            // Found potential end
            // Check if followed by )}
            if (appContent.substring(i + 1, i + 3) === ')}') {
                contentEnd = i;
                break;
            }
        }
        i++;
    }

    if (contentEnd === -1) {
        console.error('Could not find end of JSON string.');
        process.exit(1);
    }

    console.log(`Found end marker at index ${contentEnd}`);
    console.log(`Replacing ${contentEnd - contentStart} bytes...`);

    // 5. Replace
    const newContent = appContent.substring(0, contentStart) +
        escapedString +
        appContent.substring(contentEnd);

    // 6. Write back
    fs.writeFileSync(appFile, newContent, 'utf8');
    console.log('Successfully patched _app.js with new plugins list.');

} catch (err) {
    console.error('Error:', err);
}
