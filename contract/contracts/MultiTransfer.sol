// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiTransfer is Ownable {
    event TransferExecuted(address indexed sender, uint256 totalAmount, uint256 recipientCount);

    constructor() Ownable(msg.sender) {}

    // 🟢 Function to distribute ETH
    function distributeETH(address[] calldata recipients) external payable {
        require(recipients.length > 0 && recipients.length <= 10, "Max 10 recipients allowed");
        require(msg.value > 0, "Must send ETH");

        uint256 amountPerRecipient = msg.value / recipients.length;
        uint256 remainder = msg.value % recipients.length;

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 finalAmount = amountPerRecipient + (i == 0 ? remainder : 0);
            (bool sent, ) = recipients[i].call{value: finalAmount}("");
            require(sent, "ETH Transfer failed");
        }

        emit TransferExecuted(msg.sender, msg.value, recipients.length);
    }

    // 🟢 Function to receive ETH
    receive() external payable {}
}
