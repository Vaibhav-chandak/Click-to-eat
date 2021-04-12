function auth(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "Admin") {
        return next();
    }
    return res.redirect('/login')
}

module.exports = auth