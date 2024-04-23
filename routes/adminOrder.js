const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/jwt");
const Order = require("../models/Order");

// Get all orders
router.get("/", authenticateJWT, async (req, res) => {
   try {
      const orders = await Order.find().populate({
         path: "orderItems",
         populate: {
            path: "product",
            select: "imageUrl title", // Chỉ lấy trường imageUrl của sản phẩm
         },
      });
      res.status(200).json(orders);
   } catch (error) {
      console.error("Error getting all orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Confirm order
router.put("/:orderId/confirmed", authenticateJWT, async (req, res) => {
   try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndUpdate(
         orderId,
         { orderStatus: "CONFIRMED" },
         { new: true }
      );
      if (!order) {
         return res.status(404).json({ error: "Order not found" });
      }
      console.log(order);
      res.status(200).json(order);
   } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Ship order
router.put("/:orderId/ship", authenticateJWT, async (req, res) => {
   try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndUpdate(
         orderId,
         { orderStatus: "SHIPPED" },
         { new: true }
      );
      if (!order) {
         return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(order);
   } catch (error) {
      console.error("Error shipping order:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Deliver order
router.put("/:orderId/deliver", authenticateJWT, async (req, res) => {
   try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndUpdate(
         orderId,
         { orderStatus: "DELIVERED" },
         { new: true }
      );
      if (!order) {
         return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(order);
   } catch (error) {
      console.error("Error delivering order:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Cancel order
router.put("/:orderId/cancel", authenticateJWT, async (req, res) => {
   try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndUpdate(
         orderId,
         { orderStatus: "CANCELLED" },
         { new: true }
      );
      if (!order) {
         return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json(order);
   } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Delete order
router.delete("/:orderId/delete", authenticateJWT, async (req, res) => {
   try {
      const orderId = req.params.orderId;
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
         return res.status(404).json({ error: "Order not found" });
      }
      res.status(200).json({
         message: "Order deleted successfully",
         status: true,
      });
   } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
