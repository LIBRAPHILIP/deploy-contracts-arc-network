const connectWalletButton = document.getElementById('connectWalletButton');
const switchChainButton = document.getElementById('switchChainButton');
const deployButton = document.getElementById('deployButton');
const currentAccountInput = document.getElementById('currentAccount');
const currentChainInput = document.getElementById('currentChain');
const statusMessage = document.getElementById('statusMessage');
const txHashOutput = document.getElementById('txHash');
const contractAddressOutput = document.getElementById('contractAddress');
const contractAbiInput = document.getElementById('contractAbi');
const contractBytecodeInput = document.getElementById('contractBytecode');
const constructorArgsInput = document.getElementById('constructorArgs');

const ARC_TESTNET_CHAIN_ID = '0x4cef52';
const ARC_TESTNET_CHAIN_ID_DECIMAL = 5079826;
const ARC_TESTNET_RPC = 'https://rpc.testnet.arc.network';
const ARC_WALLET_ADDRESS = '0xa84e8ac49f6eea4fec824c8da492875242e1eb09';

let connectedAddress = null;
let provider = new ethers.providers.JsonRpcProvider(ARC_TESTNET_RPC);
let signer = null;

function setStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? '#047857' : '#111827';
}

function updateDeploymentState() {
  const isConnected = Boolean(connectedAddress);
  const onRightChain = currentChainInput.value.includes('Arc Testnet');
  deployButton.disabled = !(isConnected && onRightChain);
}

async function connectWallet() {
  if (!window.ethereum) {
    setStatus('No browser wallet detected. Install MetaMask or a compatible wallet.', 'error');
    return;
  }

  try {
    const ethProvider = new ethers.BrowserProvider(window.ethereum);
    await ethProvider.send('eth_requestAccounts', []);
    const accounts = await ethProvider.listAccounts();
    connectedAddress = accounts[0]?.address || null;
    signer = await ethProvider.getSigner();

    if (connectedAddress) {
      currentAccountInput.value = connectedAddress;
      setStatus('Wallet connected. Verify the network and deploy your contract.');
    } else {
      currentAccountInput.value = 'No account selected';
      setStatus('Connected to wallet, but no account is selected.', 'error');
    }

    const network = await ethProvider.getNetwork();
    currentChainInput.value = `Chain ${network.chainId} (${network.name ?? 'unknown'})`;

    if (network.chainId !== ARC_TESTNET_CHAIN_ID_DECIMAL) {
      setStatus('Wallet is connected to the wrong chain. Switch to Arc Testnet.', 'error');
    }

    if (connectedAddress?.toLowerCase() !== ARC_WALLET_ADDRESS.toLowerCase()) {
      setStatus(`Connected address differs from preset address ${ARC_WALLET_ADDRESS}.`, 'error');
    }
  } catch (error) {
    setStatus(`Wallet connect failed: ${error.message || error}`, 'error');
  }

  updateDeploymentState();
}

async function switchChain() {
  if (!window.ethereum) {
    setStatus('No browser wallet detected. Install MetaMask or a compatible wallet.', 'error');
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: ARC_TESTNET_CHAIN_ID,
        chainName: 'Arc Testnet',
        nativeCurrency: {
          name: 'Test USDC',
          symbol: 'USDC',
          decimals: 6,
        },
        rpcUrls: [ARC_TESTNET_RPC],
        blockExplorerUrls: ['https://testnet.arcscan.app'],
      }],
    });
    setStatus('Requested Arc Testnet connection. Confirm the wallet prompt.', 'success');
    await connectWallet();
  } catch (error) {
    setStatus(`Switch chain failed: ${error.message || error}`, 'error');
  }
}

async function deployContract() {
  const bytecode = contractBytecodeInput.value.trim();
  if (!bytecode) {
    setStatus('Please paste contract bytecode before deploying.', 'error');
    return;
  }

  let abi = [];
  try {
    const abiText = contractAbiInput.value.trim();
    abi = abiText ? JSON.parse(abiText) : [];
  } catch (error) {
    setStatus('ABI must be valid JSON.', 'error');
    return;
  }

  let constructorArgs = [];
  try {
    const argsText = constructorArgsInput.value.trim();
    constructorArgs = argsText ? JSON.parse(argsText) : [];
    if (!Array.isArray(constructorArgs)) {
      throw new Error('Constructor arguments must be a JSON array.');
    }
  } catch (error) {
    setStatus(`Constructor args error: ${error.message}`, 'error');
    return;
  }

  if (!signer) {
    setStatus('Connect your wallet before deploying.', 'error');
    return;
  }

  try {
    setStatus('Deploying contract... please confirm the transaction in your wallet.');
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(...constructorArgs);

    txHashOutput.textContent = contract.deployTransaction.hash;
    setStatus('Transaction submitted. Waiting for confirmation...');

    await contract.deployed();
    contractAddressOutput.textContent = contract.target;
    setStatus('Contract deployed successfully!', 'success');
  } catch (error) {
    setStatus(`Deployment failed: ${error.message || error}`, 'error');
  }
}

function initialize() {
  currentAccountInput.value = 'Not connected';
  currentChainInput.value = 'Unknown';
  setStatus('Ready to deploy. Connect your wallet to begin.');
  connectWalletButton.addEventListener('click', connectWallet);
  switchChainButton.addEventListener('click', switchChain);
  deployButton.addEventListener('click', deployContract);
}

initialize();
