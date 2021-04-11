const User = require("../../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const _ = require("lodash");

function authController() {
    return {
        // Render Login Page
        login(req, res) {
            res.render("customer/login", {
                title: "Login Page",
                style: "customer/login",
                errors: []
            });
        },

        // To handle user login 
        postLogin(req, res, next) {
            const { email, password } = req.body;
            if (!email.trim() || !password.trim()) {
                req.flash("error", "All fields are mandatory");
                req.flash('email', email);
                return res.redirect("/login");
            }
            passport.authenticate("local", (err, user, info) => {
                if (err) {
                    req.flash("error", info.message);
                    return next(err);
                }

                if (!user) {
                    req.flash("error", info.message);
                    return res.redirect("/login");
                }
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash("error", info.flash);
                        return next(err);
                    }
                    return res.redirect("/home");
                })
            })(req, res, next);
        },

        // Render register page
        register(req, res) {
            res.render("customer/register", {
                title: "Register Page",
                style: "customer/login",
                errors: [],
                name: "",
                email: "",
                phoneNumber: "",
                gender: 'None',
                address: ""
            });
        },

        // Let new user register
        async postRegister(req, res) {
            const { name, email, password, phone, gender, address } = req.body;
            // Check for empty requests
            if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !gender.trim() || !address.trim()) {
                req.flash("error", "All fields are mandatory");
                req.flash('name', name);
                req.flash('email', email);
                req.flash('phone', phone);
                req.flash('gender', gender);
                req.flash('address', address);
                return res.redirect("/register");
            }

            // Check if email or phone number already exists
            User.exists({ $or: [{ email: email }, { phoneNumber: phone }] }, (err, result) => {
                if (result) {
                    req.flash("error", "Email or phone number already in use!");
                    req.flash('name', name);
                    req.flash('email', email);
                    req.flash('phone', phone);
                    req.flash('gender', gender);
                    req.flash('address', address);
                    return res.redirect("/register");
                }
            });

            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // If everything is fine create user
            const user = new User({
                name: _.capitalize(name),
                email: _.capitalize(email),
                password: hashedPassword,
                phoneNumber: phone,
                gender: _.capitalize(gender),
                address
            });
            user.save().then(() => {
                req.login(user, (err) => {
                    if (err) { return next(err); }
                    return res.redirect("/home");
                });
            }).catch(err => {
                req.flash("error", "Something went wrong!");
                return res.redirect("/register");
            });
        },

        logout(req, res) {
            // For logout
            req.logout();
            res.redirect('/login');
        }
    }
}

module.exports = authController;