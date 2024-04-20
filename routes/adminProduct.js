// controllers/adminProductController.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");

router.post("/", async (req, res) => {
   const reqData = req.body;
   try {
      let topLevel = await Category.findOne({ name: reqData.topLevelCategory });
      if (!topLevel) {
         topLevel = await Category.create({
            name: reqData.topLevelCategory,
            level: 1,
         });
      }

      let secondLevel = await Category.findOne({
         name: reqData.secondLevelCategory,
         parentCategory: topLevel._id,
      });
      if (!secondLevel) {
         secondLevel = await Category.create({
            name: reqData.secondLevelCategory,
            parentCategory: topLevel._id,
            level: 2,
         });
      }

      let thirdLevel = await Category.findOne({
         name: reqData.thirdLevelCategory,
         parentCategory: secondLevel._id,
      });
      if (!thirdLevel) {
         thirdLevel = await Category.create({
            name: reqData.thirdLevelCategory,
            parentCategory: secondLevel._id,
            level: 3,
         });
      }

      const product = new Product({
         title: reqData.title,
         description: reqData.description,
         price: reqData.price,
         discountedPrice: reqData.discountedPrice,
         discountPercent: reqData.discountPercent,
         quantity: reqData.quantity,
         brand: reqData.brand,
         color: reqData.color,
         sizes: reqData.size,
         imageUrl: reqData.imageUrl,
         category: thirdLevel,
      });

      await product.save();
      res.status(201).json(product);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

router.get("/find", async (req, res) => {
   const { pageNumber, pageSize } = req.query;

   try {
      let query = {};
      const parsedPageNumber = parseInt(pageNumber);
      if (isNaN(parsedPageNumber) || parsedPageNumber < 1) {
         return res.status(400).json({ error: "Invalid pageNumber value" });
      }

      console.log(query);
      const totalUsers = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / pageSize);
      const products = await Product.find(query)
         .populate("category")
         .skip((parsedPageNumber - 1) * pageSize)
         .limit(pageSize)
         .exec();

      res.status(200).json({ products, totalPages });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

router.delete("/:productId/delete", async (req, res) => {
   const productId = req.params.productId;
   try {
      await Product.findByIdAndDelete(productId);
      res.json({ message: "Product deleted successfully" });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

router.get("/all", async (req, res) => {
   try {
      const products = await Product.find().populate({
         path: "category",
         populate: {
            path: "parentCategory",
            populate: {
               path: "parentCategory",
            },
         },
      });
      res.json(products);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

router.put("/:productId/update", async (req, res) => {
   const productId = req.params.productId;
   const reqData = req.body;
   try {
      let product = await Product.findById(productId);
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }

      if (reqData.quantity !== undefined) {
         product.quantity = reqData.quantity;
      }

      await product.save();
      res.json(product);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

router.post("/creates", async (req, res) => {
   const reqData = req.body;
   try {
      const products = [];
      for (let i = 0; i < reqData.length; i++) {
         const item = reqData[i];

         let topLevel = await Category.findOne({
            name: item.topLevelCategory,
         });
         console.log(i + ": " + topLevel);
         if (!topLevel) {
            topLevel = await Category.create({
               name: item.topLevelCategory,
               level: 1,
            });
         }

         let secondLevel = await Category.findOne({
            name: item.secondLevelCategory,
            parentCategory: topLevel._id,
         });
         console.log(i + ": " + secondLevel);
         if (!secondLevel) {
            secondLevel = await Category.create({
               name: item.secondLevelCategory,
               parentCategory: topLevel._id,
               level: 2,
            });
         }

         let thirdLevel = await Category.findOne({
            name: item.thirdLevelCategory,
            parentCategory: secondLevel._id,
         });
         console.log(i + ": " + thirdLevel);
         if (!thirdLevel) {
            thirdLevel = await Category.create({
               name: item.thirdLevelCategory,
               parentCategory: secondLevel._id,
               level: 3,
            });
         }

         const product = new Product({
            title: item.title,
            description: item.description,
            price: item.price,
            discountedPrice: item.discountedPrice,
            discountPercent: item.discountPercent,
            quantity: item.quantity,
            brand: item.brand,
            color: item.color,
            sizes: item.size,
            imageUrl: item.imageUrl,
            category: thirdLevel,
         });

         await product.save();
         products.push(product);
      }

      res.status(201).json({ message: "Products created successfully" });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;
