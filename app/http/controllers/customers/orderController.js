const Order = require("../../../models/Order");
const moment = require("moment");

function orderController() {
    return {
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { "createdAt": -1 } });
            res.render("orders", {
                title: "All orders",
                style: "orders",
                orders: orders,
                moment: moment
            });
        },

        store(req, res) {
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phoneNumber: req.user.phoneNumber,
                address: req.user.address,
                totalPrice: req.session.cart.totalPrice,
                totalQty: req.session.cart.totalQty
            })
            order.save().then(result => {
                delete req.session.cart;
                req.flash("success", "Order placed successfully!");
                return res.redirect("/home");
            }).catch(err => {
                console.log(err);
                req.flash("error", "Something went wrong!");
                return res.redirect("/cart");
            });
        }
    }
}

module.exports = orderController;