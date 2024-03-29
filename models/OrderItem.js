const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
   userId: { type: Number },
   order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
   product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
   size: { type: String },
   quantity: { type: Number },
   price: { type: Number },
   discountedPrice: { type: Number },
   deliveryDate: { type: Date },
});
module.exports = mongoose.model("OrderItem", orderItemSchema);
