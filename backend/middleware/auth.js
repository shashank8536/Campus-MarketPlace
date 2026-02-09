const protect = (req, res, next) => {
    if (req.session && req.session.userId) {
        // Attach user object to request for routes to use
        req.user = {
            _id: req.session.userId,
            id: req.session.userId
        };
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, please login' });
    }
};

module.exports = { protect };
