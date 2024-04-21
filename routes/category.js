// controllers/adminProductController.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

router.get("/", async (req, res) => {
   try {
      const categories = await Category.find();

      res.json(categories);

      //   if (category) {
      //      const categoryData = [];
      //      if (
      //         category.parentCategory &&
      //         category.parentCategory.parentCategory
      //      ) {
      //         categoryData.push({
      //            level: 3,
      //            name: category.name,
      //         });
      //      }
      //      if (category.parentCategory) {
      //         categoryData.push({
      //            level: 2,
      //            name: category.parentCategory.name,
      //         });
      //      }
      //      categoryData.push({
      //         level: 1,
      //         name: category.parentCategory.parentCategory.name,
      //      });
      //      res.json(categoryData);
      //   }
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;
