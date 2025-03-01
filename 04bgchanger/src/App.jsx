import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { useRef } from "react";


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


  const [walletAddress, setWalletAddress] = useState(null);
const [balance, setBalance] = useState(null);
const [network, setNetwork] = useState(null);


  const [graphUrl, setGraphUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
        window.ethereum.on("chainChanged", () => {
            connectWallet(); // Reconnect wallet when network changes
        });
    }
}, []);


  const connectWallet = async () => {
    if (!window.ethereum) {
        alert("MetaMask is required.");
        return;
    }
    try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress(); // Get user address
        const balance = await web3Provider.getBalance(address); // Get balance
        const network = await web3Provider.getNetwork(); // Get network info

        setWalletAddress(address);
        setBalance(ethers.formatEther(balance)); // Convert balance to ETH
        setNetwork(network.name); // Store network name

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

  const isProcessing = useRef(false);
  const sendMultiTransfer = async () => {
    if (!contract || recipients.length === 0 || totalAmount === "" || isProcessing.current) return;

    isProcessing.current = true; // ✅ Lock function to prevent multiple calls

    try {
        const amountPerRecipient = ethers.parseEther((Number(totalAmount) / recipients.length).toFixed(18));

        const estimatedGas = await contract.distributeETH.estimateGas(recipients, {
            value: ethers.parseEther(Number(totalAmount).toFixed(18)),
        });

        const gasLimit = estimatedGas + BigInt(50000);

        const startTime = Date.now();

        const tx = await contract.distributeETH(recipients, {
            value: ethers.parseEther(Number(totalAmount).toFixed(18)),
            gasLimit: gasLimit,
        });

        await tx.wait();

        const endTime = Date.now();
        const blockPropagationTime = (endTime - startTime) / 1000;

        const receipt = await signer.provider.getTransactionReceipt(tx.hash);
        const gasUsed = receipt.gasUsed.toString();

        const transactionData = {
            sender: await signer.getAddress(),
            totalAmount: parseFloat(totalAmount),
            recipientCount: recipients.length,
            gasUsed: gasUsed,
            transactionHash: tx.hash,
            transactionSpeed: "Fast",
            blockPropagationTime: blockPropagationTime.toFixed(2) + "s",
            recipientAddresses: recipients,
        };

        console.log("Sending transaction data to backend:", transactionData);

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
    } finally {
        isProcessing.current = false; // ✅ Unlock function after completion
    }
};


const generateGraph = async () => {
  try {
      const response = await fetch("http://localhost:5000/api/generate-graph");
      const data = await response.json();

      if (data.error) {
          console.error("Graph generation failed:", data.error);
          return;
      }

      setGraphUrl(data.graphUrl); // Update state to show the image
  } catch (error) {
      console.error("Graph generation failed:", error);
  }
};


return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 relative">
    {/* Background Image with Overlay */}
    <div className="absolute inset-0 bg-[url('/blockchain-bg.jpg')] bg-cover bg-center opacity-40"></div>
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>

    {/* Main Content */}
    <div className="relative z-10 w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg backdrop-blur-md border border-gray-700">
      <h1 className="text-3xl font-bold text-blue-400 mb-4 text-center animate-pulse">
      Decentralized Fund Distributor
      </h1>
      {!walletConnected ? (
        <button 
          onClick={connectWallet} 
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded transition duration-300 transform hover:scale-105 shadow-md animate-pulse"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          {/* Wallet Details Section */}
          <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg shadow-md border border-gray-600">
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Connected Wallet Details</h2>
            <p className="flex items-center gap-2">
              <strong>Address:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              <button 
                onClick={() => navigator.clipboard.writeText(walletAddress)} 
                className="ml-2 bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs"
              >
                Copy
              </button>
            </p>
            <p><strong>Balance:</strong> {balance} ETH</p>
            <p><strong>Network:</strong> {network}</p>
          </div>

          {/* Recipients and Amount Section */}
          <h2 className="text-xl font-semibold mt-4 text-gray-200">Enter Recipients & Amount</h2>
          <input
            type="number"
            placeholder="Total Amount (ETH)"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {recipients.map((recipient, index) => (
            <input
              key={index}
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => handleRecipientChange(index, e.target.value)}
              className="w-full p-2 bg-gray-700 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
          {recipients.length < 10 && (
            <button 
              onClick={addRecipient} 
              className="mt-2 bg-green-500 hover:bg-green-600 px-3 py-1 rounded transition duration-300 transform hover:scale-105"
            >
              + Add Recipient
            </button>
          )}

          {/* Multi-Transfer Button */}
          <button 
            onClick={sendMultiTransfer} 
            className="mt-4 w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 py-2 rounded transition duration-300 transform hover:scale-105"
          >
            Distribute Funds Securely
          </button>

          {/* Transaction Hash & Generate Graph */}
          {transactionHash && (
            <> 
              <p className="mt-4 text-green-400">Blockchain Activity Log: 
                <a 
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:text-green-300"
                >
                  {transactionHash.slice(0, 10)}...
                </a>
              </p>
              <button 
                onClick={generateGraph} 
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded transition duration-300 transform hover:scale-105"
              >
                Generate Graph
              </button>
            </>
          )}

          {/* Transaction Graph Display */}
          {graphUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-300">Blockchain Performance Metrics:</h3>
              <img src={graphUrl} alt="Generated Graph" className="mt-2 rounded-lg shadow-lg border border-gray-600" />
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

};

export default App;
