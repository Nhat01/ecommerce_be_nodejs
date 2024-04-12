const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/jwt");
const User = require("../models/User");

// Get User Profile
router.get("/profile", authenticateJWT, async (req, res) => {
   try {
      const email = req.user.email;
      const user = await User.findOne({ email }).populate("address");

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;
