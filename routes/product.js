// controllers/productController.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// Filter Products
router.get("/filter", async (req, res) => {
   const {
      category,
      color,
      size,
      minPrice,
      maxPrice,
      minDiscount,
      sort,
      stock,
      pageNumber,
      pageSize,
   } = req.query;

   try {
      let query = {};
      const parsedPageNumber = parseInt(pageNumber);
      if (isNaN(parsedPageNumber) || parsedPageNumber < 1) {
         return res.status(400).json({ error: "Invalid pageNumber value" });
      }
      if (category) {
         const foundCategory = await Category.findOne({ name: category });
         if (foundCategory) {
            query.category = foundCategory._id;
         } else {
            return res.status(400).json({ error: "Invalid category name" });
         }
      }
      if (color) query.color = { $in: color };
      if (size && size !== "0") query.sizes = { $in: size };
      if (minPrice || maxPrice) {
         query.price = {};
         if (minPrice) query.price.$gte = parseInt(minPrice);
         if (maxPrice) query.price.$lte = parseInt(maxPrice);
      }
      if (minDiscount) query.discountedPrice = { $gte: parseInt(minDiscount) };

      if (stock) {
         if (stock === "in_stock") query.quantity = { $gt: 0 };
         else if (stock === "out_of_stock") query.quantity = { $lte: 0 };
      }

      let sortOption = {};
      if (sort === "latest") sortOption = { createdAt: -1 };
      else if (sort === "price_low_to_high") sortOption = { price: 1 };
      else if (sort === "price_high_to_low") sortOption = { price: -1 };

      const products = await Product.find(query)
         .sort(sortOption)
         .skip((parsedPageNumber - 1) * pageSize)
         .limit(pageSize)
         .exec();
      res.status(200).json(products);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// Get Product by ID
router.get("/id/:productId", async (req, res) => {
   const productId = req.params.productId;

   try {
      const product = await Product.findById(productId).exec();
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// Search Products by Category
router.get("/search", async (req, res) => {
   const category = req.query.category;

   try {
      const products = await Product.find({ category: category }).exec();
      res.status(200).json(products);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// Get Latest Products by Categories
router.get("/latest", async (req, res) => {
   const { categories, numberOfProducts } = req.body;
   // Check if categories is not provided or not an array
   if (!categories || !Array.isArray(categories)) {
      return res
         .status(400)
         .json({ error: "Invalid or missing 'categories' array" });
   }

   // Check if numberOfProducts is not provided or not a valid number
   if (
      !numberOfProducts ||
      typeof numberOfProducts !== "number" ||
      numberOfProducts <= 0
   ) {
      return res
         .status(400)
         .json({ error: "Invalid or missing 'numberOfProducts' value" });
   }
   try {
      const latestProducts = [];
      for (let categoryName of categories) {
         const category = await Category.findOne({ name: categoryName });
         if (!category) {
            console.log(`Category '${categoryName}' not found`);
            continue;
         }
         const products = await Product.find({ category: category._id })
            .sort({ createdAt: -1 })
            .limit(numberOfProducts)
            .exec();
         latestProducts.push({
            name: categoryName,
            products: products,
         });
      }
      res.status(200).json(latestProducts);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;
