const Transaction = require("../models/Transaction");

// ✅ Save transaction data
exports.saveTransaction = async (req, res) => {
  try {
    const {
      sender,
      totalAmount,
      recipientCount,
      gasUsed,
      transactionHash,
      transactionSpeed,
      blockPropagationTime,
      recipientAddresses,
    } = req.body;

    // ✅ Save transaction in DB
    const transaction = await Transaction.create({
      sender,
      totalAmount,
      recipientCount,
      gasUsed,
      transactionHash,
      transactionSpeed,
      blockPropagationTime,
      recipientAddresses,
    });
    console.log("📩 Received transaction data:", req.body); // ✅ Log request data

    const transactionD = await Transaction.create(req.body);

    console.log("✅ Transaction saved:", transactionD);

    res.status(201).json({ success: true, message: "Transaction saved!", transaction });
  } catch (error) {
    console.error("Save Transaction Error:", error);
    res.status(500).json({ success: false, error: "Failed to save transaction" });
  }
};

// ✅ Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// ✅ Get transaction by hash
exports.getTransactionByHash = async (req, res) => {
  try {
    const { hash } = req.params;
    const transaction = await Transaction.findOne({ where: { transactionHash: hash } });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Get Transaction by Hash Error:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};

// ✅ Get transactions by sender address
exports.getTransactionsBySender = async (req, res) => {
  try {
    const { sender } = req.params;
    const transactions = await Transaction.findAll({ where: { sender } });

    res.json(transactions);
  } catch (error) {
    console.error("Get Transactions by Sender Error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
