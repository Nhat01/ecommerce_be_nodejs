const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const paypal = require("../config/PaypalConfig");
const moment = require("moment");
const querystring = require("qs");
const crypto = require("crypto");
let config = require("../config/vnpayConfig.json");
const { User, Cart } = require("../models");
const { authenticateJWT } = require("../middleware/jwt");

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

router.get("/payment/:orderId", authenticateJWT, async (req, res) => {
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
               const user = await User.findOne({ email: req.user.email });
               const cart = await Cart.findOne({ user: user._id });
               cart.cartItems = [];
               await cart.save();
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

router.post(
   "/payments/create_payment_url/:orderId",
   async function (req, res, next) {
      process.env.TZ = "Asia/Ho_Chi_Minh";
      const response = {};
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr =
         req.headers["x-forwarded-for"] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;

      let tmnCode = config.vnp_TmnCode;
      let secretKey = config.vnp_HashSecret;
      let vnpUrl = config.vnp_Url;
      let returnUrl = config.vnp_ReturnUrl;
      let orderId = req.params.orderId;
      const order = await Order.findById(orderId).populate("orderItems");
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }
      let amount = order.totalPrice;
      //let bankCode = "VNBANK";

      let locale = "vn";
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = order.totalDiscountedPrice * 25.46 * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl + orderId;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      // if (bankCode !== null && bankCode !== "") {
      //    vnp_Params["vnp_BankCode"] = bankCode;
      // }

      vnp_Params = sortObject(vnp_Params);
      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      console.log(
         "log: ",
         querystring.stringify(vnp_Params, { encode: false })
      );

      response.link_payment = vnpUrl;
      res.status(200).send(response);
   }
);

router.get("/payment/vnpay/success/:orderId", async function (req, res, next) {
   let vnp_Params = req.query;
   let orderId = req.params.orderId;
   console.log(orderId);
   try {
      const order = await Order.findById(orderId);
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      let secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);

      let config = require("../config/vnpayConfig.json");
      let tmnCode = config.get("vnp_TmnCode");
      let secretKey = config.get("vnp_HashSecret");

      let querystring = require("qs");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
         //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

         response.message = "Order placed";
         res.status(200).json(response);
      } else {
         res.redirect("http://localhost:3000/payment/cancel");
      }
   } catch (error) {
      console.error("Error executing payment:", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

// Function to sort object properties alphabetically
function sortObject(obj) {
   let sorted = {};
   let str = [];
   let key;
   for (key in obj) {
      if (obj.hasOwnProperty(key)) {
         str.push(encodeURIComponent(key));
      }
   }
   str.sort();
   for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
   }
   return sorted;
}
module.exports = router;
