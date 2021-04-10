const _ = require("lodash");
const { rawListeners } = require("../../../models/Product");

const Product = require("../../../models/Product");

function adminOrderController() {
    return {
        addItem(req, res) {
            res.send("Hello");
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