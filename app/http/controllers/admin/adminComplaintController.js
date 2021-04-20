const Query = require("../../../models/Query");

function adminComplaintController() {
    return {
        index(req, res) {
            Query.find({}).populate('customerId', '-password').exec((err, queries) => {
                return res.render("admin/complaint", {
                    title: "All complaints",
                    style: "admin/complaint",
                    queries: queries
                });
            });
        },

        complaintSolved(req, res) {
            Query.findByIdAndDelete(req.body.queryId, (err, query) => {
                if (err) {
                    req.flash("error", "Something went wrong!");
                } else {
                    req.flash("success", "Query marked solved!");
                }
                res.redirect("/admin/complaints");
            });
        }
    }
}

module.exports = adminComplaintController;