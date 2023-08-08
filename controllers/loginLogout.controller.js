const {
    User,
    UserStatus
} = require('../models/index.js');

const bcrypt = require('bcrypt');
module.exports = {
    login: async (req, res) => {
        const {
            email,
            password
        } = req.body;
        const user = await User.findOne({
            include: [
                {
                    model: UserStatus,
                    required: true
                }],
            where: {
                email: email,
            }
        });
        if (!user) {
            return res.redirect('/signin?error=no_user');

        }
        if (user.UserStatus.status != 'Active') {
            return res.redirect('/signin?error=inactive');
        }
        // Compare password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        // if passwords do not match redirect user to the login page with an alert of invalid credentials
        if (!isMatch) {
            return res.redirect('/signin?error=invalid_credentials');
        }
        // Generate user session
        req.session.regenerate((error) => {
            if (error) next(error);
            req.session.user = user;
            req.session.save((error) => {
                if (error) return next(error);
                res.redirect('/dashboard');
            })
        })
    },
    logout: async (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error clearing current user session:', err);
            } else {
                console.log('Session cleared successfully');
                res.redirect('/signin'); // Redirect to login page or any other appropriate route
            }
        });
    }
}