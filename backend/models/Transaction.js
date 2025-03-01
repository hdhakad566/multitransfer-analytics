const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define("Transaction", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    recipientCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gasUsed: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    transactionHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // ✅ Prevents duplicate transactions
    },
    transactionSpeed: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    blockPropagationTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    recipientAddresses: {
        type: DataTypes.JSON, // ✅ Store as JSON array
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Transaction;
