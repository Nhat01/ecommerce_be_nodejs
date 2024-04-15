const express = require("express");
const router = express.Router();
const { generateToken } = require("../middleware/jwt");
const User = require("../models/User");
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");

// Sign Up
router.post("/signup", async (req, res) => {
   const { email, password, firstName, lastName } = req.body;

   try {
      let user = await User.findOne({ email });

      if (user) {
         return res.status(400).json({ message: "Email is already taken" });
      }

      user = new User({
         email,
         password,
         firstName,
         lastName,
         role: "User",
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const cart = new Cart({ user: user._id });
      await cart.save();

      const token = generateToken(user.email);

      res.status(201).json({ token, message: "Sign up successful" });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

// Sign In
router.post("/signin", async (req, res) => {
   const { email, password } = req.body;

   try {
      let user = await User.findOne({ email });

      if (!user) {
         return res.status(400).json({ message: "Invalid credentials" });
      }
      if (user.password !== undefined) {
         const isMatch = await bcrypt.compare(password, user.password);

         if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
         }

         const token = generateToken(user.email);

         res.status(200).json({ token, message: "Sign in successful" });
      } else {
         res.status(400).json({ message: "User or password not match" });
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;
