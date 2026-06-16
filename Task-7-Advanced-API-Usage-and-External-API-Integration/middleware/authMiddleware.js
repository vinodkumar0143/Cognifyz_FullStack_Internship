const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token
            token = req.headers.authorization.split(' ')[1];

            // Verify token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cognifyz_task7_super_secret_jwt_key_98765');

            // Fetch user and attach to req, excluding password
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists.' });
            }

            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed verification.' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no Bearer token provided in header.' });
    }
};

module.exports = { protect };
