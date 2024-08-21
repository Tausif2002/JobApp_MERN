module.exports = function (req, res, next) {
    console.log(req.user)
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};