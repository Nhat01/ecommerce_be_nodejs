const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const adminProductRoute = require("./routes/adminProduct");
const cartRoute = require("./routes/cart");
const cartItemRoute = require("./routes/cartItem");
const orderRoute = require("./routes/order");
const adminOrderRoute = require("./routes/adminOrder");
const ratingRoute = require("./routes/rating");
const reviewRoute = require("./routes/review");
const paymentRoute = require("./routes/payment");
const categoryRoute = require("./routes/category");
const adminUserRoute = require("./routes/adminUser");
const { authenticateAdmin } = require("./middleware/jwt");

var cors = require("cors");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
// Kết nối tới cơ sở dữ liệu MongoDB
mongoose
   .connect(process.env.MONGO_URL, null)
   .then(() => {
      console.log("Connected to MongoDB");
      // Bắt đầu lắng nghe các yêu cầu HTTP sau khi kết nối thành công
      app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
      });
   })
   .catch((err) => console.error("Error connecting to MongoDB:", err));

// Middleware để phân tích các yêu cầu HTTP
app.use(express.json());
app.use(
   cors({
      origin: "http://localhost:3000",
      credentials: true,
   })
);
// Các route khác có thể được định nghĩa tương tự cho các mô hình khác
app.use("/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/admin/products", authenticateAdmin, adminProductRoute);
app.use("/api/cart", cartRoute);
app.use("/api/cartItem", cartItemRoute);
app.use("/api/orders", orderRoute);
app.use("/api/admin/orders", authenticateAdmin, adminOrderRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/ratings", ratingRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/admin/users", authenticateAdmin, adminUserRoute);
app.use("/api", paymentRoute);

// Middleware xử lý lỗi nếu route không tồn tại
app.use((req, res, next) => {
   res.status(404).json({ message: "Route not found" });
});

// Middleware xử lý lỗi nếu có lỗi xảy ra trong quá trình xử lý các yêu cầu
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ message: "Internal server error" });
});
