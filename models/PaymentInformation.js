const mongoose = require("mongoose");

const paymentInformationSchema = new mongoose.Schema({
   cardholderName: { type: String },
   cardNumber: { type: String },
   expirationDate: { type: String },
   cvv: { type: String },
});

module.exports = mongoose.model("PaymentInformation", paymentInformationSchema);
