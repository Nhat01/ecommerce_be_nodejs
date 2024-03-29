const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
   rating: { type: Number },
   createdAt: { type: Date },
});

module.exports = mongoose.model("Rating", ratingSchema);
