//jshint esversion:6
require("dotenv").config();
const express = require("express"),
    mongoose = require("mongoose"),
    session = require("express-session"),
    passport = require("passport"),
    MongoStore = require('connect-mongo'),
    flash = require("express-flash");

const app = express();

const url = process.env.MONGO_URL;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(flash());
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: url }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 } //24 hours
}));

// Passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user
    next();
});

// Local / my files
require("./routes/web")(app);

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
// Start server
app.listen(port, () => {
    console.log("Server is running at port 3000!");
});