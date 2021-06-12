function contactUsController() {
    return {
        index(req, res) {
            res.render("customer/aboutUs", {
                title: "About Us",
                style: "customer/aboutUs"
            });
        },
    }
}

module.exports = contactUsController;