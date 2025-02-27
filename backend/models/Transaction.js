const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define("transaction", {
  sender: {
    type: DataTypes.STRING(42),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
  },
  recipientCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gasUsed: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
  },
  transactionHash: {
    type: DataTypes.STRING,
    allowNull: false, 
    unique: false,  // ✅ Ensure unique constraint is removed
  },
  transactionSpeed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  blockPropagationTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recipientAddresses: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, { timestamps: true });

module.exports = Transaction;
