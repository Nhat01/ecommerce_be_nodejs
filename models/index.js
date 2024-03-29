// Import các model
const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Address = require("./Address");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const PaymentDetail = require("./PaymentDetail");
const PaymentInformation = require("./PaymentInformation");
const Rating = require("./Rating");
const Review = require("./Review");

// Export các model
module.exports = {
   User,
   Product,
   Order,
   OrderItem,
   Address,
   Cart,
   CartItem,
   PaymentDetail,
   PaymentInformation,
   Rating,
   Review,
};
