const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
   name: { type: String, required: true, maxlength: 50 },
   parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
   level: { type: Number },
});
module.exports = mongoose.model("Category", categorySchema);
