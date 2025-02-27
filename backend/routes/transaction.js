const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

// ✅ Transaction Routes
router.post("/transactions", transactionController.saveTransaction);
router.get("/transactions", transactionController.getAllTransactions);
router.get("/transactions/hash/:hash", transactionController.getTransactionByHash);
router.get("/transactions/sender/:sender", transactionController.getTransactionsBySender);

module.exports = router;
