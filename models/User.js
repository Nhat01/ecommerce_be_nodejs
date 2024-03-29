const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   firstName: String,
   lastName: String,
   password: String,
   email: String,
   role: String,
   mobile: String,
   address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
   paymentInformation: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PaymentInformation" },
   ],
   ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("User", userSchema);
