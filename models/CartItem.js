const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
   cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
   product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
   size: String,
   quantity: Number,
   price: Number,
   discountedPrice: Number,
});

module.exports = mongoose.model("CartItem", cartItemSchema);
