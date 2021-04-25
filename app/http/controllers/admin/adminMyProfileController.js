const User = require("../../../models/User");
const _ = require("lodash");

function adminDishController() {
    return {
        index(req, res) {
            res.render("admin/myProfile", {
                title: "Add dish",
                style: "admin/myProfile"
            });
        },

        editProfile(req, res) {
            const { name, email, gender, phoneNumber, address } = req.body;
            if (_.capitalize(gender) == "Male" || _.capitalize(gender) == "Female" || _.capitalize(gender) == "Other") {
                // Do nothing
            } else {
                req.flash("error", "Only valid values for gender is Male, Female or Other!");
                return res.redirect("/admin/myProfile");
            }
            User.findByIdAndUpdate(req.user._id, {
                name: _.capitalize(name),
                email: _.capitalize(email),
                gender: _.capitalize(gender),
                phoneNumber: phoneNumber,
                address: address
            }, (err, user) => {
                res.redirect("/admin/myProfile");
            });
        }
    }
}

module.exports = adminDishController;