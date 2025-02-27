require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // ✅ Load environment variables

console.log("ALCHEMY_URL:", process.env.ALCHEMY_URL); // Debugging

module.exports = {
    solidity: "0.8.20",
    networks: {
        sepolia: {
            url: process.env.ALCHEMY_URL || "", // ✅ Ensure this is NOT empty
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // ✅ Ensure private key is loaded
            gasPrice: 8000000000,
        },
    },
};
