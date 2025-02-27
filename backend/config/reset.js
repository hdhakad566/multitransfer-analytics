const sequelize = require("./config/database");

async function resetDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log("✅ Transactions table recreated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
