const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// ✅ Transaction Routes
router.post("/transactions", transactionController.saveTransaction);
router.get("/transactions", transactionController.getAllTransactions);
router.get("/transactions/hash/:hash", transactionController.getTransactionByHash);
router.get("/transactions/sender/:sender", transactionController.getTransactionsBySender);

// ✅ Fix: Ensure `getGraphData` exists in the controller
router.get("/transactions/graph-data", transactionController.getGraphData);

module.exports = router;
