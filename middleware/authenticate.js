const User = require('../model/user');
const jwt = require('jsonwebtoken');

exports.authentication = async (req, res, next) => {
    const token = req.header('Authorization');

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const userId = decodedToken.userId;

        let user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        next();
    } catch (err) {
        console.log('auth', err);
        res.status(401).json({ message: 'Authentication failed' });
    }
};
