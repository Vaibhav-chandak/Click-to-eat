const Product = require("../../../models/Product");

function menuController() {
    return {
        index(req, res) {
            Product.find({}).sort({ "category": "asc" }).exec((err, result) => {
                if (!err) {
                    res.render("customer/menu", {
                        title: "Menu Page",
                        style: "customer/menu",
                        items: result
                    });
                }
            });
        }
    }
}

module.exports = menuController;