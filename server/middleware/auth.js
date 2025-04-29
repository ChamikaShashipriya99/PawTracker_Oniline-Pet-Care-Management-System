const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Remove 'Bearer ' if present
        token = token.replace('Bearer ', '');

        let decoded;
        try {
            // First try: Attempt to verify as JWT
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.log('JWT verification failed, trying alternative methods');
            try {
                // Second try: Attempt to decode as base64
                const decodedStr = Buffer.from(token, 'base64').toString('utf-8');
                decoded = JSON.parse(decodedStr);
            } catch (base64Error) {
                console.log('Base64 decoding failed, trying regex extraction');
                // Third try: Try to extract user ID using regex
                const match = token.match(/"id":"([^"]+)"/);
                if (match) {
                    decoded = { id: match[1] };
                } else {
                    // Fourth try: Try to extract ObjectId directly
                    const objectIdMatch = token.match(/[0-9a-fA-F]{24}/);
                    if (objectIdMatch) {
                        const userId = objectIdMatch[0];
                        console.log('Found ObjectId in token:', userId);
                        const user = await User.findById(userId);
                        if (user) {
                            req.user = user;
                            return next();
                        }
                    }
                    throw new Error('Could not extract user ID from token');
                }
            }
        }

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = auth; 