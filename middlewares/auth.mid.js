const checkSession = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/signin?error=no_session');
    }
    req.user = req.session.user;
    res.locals.user = req.user;
    next();
}

module.exports = { checkSession };