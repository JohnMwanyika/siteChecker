const {
    checkWebsiteStatus
} = require('../utils/intervalCheck')
// import Spin from 'spin.js';

module.exports = {
    home: async (req, res) => {
        res.redirect('/signin');
        // res.render('home', {
        //     title: 'Site Monitor'
        // })
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
        const error =
            req.query.error == "user_exists" ? { info: "A user with similar email exists, proceed to log into your account or try another email", type: "danger" } :
                req.query.error == "uknown_error" ? { info: "Oops! an Unknown error occured while creating your account, plaese try again " }
                    : ""
        res.render('authentication/signUp', { title: 'Sign Up', error });
    },
    signInForm: (req, res) => {
        const success = req.query.success == 'user_created' ? { type: 'success', info: 'Your account has been created, login to create your session' } : "";
        // display query errors
        const error =
            req.query.error == "no_user" ? { info: "Credentials entered do not match any record, please try again", type: "danger" } :
                req.query.error == "invalid_credentials" ? { info: "Your password is incorrect", type: 'danger' } :
                    req.query.error == "no_session" ? { info: "Your session is required for this operation to continue", type: "warning" } :
                        req.query.error == "inactive" ? { info: "Your account is inactive, contact admin for more information on how to unlock your account.", type: "warning" }
                            : ""
        res.render('authentication/signIn', { title: 'Sign In', error, success });
    }
}