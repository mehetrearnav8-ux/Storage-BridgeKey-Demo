import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { DEFAULT_CONTRACT_ADDRESS, STORAGE_ABI } from './config.js';

export function App() {
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [storeNumber, setStoreNumber] = useState('');
  const [status, setStatus] = useState('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayValue, setDisplayValue] = useState('-');
  const [isReadingState, setIsReadingState] = useState(false);

  const readContractValue = async (targetAddress = contractAddress) => {
    const addr = targetAddress || contractAddress;
    if (!addr || !addr.startsWith('0x') || addr.length !== 42) {
      setStatus('Please enter a valid contract address');
      return;
    }

    setIsReadingState(true);
    setStatus('Reading contract state...');

    const injected = window.bridgekey || window.bridgeKey || window.BridgeKey || window.ethereum;

    if (injected) {
      try {
        const provider = new ethers.BrowserProvider(injected);
        const contract = new ethers.Contract(addr, STORAGE_ABI, provider);
        const val = await contract.retrieve();
        setDisplayValue(val.toString());
        setStatus(`Retrieved value: ${val.toString()}`);
      } catch (err) {
        console.error(err);
        setStatus('Read Error: Could not read from contract');
      } finally {
        setIsReadingState(false);
      }
    } else {
      setStatus('No wallet provider detected. Please connect your wallet.');
      setIsReadingState(false);
    }
  };

  const handleStore = async (e) => {
    e.preventDefault();
    if (!storeNumber) {
      setStatus('Please enter a number to store');
      return;
    }

    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      setStatus('Please enter a valid 42-character Ethereum contract address');
      return;
    }

    const injected = window.bridgekey || window.bridgeKey || window.BridgeKey || window.ethereum;
    if (!injected) {
      setStatus('Please connect your Web3 wallet first');
      return;
    }

    setIsProcessing(true);
    setStatus('Please confirm transaction in your wallet...');

    try {
      const provider = new ethers.BrowserProvider(injected);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, STORAGE_ABI, signer);
      const tx = await contract.store(BigInt(storeNumber));
      
      const shortHash = tx.hash ? `${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 4)}` : 'Submitted';
      setStatus(`Transaction Sent: ${shortHash}! Stored ${storeNumber}.`);
      setStoreNumber('');
    } catch (err) {
      console.error(err);
      setStatus('Transaction Error: ' + (err.reason || err.message || 'Rejected in wallet'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Storage Smart Contract</h1>
        {/* Wallet Connect */}
        <ConnectButton showBalance={false} />
      </header>

      <main className="main-content">
        <div className="card">
          <label htmlFor="contract-address">Contract Address</label>
          <input
            type="text"
            id="contract-address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="card">
          <h2>Store Number</h2>
          <form onSubmit={handleStore} className="form-group">
            <input
              type="number"
              value={storeNumber}
              onChange={(e) => setStoreNumber(e.target.value)}
              placeholder="Enter number to store"
            />
            <button type="submit" disabled={isProcessing} className="btn btn-primary">
              {isProcessing ? 'Processing...' : 'Store'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Retrieve Stored Number</h2>
          <div className="retrieve-group">
            <button onClick={() => readContractValue(contractAddress)} disabled={isReadingState} className="btn btn-primary">
              {isReadingState ? 'Reading...' : 'Retrieve'}
            </button>
            <div className="result-box">
              <span>Stored Value:</span>
              <strong>{displayValue}</strong>
            </div>
          </div>
        </div>

        <div className="status-bar" id="status-bar">
          Status: {status}
        </div>
      </main>
    </div>
  );
}
