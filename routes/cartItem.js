const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/jwt");
const CartItem = require("../models/CartItem");
const User = require("../models/User");

// DELETE request to delete a cart item
router.delete("/:cartItemId", authenticateJWT, async (req, res) => {
   try {
      const cartItemId = req.params.cartItemId;
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const cartItem = await CartItem.findById(cartItemId).populate("cart");
      if (!cartItem) {
         return res.status(404).json({ error: "Cart item not found" });
      }

      // Check if the cart item belongs to the authenticated user
      if (cartItem.cart.user.toString() !== user._id.toString()) {
         return res.status(403).json({ error: "Unauthorized access" });
      }

      await CartItem.findByIdAndDelete(cartItemId);
      res.status(200).json({ message: "Item deleted from cart", status: true });
   } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// PUT request to update a cart item
router.put("/:cartItemId", authenticateJWT, async (req, res) => {
   try {
      const cartItemId = req.params.cartItemId;
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      const cartItem = await CartItem.findById(cartItemId)
         .populate({
            path: "product",
            select: "discountedPrice price",
         })
         .populate({
            path: "cart",
            select: "user",
         });
      if (!cartItem) {
         return res.status(404).json({ error: "Cart item not found" });
      }

      // Check if the cart item belongs to the authenticated user
      if (cartItem.cart.user.toString() !== user._id.toString()) {
         return res.status(403).json({ error: "Unauthorized access" });
      }

      cartItem.quantity = req.body.quantity;
      cartItem.price = cartItem.product.price * cartItem.quantity;
      cartItem.discountedPrice =
         cartItem.product.discountedPrice * cartItem.quantity;

      await cartItem.save();
      res.status(200).json(cartItem);
   } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
