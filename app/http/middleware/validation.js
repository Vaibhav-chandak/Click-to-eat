const { check, validationResult } = require("express-validator");

exports.signup = [
    check("name", "Name should have at least 2 character")
        .trim()
        .isLength({ min: 2 }),
    check("email", "Please enter a valid email")
        .isEmail(),
    check("password", "Password must have uppercase, lowercase, number, and special character")
        .isStrongPassword(),
    check("phone", "Phone number is invalid")
        .isMobilePhone("en-IN"),
    check("gender", "Please select a gender")
        .notEmpty(),
    check("address", "Address should have at least 10 characters")
        .trim()
        .isLength({ min: 10 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // return res.status(422).json({ errors: errors.array() });
            const { name, email, phone, gender, address } = req.body;
            req.flash('name', name);
            req.flash('email', email);
            req.flash('phone', phone);
            req.flash('gender', gender);
            req.flash('address', address);
            req.flash("error", errors.array()[0].msg);
            return res.redirect("/register");
        } else {
            next();
        }
    }
]

exports.resetPassword = [
    check("password", "Password must have uppercase, lowercase, number, and special character")
        .isStrongPassword(),
    check("confirm_password", "Both password and confirm password should match")
        .custom(async (confirm_password, { req }) => {
            const password = req.body.password
            if (password !== confirm_password) {
                throw new Error('Both password and confirm password should match')
            }
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // return res.status(422).json({ errors: errors.array() });
            req.flash("error", errors.array()[0].msg);
            return res.redirect(req.get('referer'));
        } else {
            next();
        }
    }
]

exports.editProfile = [
    check("name", "Name should have at least 2 character")
        .trim()
        .isLength({ min: 2 }),
    check("email", "Please enter a valid email")
        .isEmail(),
    check("phoneNumber", "Phone number is invalid")
        .isMobilePhone("en-IN"),
    check("address", "Address should have at least 10 characters")
        .trim()
        .isLength({ min: 10 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // return res.status(422).json({ errors: errors.array() });
            req.flash("error", errors.array()[0].msg);
            return res.redirect(req.get('referer'));
        } else {
            next();
        }
    }
]