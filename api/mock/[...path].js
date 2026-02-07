// Mock API to bypass TypingMind server validation
export default function handler(req, res) {
    const { path } = req.query;
    const fullPath = Array.isArray(path) ? path.join('/') : path;

    // Mock license validation - always return valid
    if (fullPath.includes('license') || fullPath.includes('validate')) {
        return res.status(200).json({
            valid: true,
            activated: true,
            licenseKey: 'bypass-license',
            payload: {
                email: 'user@local.dev',
                plan: 'premium_plus',
                type: 'lifetime',
                features: [
                    "all",
                    "pro",
                    "premium",
                    "enterprise",
                    "interactive_canvas",
                    "plugins",
                    "web_search",
                    "image_generation",
                    "system_prompt",
                    "cloud_sync"
                ],
                expiresAt: null
            }
        });
    }

    // Mock user/auth endpoints
    if (fullPath.includes('user') || fullPath.includes('auth')) {
        return res.status(200).json({
            user: {
                id: 'local-user',
                email: 'user@local.dev',
                plan: 'lifetime'
            },
            authenticated: true
        });
    }

    // Mock sync endpoints - return empty/success
    if (fullPath.includes('sync')) {
        return res.status(200).json({
            success: true,
            data: {}
        });
    }

    // Mock plugins endpoint
    if (fullPath.includes('plugins')) {
        try {
            const fs = require('fs');
            const path = require('path');
            // Assuming this file is at api/mock/[...path].js and src is at root
            // Need to resolve path correctly based on deployment structure
            // In local dev with http-server, this file executes.
            // Let's try to locate src/api/plugins.json relatively.

            // Go up two levels from api/mock to reach root, then into src/api
            // __dirname is usually the directory of the executing script
            const pluginsFilePath = path.join(process.cwd(), 'src', 'api', 'plugins.json');

            if (fs.existsSync(pluginsFilePath)) {
                const fileContent = fs.readFileSync(pluginsFilePath, 'utf8');
                const plugins = JSON.parse(fileContent);
                return res.status(200).json(plugins);
            } else {
                console.warn('Plugins file not found at:', pluginsFilePath);
                // Fallback to empty or minimal list if file missing
                return res.status(200).json([]);
            }
        } catch (error) {
            console.error('Error reading plugins.json:', error);
            return res.status(500).json({ error: 'Failed to load plugins' });
        }
    }

    // Default: return success
    res.status(200).json({ success: true });
}
