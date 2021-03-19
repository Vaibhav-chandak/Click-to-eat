//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoStore = require('connect-mongo');
const flash = require("express-flash");

const app = express();
const url = 'mongodb://localhost:27017/ofdsDB';
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: url }),
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false } //24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.loggedIn = req.isAuthenticated();
    next();
});

// Setting Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// User schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, default: "Customer" }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use({ usernameField: "email", }, User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Display Landing Page
app.get("/", (req, res) => {
    res.render("landing", {
        title: "Landing Page",
        style: "landing"
    });
});

// Display Login Page
app.get("/login", (req, res) => {
    // If user is already logged in do not let user access login page
    if (req.isAuthenticated()) {
        return res.redirect("/home");
    }
    res.render("login", {
        title: "Login Page",
        style: "login",
        errors: []
    });
});

// Display Register Page
app.get("/register", (req, res) => {
    // If user is already logged in do not let user access register page
    if (req.isAuthenticated()) {
        return res.redirect("/home");
    }
    res.render("register", {
        title: "Register Page",
        style: "login",
        errors: [],
        name: _.capitalize(req.body.name),
        email: _.capitalize(req.body.email),
        password: req.body.password,
        phoneNumber: req.body.phone,
        gender: 'None',
        address: req.body.address
    });
});

// Handling new user registration
app.post("/register", (req, res) => {
    // Make the errors array empty so that error do not get repeated
    let errors = [];
    // Check if user with same email or password exists already
    User.find({}, (err, foundUser) => {
        if (err) res.send(err);
        if (foundUser) {
            foundUser.map(users => {
                if (users.email === req.body.email)
                    errors.push({ text: "Email already exists!" });
                if (users.phoneNumber === req.body.phone)
                    errors.push({ text: "Phone number already exist!" });
            });
        }
        // If there is error it will rerender page with error else it will save the user into database 
        if (errors.length > 0) {
            res.render("register", {
                title: "Register",
                style: "login",
                errors: errors,
                name: _.capitalize(req.body.name),
                email: _.capitalize(req.body.email),
                password: req.body.password,
                phoneNumber: req.body.phone,
                gender: req.body.gender,
                address: req.body.address
            });
        } else {
            User.register(new User({
                name: _.capitalize(req.body.name),
                email: _.capitalize(req.body.email),
                phoneNumber: req.body.phone,
                gender: req.body.gender,
                address: req.body.address,
                username: _.capitalize(req.body.email),
            }), req.body.password, function (err, user) {
                if (err) {
                    res.send(err);
                } else {
                    passport.authenticate("local")(request, response, function () {
                        res.redirect("/login");
                    });
                }
            });
        }
    });
});

// Handle login request
app.post("/login", (req, res) => {
    let errors = [];
    const user = new User({
        username: req.body.email,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            errors.push({ text: "Email or password is incorrect" });
            res.render("login", {
                title: "Login Page",
                style: "login",
                errors: errors
            });
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
            });
        }
    });
});

// Render Home page to the user
app.get("/home", (req, res) => {
    let randomIndex = [];
    // This function generates and stores a unique random number whenever called
    function generateUniqueRandom(maxNr) {
        //Generate random number
        let random = (Math.floor(Math.random() * maxNr));
        //Converting to number
        random = Number(random);
        if (!randomIndex.includes(random)) {
            randomIndex.push(random);
            return random;
        } else {
            return generateUniqueRandom(maxNr);
        }
    }
    // Render home page with 5 random dish
    Product.find({}, (err, results) => {
        if (!err) {
            generateUniqueRandom(results.length);
            generateUniqueRandom(results.length);
            generateUniqueRandom(results.length);
            generateUniqueRandom(results.length);
            generateUniqueRandom(results.length);
            res.render("home", {
                title: "Home Page",
                style: "home",
                randomIndex: randomIndex,
                photos: results
            });
        }
    });
});

// Render menu page, sorted in ascending order based on category field of items
app.get("/menu", (req, res) => {
    Product.find({}).sort({ "category": "asc" }).exec((err, result) => {
        if (!err) {
            res.render("menu", {
                title: "Menu Page",
                style: "menu",
                items: result
            });
        }
    });
});

// To render my profile page
app.get("/myProfile", (req, res) => {
    res.send("My Profile");
});

// To render cart page
app.get("/cart", (req, res) => {
    res.render("cart", {
        title: "Cart Page",
        style: "cart"
    });
});

// To update cart or insert data into cart
app.post("/updateCart", (req, res) => {
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
});

// To reduce quantity by 1 for an item from cart
app.post("/removeOneCart", (req, res) => {
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
});

// To remove particular item from cart
app.post("/removeAllCart", (req, res) => {
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
});

// For logout
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Upload product temporary
const productSchema = new mongoose.Schema({
    image: String,
    title: String,
    price: Number,
    category: String,
    description: String
});
const Product = mongoose.model("Product", productSchema);

app.post("/uploadPhoto", upload.single("image"), (req, res) => {
    const product = new Product({
        image: req.file.path,
        title: req.body.title,
        price: req.body.price,
        description: req.body.desc,
        category: req.body.category
    });
    product.save((err, result) => {
        if (!err) {
            res.send(result)
        } else {
            res.send(err)
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server is running at port 3000!");
});
