const Order = require("../../../models/Order");
const User = require("../../../models/User");
const moment = require("moment");
const _ = require("lodash");

function profileController() {
    return {
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { "createdAt": -1 } });
            res.render("customer/myProfile", {
                title: "My Profile",
                style: "customer/myProfile",
                user: req.user,
                orders: orders,
                moment: moment
            });
        },

        editProfile(req, res) {
            const { name, email, gender, phoneNumber, address } = req.body;
            if (!name.trim() || !email.trim() || !phoneNumber.trim() || !gender.trim() || !address.trim()) {
                req.flash("error", "All fields are mandatory");
                return res.redirect("/myProfile");
            }
            if (_.capitalize(gender) == "Male" || _.capitalize(gender) == "Female" || _.capitalize(gender) == "Other") {
                // Do nothing
            } else {
                req.flash("error", "Only valid values for gender is Male, Female or Other!");
                return res.redirect("/myProfile");
            }

            User.findByIdAndUpdate(req.user._id, {
                name: _.capitalize(name),
                email: _.capitalize(email),
                gender: _.capitalize(gender),
                phoneNumber: phoneNumber,
                address: address
            }, (err, user) => {
                req.flash("success", "Profile updated successfully!");
                res.redirect("/myProfile");
            });
        }
    }

}

module.exports = profileController;