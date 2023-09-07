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

// const generateCsrfToken = (req, res, next) => {
//     // if (req.method === 'POST') {
//     //     return next();
//     // }
//     const csrfToken = crypto.randomBytes(16).toString('hex');
//     req.session.csrfToken = csrfToken;
//     res.locals.csrfToken = csrfToken;
//     next();
// }

const generateCsrfToken = (req, res, next) => {
    // Initialize sessions if not already done (ensure you've set up express-session middleware)
    if (!req.session) {
        throw new Error('Session middleware not properly initialized');
    }

    // Check if the request method is not 'POST'
    if (req.method !== 'POST') {
        const csrfToken = crypto.randomBytes(16).toString('hex');
        req.session.csrfToken = csrfToken;
        res.locals.csrfToken = csrfToken;
    }

    next();
}

const validateCsrfToken = (req, res, next) => {
    if (req.method === 'POST' && req.session.csrfToken != req.body._csrf) {
        return res.json({ status: 'warning', data: `CSRF token mismatch ${req.session.csrfToken} and ` + req.body._csrf });
    }
    next();
}


module.exports = { checkSession, generateCsrfToken, validateCsrfToken };