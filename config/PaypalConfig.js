const paypal = require("paypal-rest-sdk");

paypal.configure({
   mode: "sandbox", //sandbox or live
   client_id:
      "ARQhJJ-fc0MG-297CHgOKDA3veCNayYgWSfItJvL1IyrakEZZ9GO1w1bltAcYu-xvBzq0G1UvmNO0ZRv",
   client_secret:
      "EP5OoPbtIGnNQSybjm9yYsHMrQtAdyZW207R2RBEH6yCT6cNOMkX7VjuAmtEPMAr05KhgQYRqV-FTD7e",
});

module.exports = paypal;
