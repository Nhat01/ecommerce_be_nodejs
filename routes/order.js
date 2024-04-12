const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/jwt");
const { User, Address, OrderItem, Order, Cart } = require("../models/index");

// Create Order
router.post("/", authenticateJWT, async (req, res) => {
   try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ error: "User not found" });
      }

      const {
         firstName,
         lastName,
         streetAddress,
         city,
         state,
         zipCode,
         mobile,
         _id,
      } = req.body;

      if (
         !firstName ||
         !lastName ||
         !streetAddress ||
         !city ||
         !state ||
         !zipCode ||
         !mobile
      ) {
         return res.status(400).json({ error: "Invalid shipping address" });
      }
      if (!_id) {
         const address = new Address({
            firstName,
            lastName,
            streetAddress,
            city,
            state,
            zipCode,
            mobile,
            user: user._id, // Assign the user ID to the address
         });
         await address.save();
         user.address.push(address._id);
         await user.save();
      }

      const cart = await Cart.findOne({ user: user._id }).populate("cartItems");
      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
         return res.status(400).json({ error: "Cart is empty" });
      }

      let totalPrice = 0;
      let totalDiscountedPrice = 0;
      let totalItem = 0;
      const orderItems = [];

      for (const cartItem of cart.cartItems) {
         const orderItem = new OrderItem({
            price: cartItem.price,
            quantity: cartItem.quantity,
            discountedPrice: cartItem.discountedPrice,
            product: cartItem.product,
            userId: cartItem.userId,
            size: cartItem.size,
         });
         await orderItem.save(); // Save order item
         orderItems.push(orderItem._id); // Push order item ID to orderItems array

         totalPrice += cartItem.price * cartItem.quantity;
         totalDiscountedPrice += cartItem.discountedPrice * cartItem.quantity;
         totalItem += cartItem.quantity;
      }

      const order = new Order({
         orderItems,
         discount: totalPrice - totalDiscountedPrice,
         user: user._id, // Assign the user ID to the order
         totalDiscountedPrice,
         totalPrice,
         totalItem,
         shippingAddress: _id, // Assign the address ID to the order
         orderStatus: "PENDING",
         orderDate: new Date(),
         paymentDetails: { status: "PENDING" },
      });

      await order.save(); // Save the order

      res.status(201).json(order);
   } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Get User's Order History
router.get("/user", authenticateJWT, async (req, res) => {
   try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      const orders = await Order.find({ user: user._id })
         .populate("shippingAddress")
         .populate({
            path: "orderItems",
            populate: {
               path: "product",
            },
         });
      res.status(200).json(orders);
   } catch (error) {
      console.error("Error fetching user's order history:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Find Order By ID
router.get("/:id", authenticateJWT, async (req, res) => {
   try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId)
         .populate("shippingAddress")
         .populate({
            path: "orderItems",
            populate: {
               path: "product",
            },
         });
      if (!order) {
         return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(order);
   } catch (error) {
      console.error("Error fetching order by ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
