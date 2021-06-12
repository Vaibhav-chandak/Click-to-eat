const User = require("../../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var ejs = require("ejs");
const path = require("path");

// Setting nodemailer to send mails
const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "ClickNEat1@outlook.com",
        pass: "Vaibhav@1"
    }
});
const JWT_SECRET = process.env.JWT_SECRET;

function authController() {
    return {
        // Render Login Page
        login(req, res) {
            res.render("customer/login", {
                title: "Login Page",
                style: "customer/login",
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
            });
        },

        // Let new user register
        async postRegister(req, res) {
            const { name, email, password, phone, gender, address } = req.body;
            // Check if email or phone number already exists
            await User.exists({ $or: [{ email: email }, { phoneNumber: phone }] }, (err, result) => {
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
                    if (err) {
                        req.flash("error", "Something went wrong!")
                        return res.redirect("/register");
                    }
                    return res.redirect("/home");
                });
            }).catch(err => {
                req.flash("error", "Something went wrong!");
                return res.redirect("/register");
            });
        },

        forgetPassword(req, res) {
            res.render("forgetPassword", {
                title: "Forget Password",
                style: "forgetPassword"
            });
        },

        postForgetPassword(req, res) {
            // Check if the email field is not empty
            if (!req.body.email.trim()) {
                req.flash("error", "Please enter valid email address");
                return res.redirect("/forgetPassword");
            }

            // Make sure user exists in database
            User.findOne({ email: _.capitalize(req.body.email) }, (err, user) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong!");
                    return res.redirect("/forgetPassword");
                }
                if (!user) {
                    req.flash("error", "No user with this email found!");
                    return res.redirect("/forgetPassword");
                } else {
                    // User exists, so create a one time link which is valid for 15 minutes
                    const secret = JWT_SECRET + user.password;
                    const payload = {
                        email: user.email,
                        id: user._id
                    }
                    const token = jwt.sign(payload, secret, { expiresIn: "30m" });
                    const link = `https://click-to-eat.herokuapp.com/resetPassword/${user._id}/${token}`;

                    // Send email
                    ejs.renderFile(path.join(__dirname, "..", "..", "..", "/views/email-data.ejs"), { name: user.name, link: link }, function (err, data) {
                        if (err) {
                            console.log(err);
                            req.flash("error", "Something went wrong!");
                            return res.redirect("/forgetPassword");
                        } else {
                            const options = {
                                from: "ClickNEat1@outlook.com",
                                to: user.email,
                                subject: "Password Reset",
                                html: data
                            }

                            transporter.sendMail(options, (err, info) => {
                                if (err) {
                                    console.log(err);
                                    req.flash("error", "Something went wrong!");
                                    return res.redirect("/forgetPassword");
                                }
                                req.flash("success", "A password reset link has been sent to your email which is valid for 30 minutes. Please check your junk/spam folder along with inbox.");
                                return res.redirect("/forgetPassword");
                            });
                        }
                    });
                }
            });
        },

        resetPassword(req, res) {
            const { id, token } = req.params;

            // Check if the user exists in database
            User.findById(id, (err, user) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong, Try again!");
                    return res.redirect("/login");
                }
                if (!user) {
                    req.flash("error", "Invalid User!");
                    return res.redirect("/login");
                } else {
                    // if we have valid user id
                    const secret = JWT_SECRET + user.password;
                    try {
                        const payload = jwt.verify(token, secret);
                        res.render("resetPassword", {
                            title: "Reset Password",
                            style: "resetPassword",
                            name: user.name
                        });
                    } catch (error) {
                        req.flash("error", "Either the time limit is expired or you already changed your password!");
                        res.redirect("/login");
                    }
                }
            });
        },

        postResetPassword(req, res) {
            const { id, token } = req.params;
            const { password, confirm_password } = req.body;

            // Check if both password are entered
            if (!password.trim() || !confirm_password.trim()) {
                req.flash("error", "Both fields are mandatory!");
                return res.redirect(`/resetPassword/${id}/${token}`);
            }

            // Check if both password are same
            if (password !== confirm_password) {
                req.flash("error", "Both password should match!");
                return res.redirect(`/resetPassword/${id}/${token}`);
            }

            // Check if the user exists in database
            User.findById(id, async (err, user) => {
                if (err) {
                    req.flash("error", "Something went wrong, Try again!");
                    return res.redirect("/login");
                }
                if (!user) {
                    req.flash("error", "Invalid User!");
                    return res.redirect("/login");
                }
                const secret = JWT_SECRET + user.password;
                try {
                    const payload = jwt.verify(token, secret);
                    const hashedPassword = await bcrypt.hash(password, 10);
                    User.findByIdAndUpdate(id, { $set: { password: hashedPassword } }, (err, user) => {
                        if (err) {
                            req.flash("error", "Something went wrong, Try again!");
                            return res.redirect("/login");
                        }
                        if (user) {
                            req.flash("success", "Password changed successfully!");
                            return res.redirect("/login");
                        }
                    });
                } catch (error) {
                    console.log(error);
                    req.flash("error", "Something went wrong!");
                    return res.redirect("/login");
                }
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