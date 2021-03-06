const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");
const _ = require("lodash");

function init(passport) {
    passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        // Login logic
        // Check if email exists
        const user = await User.findOne({ email: _.capitalize(email) });
        if (!user) {
            return done(null, false, { message: "No user with this email found!" });
        }
        bcrypt.compare(password, user.password).then(match => {
            if (match) {
                return done(null, user, { message: "Logged in successfully!" });
            }
            return done(null, false, { message: "Username or password incorrect!" });
        }).catch(err => {
            return done(null, false, { message: "Something went wrong!" });
        })
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}

module.exports = init;