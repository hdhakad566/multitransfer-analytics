const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transaction"); // Import transaction routes
const sequelize = require("./config/database"); // Import DB connection

const app = express();

// Middleware
app.use(express.json());

// ✅ Fix: Proper CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Use transaction routes
app.use("/api", transactionRoutes);

// ✅ Sync database before starting server
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
    return sequelize.sync(); // Ensure tables are created
  })
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((error) => console.error("❌ Database connection error:", error));
