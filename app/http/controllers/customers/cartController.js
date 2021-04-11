function cartController() {
    return {
        index(req, res) {
            res.render("customer/cart", {
                title: "Cart Page",
                style: "customer/cart"
            });
        },

        updateCart(req, res) {
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }
            let cart = req.session.cart;
            if (!cart.items[req.body._id]) {
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            } else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            }
            return res.json({ totalQty: req.session.cart.totalQty });
        },

        removeOne(req, res) {
            const dishID = req.body.dishID;
            // Reduce quantity and price
            req.session.cart.totalQty -= 1;
            req.session.cart.totalPrice -= req.session.cart.items[dishID].item.price;
            // Reduce the quantity of that item by one
            req.session.cart.items[dishID].qty -= 1;
            // If that item had only one pcs than remove that item
            if (req.session.cart.items[dishID].qty === 0) {
                delete req.session.cart.items[dishID];
            }
            // If that item was last with only one quantity delete that cart itself
            if (Object.keys(req.session.cart.items).length === 0) {
                delete req.session.cart;
            }
            res.redirect("/cart");
        },

        removeAll(req, res) {
            const dishID = req.body.dishID;
            // Reduce total quantity and price
            req.session.cart.totalQty -= req.session.cart.items[dishID].qty;
            req.session.cart.totalPrice -= (req.session.cart.items[dishID].qty * req.session.cart.items[dishID].item.price);
            // Delete that item
            delete req.session.cart.items[dishID];
            // Delete the object iteself if the cart is empty
            if (Object.keys(req.session.cart.items).length === 0) {
                delete req.session.cart;
            }
            res.redirect("/cart");
        }
    }
}

module.exports = cartController;