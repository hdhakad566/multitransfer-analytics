import { useState } from "react";
import { ethers } from "ethers";

const WalletConnect = ({ setAccount }) => {
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask not detected!");
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setAccount(account);
    };

    return (
        <button onClick={connectWallet} className="bg-blue-500 text-white p-2 rounded">
            Connect Wallet
        </button>
    );
};

export default WalletConnect;
