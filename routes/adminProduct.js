// controllers/adminProductController.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");
const {
   upload,
   uploadToFireBase,
   deleteFileFromFirebase,
} = require("../middleware/fileUpload");
const CartItem = require("../models/CartItem");
const User = require("../models/User");

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

      const totalUsers = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / pageSize);
      const products = await Product.find(query)
         .populate({
            path: "category",
            populate: {
               path: "parentCategory",
               populate: {
                  path: "parentCategory",
               },
            },
         })
         .skip((parsedPageNumber - 1) * pageSize)
         .limit(pageSize)
         .exec();

      const transformedProducts = products.map((product) => {
         const { category } = product;
         if (category) {
            const categoryData = [];
            if (
               category.parentCategory &&
               category.parentCategory.parentCategory
            ) {
               categoryData.push({
                  level: 3,
                  name: category.name,
               });
            }
            if (category.parentCategory) {
               categoryData.push({
                  level: 2,
                  name: category.parentCategory.name,
               });
            }
            categoryData.push({
               level: 1,
               name: category.parentCategory.parentCategory.name,
            });
            return { ...product.toObject(), category: categoryData };
         }
      });

      res.status(200).json({ products: transformedProducts, totalPages });
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

router.put("/:productId/update", upload.single("file"), async (req, res) => {
   const productId = req.params.productId;
   const reqData = JSON.parse(req.body.product);
   try {
      let product = await Product.findById(productId);
      if (!product) {
         return res.status(404).json({ message: "Product not found" });
      }

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

      product.title = reqData.title;
      product.description = reqData.description;
      product.price = reqData.price;
      product.discountedPrice = reqData.discountedPrice;
      product.discountPercent = reqData.discountPercent;
      product.quantity = reqData.quantity;
      product.brand = reqData.brand;
      product.color = reqData.color;
      product.sizes = reqData.size;
      product.category = thirdLevel;
      if (req.file) {
         await deleteFileFromFirebase(product.imageUrl);
         const publicUrl = await uploadToFireBase(req, res);
         product.imageUrl = publicUrl;
      } else {
         product.imageUrl = product.imageUrl;
      }
      product.status = reqData.status;
      await product.save();

      const currentStatus = product.status;
      if (currentStatus === 0) {
         if (currentStatus === 1 && reqData.status === 0) {
            // Tìm tất cả các mục giỏ hàng chứa sản phẩm được cập nhật
            const cartItems = await CartItem.find({ product: productId });

            // Xóa các mục giỏ hàng tìm được
            for (let cartItem of cartItems) {
               await cartItem.remove();
            }
         }
      }
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
