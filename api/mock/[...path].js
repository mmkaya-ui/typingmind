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
        return res.status(200).json([
            {
                id: 'web-search',
                title: 'Web Search',
                description: 'Search the web using Google',
                iconURL: 'https://typingmind.com/assets/plugins/web-search.png',
                manifestUrl: 'https://raw.githubusercontent.com/TypingMind/typing-mind-plugins/main/web-search/manifest.json',
                uuid: 'web-search-uuid',
                version: 1
            },
            {
                id: 'dsk-plugin',
                title: 'DeepSeek Plugin',
                description: 'DeepSeek integration',
                iconURL: 'https://typingmind.com/assets/plugins/deepseek.png',
                manifestUrl: 'https://raw.githubusercontent.com/someuser/deepseek-plugin/main/manifest.json', // Placeholder
                uuid: 'dsk-uuid',
                version: 1
            }
        ]);
    }

    // Default: return success
    res.status(200).json({ success: true });
}
