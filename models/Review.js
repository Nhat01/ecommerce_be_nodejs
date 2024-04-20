const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
   review: { type: String },
   product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   rating: { type: mongoose.Schema.Types.ObjectId, ref: "Rating" },
   createdAt: { type: Date },
});

module.exports = mongoose.model("Review", reviewSchema);
