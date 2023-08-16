const { body, param } = require('express-validator');


module.exports = {
    create: () => [
        body('firstName')
            .notEmpty()
            .trim()
            .isString()
            .isLength({ max: 50 }),

        body('lastName')
            .notEmpty()
            .trim()
            .isString()
            .isLength({ max: 50 }),

        body('email')
            .notEmpty()
            .trim()
            .isEmail()
            .isString(),

        body('phone')
            .notEmpty()
            .trim()
    ],
    findById: () => [
        param('id')
            // .notEmpty()
            .isInt()
    ],
    updateById: () => [
        param('id')
            .notEmpty()
            .isInt(),

        body('name')
            .optional()
            .notEmpty()
            .isString()
            .isLength({ max: 128 }),

        body('age')
            .optional()
            .notEmpty()
            .isInt(),

        body('gender')
            .optional()
            .notEmpty()
            .isIn(['female', 'male']),

        body('address')
            .optional()
            .notEmpty()
            .isString()
            .isLength({ max: 255 })
    ],
    deleteById: () => [
        param('id')
            .notEmpty()
            .isInt()
    ]
};