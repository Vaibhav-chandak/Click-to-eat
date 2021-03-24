const auth = require("../app/http/middleware/checkAuthentication");
const guest = require("../app/http/middleware/guest");
const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController")
const cartController = require("../app/http/controllers/customers/cartController");
const menuController = require("../app/http/controllers/customers/menuController");
const orderController = require("../app/http/controllers/customers/orderController");
const profileController = require("../app/http/controllers/customers/profileController");

function initRoutes(app) {
    app.get("/", homeController().index);
    app.get("/home", homeController().homeIndex);
    app.get("/login", guest, authController().login);
    app.get("/register", guest, authController().register);
    app.get("/myProfile", auth, profileController().index);
    app.get("/orders", auth, orderController().index);
    app.get("/menu", menuController().index);
    app.get("/cart", cartController().index);
    app.get("/logout", auth, authController().logout);

    app.post("/editProfile", auth, profileController().editProfile);
    app.post("/register", guest, authController().postRegister);
    app.post("/login", guest, authController().postLogin);
    app.post("/updateCart", cartController().updateCart);
    app.post("/removeOne", cartController().removeOne);
    app.post("/removeAll", cartController().removeAll);
    app.post("/checkout", auth, orderController().store);
}

module.exports = initRoutes;