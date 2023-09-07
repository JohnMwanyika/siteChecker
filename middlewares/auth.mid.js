// require crypto
const crypto = require('crypto');

const checkSession = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/signin?error=no_session');
    }
    req.user = req.session.user;
    res.locals.user = req.user;
    next();
}

const generateCsrfToken = (req, res, next) => {
    const csrfToken = crypto.randomBytes(16).toString('hex');
    req.session.csrfToken = csrfToken;
    res.locals.csrfToken = csrfToken;
    next();
}

const validateCsrfToken = (req, res, next) => {
    if (req.method === 'POST' && req.session.csrfToken != req.body._csrf) {
        // return res.status(403).send('CSRF token mismatch');
        return res.json({ status: 'warning', data: 'CSRF token mismatch'+req.body._csrf });
    }
    next();
}


module.exports = { checkSession, generateCsrfToken, validateCsrfToken };