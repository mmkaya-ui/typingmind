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
                plan: 'lifetime',
                features: ['all'],
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

    // Default: return success
    res.status(200).json({ success: true });
}
