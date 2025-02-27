const hre = require("hardhat");

async function main() {
    const MultiTransfer = await hre.ethers.getContractFactory("MultiTransfer");
    const contract = await MultiTransfer.deploy(); // Deploy contract

    await contract.waitForDeployment(); // ✅ Correct method instead of `deployed()`

    console.log(`Contract deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
