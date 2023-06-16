const {
    checkWebsiteStatus
} = require('../utils/intervalCheck')
// import Spin from 'spin.js';

module.exports = {
    home: async (req, res) => {
        res.render('home', {
            title: 'Site Monitor'
        })
    },
    search: (req, res) => {
        const {
            site
        } = req.body;

        checkWebsiteStatus(site)
            .then((isUp) => {
                if (isUp) {
                    console.log(isUp)
                    res.json({
                        status: 'success',
                        data: `Success ${site} is up and fuctioning properly`
                    })
                } else {
                    console.log(isUp)
                    res.json({
                        status: 'danger',
                        data: `Sorry ${site} can't be reached at the moment`
                    })
                }

            })
            .catch((error) => {
                console.log(error);
                res.json({
                    status: 'error',
                    data: 'Error checking website status'
                })
            })

    },
    signUpForm: (req, res) => {
        const errors =
            req.query.error == "user_exists" ? "A user with similar email exists, proceed to log into your account or try another email" : ""
        res.render('authentication/signUp', { title: 'Sign Up', errors });
    },
    signInForm: (req, res) => {
        const errors =
            req.query.error == "no_user" ? "The credentials entered do not match any record" :
                req.query.error == "invalid_credentials" ? "Your password is incorrect" :
                    req.query.error == "inactive" ? "Your account is inactive, contact admin for more information on how to unlock your account."
                        : ""
        res.render('authentication/signIn', { title: 'Sign In', errors });
    }
}