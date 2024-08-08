const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            throw new Error('Authorization header is missing');
        }

        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            throw new Error('Token is missing');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            throw new Error('Token verification failed');
        }

        const userId = decodedToken.userId;
        if (!userId) {
            throw new Error('User ID not found in token');
        }

        req.auth = {
            userId: userId
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: error.message || 'Unauthorized' });
    }
};
