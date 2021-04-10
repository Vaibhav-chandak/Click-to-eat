const auth = require("../app/http/middleware/checkAuthentication");
const guest = require("../app/http/middleware/guest");
const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController")
const cartController = require("../app/http/controllers/customers/cartController");
const contactUsController = require("../app/http/controllers/customers/contactUsController");
const menuController = require("../app/http/controllers/customers/menuController");
const orderController = require("../app/http/controllers/customers/orderController");
const profileController = require("../app/http/controllers/customers/profileController");
const adminOrderController = require("../app/http/controllers/admin/adminOrderController");
const multer = require("../app/http/middleware/multer");


function initRoutes(app) {
    app.get("/", homeController().index);
    app.get("/home", homeController().homeIndex);
    app.get("/login", guest, authController().login);
    app.get("/register", guest, authController().register);
    app.get("/myProfile", auth, profileController().index);
    app.get("/orders", auth, orderController().index);
    app.get("/menu", menuController().index);
    app.get("/cart", cartController().index);
    app.get("/contact", contactUsController().index);
    app.get("/logout", auth, authController().logout);
    app.get("/addItem", adminOrderController().addItem);
    app.get("/temp", (req, res) => {
        res.render("temp");
    });

    app.post("/editProfile", auth, profileController().editProfile);
    app.post("/register", guest, authController().postRegister);
    app.post("/login", guest, authController().postLogin);
    app.post("/contact", contactUsController().postQuery);
    app.post("/updateCart", cartController().updateCart);
    app.post("/removeOne", cartController().removeOne);
    app.post("/removeAll", cartController().removeAll);
    app.post("/checkout", auth, orderController().store);
    app.post("/addItem", multer.single("image"), adminOrderController().postAddItem);
}

module.exports = initRoutes;