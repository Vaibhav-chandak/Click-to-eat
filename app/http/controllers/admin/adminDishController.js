const Product = require("../../../models/Product");
const _ = require("lodash");

function adminDishController() {
    return {
        addDish(req, res) {
            res.render("admin/addDish", {
                title: "Add dish",
                style: "admin/addDish"
            });
        },

        postAddDish(req, res) {
            const { title, price, category, description } = req.body;
            // Check for empty requests
            if (!title.trim() || !price.trim() || !category.trim() || !description.trim() || !req.file) {
                req.flash("error", "All fields are mandatory!");
                req.flash('title', title);
                req.flash('price', price);
                req.flash('category', category);
                req.flash('description', description);
                return res.redirect("/admin/addDish");
            }

            // Check if price has non numeric value
            if (isNaN(price)) {
                req.flash("error", "Price can only have numeric value!");
                req.flash('title', title);
                req.flash('category', category);
                req.flash('description', description);
                return res.redirect("/admin/addDish");
            }

            // Check if the product with same name exists
            Product.exists({ title: _.capitalize(title) }, (err, product) => {
                if (product) {
                    req.flash("error", "Dish with same name already exists!");
                    req.flash('title', title);
                    req.flash('price', price);
                    req.flash('category', category);
                    req.flash('description', description);
                    return res.redirect("/admin/addDish");
                } else { // If product not found than upload in databasse
                    const product = new Product({
                        image: req.file.path,
                        title: _.capitalize(title),
                        price: price,
                        category: _.capitalize(category),
                        description: description
                    });
                    product.save((err, result) => {
                        if (!err) {
                            req.flash("success", "Dish added successfully!");
                            return res.redirect("/admin/addDish");
                        }
                        req.flash("error", "Something went wrong!");
                        return res.redirect("/admin/addDish");
                    });
                }
            });
        },

        viewDish(req, res) {
            Product.find({}, null, { sort: { "category": 1 } }, (err, products) => {
                if (!err) {
                    res.render("admin/viewDish", {
                        title: "View Dish",
                        style: "admin/viewDish",
                        products: products
                    });
                }
            });
        },

        updateDish(req, res) {
            const { title, price, category, description } = req.body;
            // Check for empty requests
            if (!title.trim() || !price.trim() || !category.trim() || !description.trim()) {
                req.flash("error", "All fields are mandatory!");
                return res.redirect("/admin/viewDishes");
            }

            // Check if price has non numeric value
            if (isNaN(price)) {
                req.flash("error", "Price can only have numeric value!");
                return res.redirect("/admin/viewDishes");
            }

            // Update the product with new data entered by user if there is no new image
            if (!req.file) {
                Product.findByIdAndUpdate(req.body.id, {
                    title: _.capitalize(title),
                    price: price,
                    category: _.capitalize(category),
                    description: description
                }, (err, product) => {
                    req.flash("success", "The dish is updated!");
                    res.redirect("/admin/viewDishes");
                });
            } else {
                // Do delete the old image from server
                const fs = require("fs");
                fs.unlinkSync(req.body.dishImage);
                // Update data if there is image too
                Product.findByIdAndUpdate(req.body.id, {
                    title: _.capitalize(title),
                    price: price,
                    category: _.capitalize(category),
                    description: description,
                    image: req.file.path
                }, (err, product) => {
                    req.flash("success", "The dish is updated!");
                    res.redirect("/admin/viewDishes");
                });
            }
        },

        deleteDish(req, res) {
            const fs = require("fs");
            fs.unlinkSync(req.body.dishImage);
            Product.findByIdAndDelete(req.body.dishId, (err, product) => {
                if (err) {
                    req.flash("error", "Something went wrong, try again!");
                    res.redirect("/admin/viewDishes");
                } else {
                    req.flash("success", "Dish successfully deleted!");
                    res.redirect("/admin/viewDishes");
                }
            });
        }
    }
}

module.exports = adminDishController;