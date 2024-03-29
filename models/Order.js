const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
   orderDate: { type: Date },
   deliveryDate: { type: Date },
   shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
   paymentDetails: { status: String },
   totalPrice: { type: Number },
   totalDiscountedPrice: { type: Number },
   discount: { type: Number },
   totalItem: { type: Number },
   orderStatus: { type: String },
});
module.exports = mongoose.model("Order", orderSchema);
