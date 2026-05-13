# Arc Network Contract Deployment Website

This repository contains a simple static website for deploying smart contracts to Arc Testnet.

## Files

- `index.html` — main web interface
- `styles.css` — page styling
- `script.js` — wallet connection and contract deployment logic

## Usage

1. Open `index.html` in a browser with a Web3 wallet installed (MetaMask or compatible wallet).
2. Click **Connect Wallet** and approve access.
3. If needed, click **Switch to Arc Testnet** to add the chain configuration.
4. Paste the compiled contract's ABI and bytecode.
5. Enter constructor arguments as a JSON array if required.
6. Click **Deploy Contract** and confirm the transaction in your wallet.

## Arc Testnet details

- RPC: `https://rpc.testnet.arc.network`
- Chain ID: `5079826`
- Wallet address preset: `0xa84e8ac49f6eea4fec824c8da492875242e1eb09`

> Note: This website does not compile Solidity contracts. You need compiled bytecode and ABI from a Solidity toolchain before deployment.
