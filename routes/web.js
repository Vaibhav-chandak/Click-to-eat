const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController")
const cartController = require("../app/http/controllers/customers/cartController");
const contactUsController = require("../app/http/controllers/customers/contactUsController");
const aboutUsController = require("../app/http/controllers/customers/aboutUsController");
const menuController = require("../app/http/controllers/customers/menuController");
const orderController = require("../app/http/controllers/customers/orderController");
const profileController = require("../app/http/controllers/customers/profileController");
const adminOrderController = require("../app/http/controllers/admin/adminOrderController");
const adminDishController = require("../app/http/controllers/admin/adminDishController");
const multer = require("../app/http/middleware/multer");

// Middlewares
const auth = require("../app/http/middleware/checkAuthentication");
const guest = require("../app/http/middleware/guest");
const adminAuth = require("../app/http/middleware/adminAuthentication");

function initRoutes(app) {
    // Common routes
    app.get("/", homeController().index);
    app.get("/home", homeController().homeIndex);
    app.get("/login", guest, authController().login);

    // Customer Routes
    app.get("/register", guest, authController().register);
    app.get("/myProfile", auth, profileController().index);
    app.get("/orders", auth, orderController().index);
    app.get("/menu", menuController().index);
    app.get("/cart", cartController().index);
    app.get("/contact", contactUsController().index);
    app.get("/about", aboutUsController().index);
    app.get("/logout", auth, authController().logout);

    app.post("/editProfile", auth, profileController().editProfile);
    app.post("/register", guest, authController().postRegister);
    app.post("/login", guest, authController().postLogin);
    app.post("/contact", contactUsController().postQuery);
    app.post("/updateCart", cartController().updateCart);
    app.post("/removeOne", cartController().removeOne);
    app.post("/removeAll", cartController().removeAll);
    app.post("/checkout", auth, orderController().store);

    // Admin Routes
    app.get("/admin/orders", adminAuth, adminOrderController().index);
    app.get("/admin/allOrders", adminAuth, adminOrderController().allOrders);
    app.get("/admin/addDish", adminAuth, adminDishController().addDish);
    app.get("/admin/viewDishes", adminAuth, adminDishController().viewDish);

    app.post("/admin/order/status", adminAuth, adminOrderController().changeStatus);
    app.post("/admin/addDish", multer.single("image"), adminDishController().postAddDish);
    app.post("/admin/updateDish", multer.single("image"), adminDishController().updateDish);
    app.post("/admin/deleteDish", adminDishController().deleteDish);
}

module.exports = initRoutes;