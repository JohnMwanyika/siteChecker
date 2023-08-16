const { validationResult } = require('express-validator');

// This function is responsible for imiddiately returning all errors that occur related to user inputs 
// before even the request is handled
module.exports = {
    validate: (req, res, next) => {
        console.log('validating user')
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error', data: errors
            });
        }
        next();
    }
}