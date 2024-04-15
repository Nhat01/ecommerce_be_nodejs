const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
   try {
      const users = await User.find();
      res.json(users);
   } catch (err) {
      res.status(500).json({ message: err.message });
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
      const totalUsers = await User.countDocuments(query);
      const totalPages = Math.ceil(totalUsers / pageSize);
      const users = await User.find(query)
         .skip((parsedPageNumber - 1) * pageSize)
         .limit(pageSize)
         .exec();

      res.status(200).json({ users, totalPages });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// Route to update an admin user by ID
router.put("/:id", async (req, res) => {
   try {
      const user = await User.findById(req.params.id);
      if (user == null) {
         return res.status(404).json({ message: "User not found" });
      }
      if (req.body.firstName != null) {
         user.firstName = req.body.firstName;
      }
      if (req.body.lastName != null) {
         user.lastName = req.body.lastName;
      }
      if (req.body.email != null) {
         user.email = req.body.email;
      }
      if (req.body.role != null) {
         user.role = req.body.role;
      }
      const updatedUser = await user.save();
      res.json(updatedUser);
   } catch (err) {
      res.status(400).json({ message: err.message });
   }
});

module.exports = router;
