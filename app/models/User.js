const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    profilePicture: { type: String, default: "uploads\\2021-03-21T10-19-07.396Z-profile-pic.png" },
    coverPicture: { type: String, default: "uploads\\2021-03-21T10-19-36.105Z-cover-pic.jpg" },
    role: { type: String, default: "Customer" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);