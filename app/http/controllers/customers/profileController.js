const Order = require("../../../models/Order");
const moment = require("moment");

function profileController() {
    return {
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { "createdAt": -1 } });
            res.render("myProfile", {
                title: "My Profile",
                style: "myProfile",
                user: req.user,
                orders: orders,
                moment: moment
            });
        }
    }
}

module.exports = profileController;