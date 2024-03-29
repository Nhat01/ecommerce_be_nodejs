const jwt = require("jsonwebtoken");
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

module.exports = { generateToken, authenticateJWT };
