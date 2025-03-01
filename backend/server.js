const express = require("express");
const cors = require("cors");
const transactionRoutes = require("./routes/transaction");
const graphRoutes = require("./routes/graph"); // Import graph route
const sequelize = require("./config/database");
const path = require("path");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// ✅ Serve graph image statically
// app.use("/graph", express.static(path.join(__dirname, "graph")));

app.use("/graph", express.static(path.join(__dirname, "../graph")));

app.use("/api", transactionRoutes);
app.use("/api", graphRoutes); // ✅ Add graph routes

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully!");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((error) => console.error("❌ Database connection error:", error));
