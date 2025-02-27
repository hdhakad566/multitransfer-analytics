import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
// import contractABI from "./MultiTransferABI.json"; // ✅ Import ABI

const CONTRACT_ADDRESS = "0xC478e744ea423D0985d40e29A5f9a3e3c0668448"; // ✅ Use your deployed contract address

const contractABI= [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "recipientCount",
        "type": "uint256"
      }
    ],
    "name": "TransferExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      }
    ],
    "name": "distributeETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

const TOKEN_ADDRESS="0xD8E502323Fd0CE024853B11Ed7544F96Ce1BD873"
function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [recipients, setRecipients] = useState([""]);
  const [totalAmount, setTotalAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is required.");
      return;
    }
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await web3Provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      setProvider(web3Provider);
      setSigner(signer);
      setContract(contract);
      setWalletConnected(true);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const handleRecipientChange = (index, value) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index] = value;
    setRecipients(updatedRecipients);
  };

  const addRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([...recipients, ""]);
    } else {
      alert("Max 10 recipients allowed.");
    }
  };

  const sendMultiTransfer = async () => {
    if (!contract || recipients.length === 0 || totalAmount === "") return;
  
    try {
      const amountPerRecipient = ethers.parseEther((totalAmount / recipients.length).toString());
  
      // Estimate gas for the transaction
      const estimatedGas = await contract.distributeETH.estimateGas(recipients, {
        value: ethers.parseEther(totalAmount.toString()),
      });
  
      // Fix: Convert estimatedGas to BigInt and add buffer
      const gasLimit = estimatedGas + BigInt(50000); // ✅ Fixed BigInt addition
  
      const startTime = Date.now(); // Track start time
  
      // Send transaction
      const tx = await contract.distributeETH(recipients, {
        value: ethers.parseEther(totalAmount.toString()),
        gasLimit: gasLimit, // ✅ Use BigInt gas limit
      });
  
      await tx.wait();
  
      const endTime = Date.now(); // Track end time
      const blockPropagationTime = (endTime - startTime) / 1000; // Convert to seconds
  
      // Get transaction receipt
      const receipt = await signer.provider.getTransactionReceipt(tx.hash); // ✅ Fix: Use `signer.provider`
      const gasUsed = receipt.gasUsed.toString(); // Convert BigInt to string
  
      // Prepare data to send to backend
      const transactionData = {
        sender: await signer.getAddress(),
        totalAmount: parseFloat(totalAmount),
        recipientCount: recipients.length,
        gasUsed: gasUsed, // ✅ Send as string
        transactionHash: tx.hash,
        transactionSpeed: "Fast", // You can calculate based on gas price later
        blockPropagationTime: blockPropagationTime.toFixed(2) + "s",
        recipientAddresses: recipients,
      };
  
      console.log("Sending transaction data to backend:", transactionData);
  
      // Send transaction details to backend
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
  
      const result = await response.json();
      console.log("Backend response:", result);
  
      alert("Transaction successful!");
      setTransactionHash(tx.hash);
  
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed!");
    }
  };
  
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Blockchain Multi-Transfer</h1>
      {!walletConnected ? (
        <button onClick={connectWallet} className="bg-blue-500 px-4 py-2 rounded">Connect Wallet</button>
      ) : (
        <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Enter Recipients & Amount</h2>
          <input
            type="number"
            placeholder="Total Amount (ETH)"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded mb-2"
          />
          {recipients.map((recipient, index) => (
            <input
              key={index}
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => handleRecipientChange(index, e.target.value)}
              className="w-full p-2 bg-gray-700 rounded mb-2"
            />
          ))}
          {recipients.length < 10 && (
            <button onClick={addRecipient} className="mt-2 bg-green-500 px-3 py-1 rounded">+ Add Recipient</button>
          )}
          <button onClick={sendMultiTransfer} className="mt-4 bg-purple-500 px-4 py-2 w-full rounded">Send Multi-Transfer</button>
          {transactionHash && (
            <p className="mt-4 text-green-400">✅ Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="underline">{transactionHash.slice(0, 10)}...</a></p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;