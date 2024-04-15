const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const { SECRET_KEY } = process.env;

function generateToken(email) {
   return jwt.sign({ email }, SECRET_KEY, { expiresIn: "10d" });
}

function authenticateJWT(req, res, next) {
   const token = req.headers?.authorization?.split(" ")[1];
   if (token) {
      jwt.verify(token, SECRET_KEY, (err, user) => {
         if (err) {
            return res.sendStatus(403);
         }
         req.user = user;
         next();
      });
   } else {
      res.sendStatus(401);
   }
}

function authenticateAdmin(req, res, next) {
   const token = req.headers?.authorization?.split(" ")[1];
   if (token) {
      jwt.verify(token, SECRET_KEY, async (err, result) => {
         if (err) {
            return res.sendStatus(403);
         }
         let user = await User.findOne({ email: result.email });
         // Check if user has admin role
         if (user.role === "Admin" || user.role === "Seller") {
            req.user = user;
            next();
         } else {
            return res
               .status(401)
               .json({ message: "You do not have admin or seller role" });
         }
      });
   } else {
      res.sendStatus(401);
   }
}

module.exports = { generateToken, authenticateJWT, authenticateAdmin };
