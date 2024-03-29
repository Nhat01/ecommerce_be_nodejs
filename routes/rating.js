const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/jwt");
const Rating = require("../models/Rating");
const User = require("../models/User");
const Product = require("../models/Product");

// Create rating
router.post("/create", authenticateJWT, async (req, res) => {
   try {
      const { productId, rating } = req.body;
      const user = await User.findOne({ email: req.user.email });
      const product = await Product.findById(productId);
      if (!product) {
         throw new Error("Product not found");
      }
      const newRating = new Rating({
         rating: rating,
         product: productId,
         user: user._id,
         createdAt: new Date(),
      });
      await newRating.save();
      res.status(201).json(newRating);
   } catch (error) {
      console.error("Error creating rating:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Get product's ratings
router.get("/product/:productId", authenticateJWT, async (req, res) => {
   try {
      const productId = req.params.productId;
      const ratings = await Rating.find({ product: productId });
      res.status(200).json(ratings);
   } catch (error) {
      console.error("Error getting product's ratings:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
