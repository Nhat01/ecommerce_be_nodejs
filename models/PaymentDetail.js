const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
   paymentMethod: { type: String },
   status: { type: String },
   paymentId: { type: String },
   razorpayPaymentLinkId: { type: String },
   razorpayPaymentLinkReferenceId: { type: String },
   razorpayPaymentLinkStatus: { type: String },
   razorpayPaymentId: { type: String },
});

module.exports = mongoose.model("PaymentDetails", paymentDetailsSchema);
