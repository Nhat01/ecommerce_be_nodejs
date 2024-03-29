const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
   name: { type: String },
   quantity: { type: Number },
});

module.exports = mongoose.model("Size", sizeSchema);
