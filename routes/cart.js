const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const CartItem = require("../models/CartItem");
const User = require("../models/User");
const { authenticateJWT } = require("../middleware/jwt");

// Get user's cart
router.get("/", authenticateJWT, async (req, res) => {
   try {
      const user = await User.findOne({ email: req.user.email });
      const cart = await Cart.findOne({ user: user._id }).populate({
         path: "cartItems",
         populate: {
            path: "product",
         },
      });
      let totalPrice = 0;
      let totalDiscountedPrice = 0;

      if (cart.cartItems) {
         for (const cartItem of cart.cartItems) {
            totalPrice += cartItem.price;
            totalDiscountedPrice += cartItem.discountedPrice;
         }
      }

      cart.totalPrice = totalPrice;
      cart.totalDiscountedPrice = totalDiscountedPrice;
      cart.totalItem = cart.cartItems.length;
      cart.discount = totalPrice - totalDiscountedPrice;

      await cart.save();

      res.status(200).json(cart);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Add item to cart
router.post("/add", authenticateJWT, async (req, res) => {
   try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const { productId, quantity, size } = req.body;

      const cart = await Cart.findOne({ user: user._id }).populate({
         path: "cartItems",
         populate: {
            path: "product",
         },
      });
      const product = await Product.findById(productId);

      // Check if item already exists in cart
      let cartItem = await CartItem.findOne({
         cart: cart._id,
         product: productId,
         size,
      });

      if (cartItem) {
         // If item already exists, update quantity
         cartItem.quantity += quantity;
         cartItem.price = product.price * cartItem.quantity;
         cartItem.discountedPrice = product.discountedPrice * cartItem.quantity;
      } else {
         // If item does not exist, create a new cart item
         cartItem = new CartItem({
            cart: cart._id,
            product: productId,
            quantity: quantity,
            size,
            price: product.price * quantity,
            discountedPrice: product.discountedPrice * quantity,
            discount:
               product.price * quantity - product.discountedPrice * quantity,
         });
      }

      // Save or update the cart item
      await cartItem.save();

      // Update the cart with the new or updated cart item
      const isAlreadyIncluded = cart.cartItems.find((item) =>
         item._id.equals(cartItem._id)
      );
      if (!isAlreadyIncluded) {
         cart.cartItems.push(cartItem._id);
      }
      cart.totalItem = cart.cartItems.length;
      await cart.save();

      // Populate and send the updated cart
      const updatedCart = await Cart.findById(cart._id).populate({
         path: "cartItems",
         populate: {
            path: "product",
         },
      });
      res.status(200).json(updatedCart);
   } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: error.message });
   }
});

// Add multiple items to cart
router.post("/addItems", authenticateJWT, async (req, res) => {
   try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const { items } = req.body;

      const cart = await Cart.findOne({ user: user._id });

      for (const item of items) {
         const { productId, quantity, size } = item;

         // Validate quantity
         if (isNaN(quantity) || quantity <= 0) {
            return res
               .status(400)
               .json({ message: `Invalid quantity for product ${productId}` });
         }

         const product = await Product.findById(productId);

         // Check if item already exists in cart
         let cartItem = await CartItem.findOne({
            cart: cart._id,
            product: productId,
            size,
         });

         if (cartItem) {
            // If item already exists, update quantity
            cartItem.quantity += quantity;
            // Save the updated cart item
            await cartItem.save();
         } else {
            // If item does not exist, create a new cart item
            cartItem = new CartItem({
               cart: cart._id,
               product: productId,
               quantity,
               size,
               price: product.discountedPrice * quantity,
               discountedPrice: product.discountedPrice,
            });
            // Save the new cart item
            await cartItem.save();
            // Update the cart with the new cart item
            cart.cartItems.push(cartItem._id);
            await cart.save();
         }
      }
      // Populate and send the updated cart
      const updatedCart = await Cart.findById(cart._id).populate("cartItems");
      res.status(200).json(updatedCart);
   } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: error.message });
   }
});

router.delete("/:cartId/remove-all", async (req, res) => {
   const cartId = req.params.cartId;

   try {
      // Tìm giỏ hàng theo cartId
      const cartItems = await CartItem.find({ cart: cartId });

      // Xóa các mục giỏ hàng tìm được
      for (let cartItem of cartItems) {
         await cartItem.remove();
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
         return res.status(404).json({ message: "Cart not found" });
      }

      // Xóa tất cả các mục giỏ hàng từ giỏ hàng
      cart.cartItems = [];
      await cart.save();

      res.status(200).json({
         message: "Cart items have been removed successfully.",
      });
   } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
   }
});

module.exports = router;
