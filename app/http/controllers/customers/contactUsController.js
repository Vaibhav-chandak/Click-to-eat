const Query = require("../../../models/Query");

function contactUsController() {
    return {
        index(req, res) {
            res.render("customer/contactUs", {
                title: "Contact Us",
                style: "customer/contactUs"
            });
        },

        postQuery(req, res) {
            const { subject, message } = req.body;
            if (!subject.trim() || !message.trim()) {
                req.flash("error", "All fields are mandatory!");
                req.flash("subject", subject);
                req.flash("message", message);
                return res.redirect("/contact");
            }

            const query = new Query({
                customerId: req.user._id,
                subject: subject,
                message: message
            });

            query.save().then(result => {
                req.flash("success", "Query sent successfully. We will get back to you very soon!");
                return res.redirect("/home");
            }).catch(err => {
                console.log(err);
                req.flash("error", "Something went wrong!");
                req.flash("subject", subject);
                req.flash("message", message);
                return res.redirect("/contact");
            });
        }
    }
}

module.exports = contactUsController;