const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const paypal = require("../config/PaypalConfig");

router.post("/payments/:orderId", async (req, res) => {
   const orderId = req.params.orderId;
   const response = {};
   try {
      const order = await Order.findById(orderId).populate("orderItems");
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      const createPaymentJson = {
         intent: "sale",
         payer: {
            payment_method: "paypal",
         },
         redirect_urls: {
            return_url: `http://localhost:3000/payment/${orderId}`,
            cancel_url: `http://localhost:3000/payment/cancel/${orderId}`,
         },
         transactions: [
            {
               item_list: {
                  items: order.orderItems.map((item) => {
                     return {
                        name: item.product.title,
                        sku: item.product.sku,
                        price: item.price,
                        currency: "USD",
                        quantity: item.quantity,
                     };
                  }),
               },
               amount: {
                  currency: "USD",
                  total: order.totalPrice,
               },
               description: "Payment for Order #" + order._id,
            },
         ],
      };

      paypal.payment.create(createPaymentJson, function (error, payment) {
         if (error) {
            throw error;
         } else {
            console.log(payment);
            for (let i = 0; i < payment.links.length; i++) {
               if (payment.links[i].rel === "approval_url") {
                  response.link_payment = payment.links[i].href;
                  res.status(200).send(response);
               }
            }
         }
      });
   } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/payment/:orderId", async (req, res) => {
   const orderId = req.params.orderId;
   const payerId = req.query.PayerID;
   const paymentId = req.query.paymentId;
   const response = {};
   try {
      const order = await Order.findById(orderId);
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      const execute_payment_json = {
         payer_id: payerId,
         transactions: [
            {
               amount: {
                  currency: "USD",
                  total: order.totalPrice,
               },
            },
         ],
      };

      paypal.payment.execute(
         paymentId,
         execute_payment_json,
         async function (error, payment) {
            if (error) {
               throw error;
            } else {
               response.message = "Order placed";
               res.status(200).json(response);
            }
         }
      );
   } catch (error) {
      console.error("Error executing payment:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/payment/cancel/:orderId", async (req, res) => {
   // Handle payment cancellation
   res.redirect("http://localhost:3000/payment/cancel");
});

module.exports = router;
