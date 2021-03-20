const User = require("../../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
    return {
        // Render Login Page
        login(req, res) {
            // If user is already logged in do not let user access login page
            if (req.isAuthenticated()) {
                return res.redirect("/home");
            }
            res.render("login", {
                title: "Login Page",
                style: "login",
                errors: []
            });
        },

        // To handle user login 
        postLogin(req, res, next) {
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
            // If user is already logged in do not let user access register page
            if (req.isAuthenticated()) {
                return res.redirect("/home");
            }
            res.render("register", {
                title: "Register Page",
                style: "login",
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
                name,
                email,
                password: hashedPassword,
                phoneNumber: phone,
                gender,
                address
            });
            user.save().then(() => {
                return res.redirect("/home");
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