const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   cartItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
   totalPrice: { type: Number },
   totalDiscountedPrice: { type: Number },
   discount: { type: Number },
   totalItem: { type: Number },
});

module.exports = mongoose.model("Cart", cartSchema);
