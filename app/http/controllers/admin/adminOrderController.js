const _ = require("lodash");
const Product = require("../../../models/Product");
const Order = require("../../../models/Order");
const moment = require("moment");

function adminOrderController() {
    return {
        index(req, res) {
            Order.find({ status: { $ne: 'Completed' } }, null, { sort: { 'createdAt': -1 } }).populate('customerId', '-password').exec((err, orders) => {
                return res.render("admin/orders", {
                    title: "Current orders",
                    style: "admin/orders",
                    orders: orders,
                    moment: moment
                });
            });
        },

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

        postAddItem(req, res) {
            const { title, price, category, description } = req.body;
            // Check for empty requests
            if (!title.trim() || !price.trim() || !category.trim() || !description.trim() || !req.file) {
                req.flash("error", "All fields are mandatory");
                req.flash('title', title);
                req.flash('price', price);
                req.flash('category', category);
                req.flash('description', description);
                return res.send("All field are mandatory");
            }

            // Check if the product with same name exists
            Product.exists({ title: _.capitalize(title) }, (err, product) => {
                if (product) {
                    req.flash("error", "Dish with same name already exists");
                    req.flash('title', title);
                    req.flash('price', price);
                    req.flash('category', category);
                    req.flash('description', description);
                    return res.send("Item already exists");
                } else { // If product not found than upload in databasse
                    const product = new Product({
                        image: req.file.path,
                        title: _.capitalize(title),
                        price: price,
                        category: category,
                        description: description
                    });
                    product.save((err, result) => {
                        if (!err) {
                            res.redirect("/addItem");
                        }
                    });
                }
            });
        }
    }
}

module.exports = adminOrderController;