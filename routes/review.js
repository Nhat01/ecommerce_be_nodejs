const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const { authenticateJWT } = require("../middleware/jwt");

// Tạo đánh giá mới
router.post("/create", authenticateJWT, async (req, res) => {
   try {
      // Lấy thông tin đánh giá từ request body
      const { review, productId } = req.body;

      // Tìm người dùng dựa trên thông tin jwt
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      // Tìm sản phẩm dựa trên ID
      const product = await Product.findById(productId);
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }

      // Tạo đánh giá mới
      const newReview = new Review({
         review,
         product: productId,
         user: user._id,
         createdAt: new Date(),
      });

      // Lưu đánh giá vào cơ sở dữ liệu
      const savedReview = await newReview.save();

      res.status(201).json(savedReview);
   } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Lấy đánh giá của sản phẩm
router.get("/product/:productId", async (req, res) => {
   try {
      const productId = req.params.productId;

      // Tìm tất cả các đánh giá của sản phẩm
      const reviews = await Review.find({ product: productId });

      res.status(200).json(reviews);
   } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
