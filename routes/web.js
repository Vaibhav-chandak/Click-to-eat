const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController")
const cartController = require("../app/http/controllers/customers/cartController");
const menuController = require("../app/http/controllers/customers/menuController");

function initRoutes(app) {
    app.get("/", homeController().index);
    app.get("/home", homeController().homeIndex);
    app.get("/login", authController().login);
    app.get("/register", authController().register);
    app.get("/menu", menuController().index);
    app.get("/cart", cartController().index);
    app.get("/logout", authController().logout);

    app.post("/register", authController().postRegister);
    app.post("/login", authController().postLogin);
    app.post("/updateCart", cartController().updateCart);
    app.post("/removeOne", cartController().removeOne);
    app.post("/removeAll", cartController().removeAll);
}

module.exports = initRoutes;