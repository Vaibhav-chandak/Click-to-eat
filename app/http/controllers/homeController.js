const Product = require("../../models/Product");

function homeController() {
    return {
        index(req, res) {
            res.redirect("/home");
        },

        homeIndex(req, res) {
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
        }
    }
}

module.exports = homeController;