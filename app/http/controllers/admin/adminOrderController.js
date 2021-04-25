const _ = require("lodash");
const Product = require("../../../models/Product");
const Order = require("../../../models/Order");
const moment = require("moment");

function adminOrderController() {
    return {
        index(req, res) {
            // Show all the orders other than completed or cancelled orders
            Order.find({ status: { $nin: ['Delivered', 'Cancelled'] } }, null, { sort: { 'createdAt': -1 } }).populate('customerId', '-password').exec((err, orders) => {
                return res.render("admin/orders", {
                    title: "Current orders",
                    style: "admin/orders",
                    orders: orders,
                    moment: moment
                });
            });
        },

        // Show all orders
        allOrders(req, res) {
            Order.find({}, null, { sort: { 'createdAt': -1 } }).populate('customerId', '-password').exec((err, orders) => {
                return res.render("admin/orders", {
                    title: "All orders",
                    style: "admin/orders",
                    orders: orders,
                    moment: moment
                });
            });
        },

        changeStatus(req, res) {
            Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }, (err, data) => {
                return res.redirect('/admin/orders')
            })
        },
    }
}

module.exports = adminOrderController;