const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
   review: { type: String },
   product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   createdAt: { type: Date },
});

module.exports = mongoose.model("Review", reviewSchema);
