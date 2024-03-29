const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
   firstName: { type: String },
   lastName: { type: String },
   streetAddress: { type: String },
   city: { type: String },
   state: { type: String },
   zipCode: { type: String },
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   mobile: { type: String },
});

module.exports = mongoose.model("Address", addressSchema);
