import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../config";  // Import ABI
import contractAddress from "../config";

const TransferForm = ({ account }) => {
    const [recipients, setRecipients] = useState("");
    const [amount, setAmount] = useState("");

    const handleTransfer = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const recipientList = recipients.split(",").map((addr) => addr.trim());

        try {
            const tx = await contract.distributeTokens(process.env.ERC20_TOKEN, recipientList, ethers.utils.parseUnits(amount, 18));
            await tx.wait();
            alert("Transfer successful!");
        } catch (error) {
            console.error("Transfer failed:", error);
        }
    };

    return (
        <div>
            <input type="text" placeholder="Recipient Addresses (comma separated)" onChange={(e) => setRecipients(e.target.value)} />
            <input type="text" placeholder="Total Amount" onChange={(e) => setAmount(e.target.value)} />
            <button onClick={handleTransfer} className="bg-green-500 text-white p-2 rounded">Send Tokens</button>
        </div>
    );
};

export default TransferForm;
