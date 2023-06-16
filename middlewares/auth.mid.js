const checkSession = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/signin?error=no_session');
    }
    next();
}

module.exports = { checkSession };