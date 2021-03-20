//jshint esversion:6
require("dotenv").config();
const express = require("express"),
    mongoose = require("mongoose"),
    multer = require("multer"),
    _ = require("lodash"),
    session = require("express-session"),
    passport = require("passport"),
    MongoStore = require('connect-mongo'),
    flash = require("express-flash");

const app = express();

const url = 'mongodb://localhost:27017/ofdsDB';

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
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false } //24 hours
}));

// Passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user
    next();
});

// Local / my files
require("./routes/web")(app);

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

// Upload product temporary
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
