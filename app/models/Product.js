const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model("Product", productSchema);