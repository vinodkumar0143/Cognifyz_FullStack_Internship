const { check, validationResult } = require('express-validator');

// Helper middleware to verify express-validator outcomes
const checkValidationResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstErrorMsg = errors.array()[0].msg;
        return res.status(400).json({
            success: false,
            message: firstErrorMsg,
            errors: errors.array()
        });
    }
    next();
};

const validateRegister = [
    check('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    checkValidationResults
];

const validateLogin = [
    check('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
    check('password')
        .notEmpty().withMessage('Password is required'),
    checkValidationResults
];

const validateSearch = [
    check('city')
        .trim()
        .notEmpty().withMessage('City query parameter is required'),
    checkValidationResults
];

module.exports = {
    validateRegister,
    validateLogin,
    validateSearch
};
