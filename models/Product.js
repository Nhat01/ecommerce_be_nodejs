const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
   title: String,
   description: String,
   price: Number,
   discountedPrice: Number,
   discountPercent: Number,
   quantity: Number,
   brand: String,
   color: String,
   sizes: [
      {
         name: String,
         quantity: Number,
      },
   ],
   imageUrl: String,
   ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
   numRatings: Number,
   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
   status: { type: Number, default: 1 },
});

module.exports = mongoose.model("Product", productSchema);
