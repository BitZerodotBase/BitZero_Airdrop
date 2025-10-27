document.addEventListener("DOMContentLoaded", () => {
    
    const CONTRACT_ADDRESS = "0x9b7EA0eB7051A44414c26d51c59cF72286c3f4Eb"; 

    const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_tokenAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_initialOwner",
				"type": "address"
			}
		],
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
				"name": "claimant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "AirdropClaimed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "claimAirdrop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_recipients",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_amounts",
				"type": "uint256[]"
			}
		],
		"name": "setAllocations",
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
		"inputs": [],
		"name": "withdrawUnclaimedTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "allocations",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasClaimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
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
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

    const ETH_CHAIN_ID = '0x2105';
    const ETH_PARAMS = {
      chainId: '0x2105',
      chainName: 'Base',
      nativeCurrency: {
        name: 'Base',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://base.drpc.org'],
      blockExplorerUrls: ['https://basescan.org/']
    };

    const TOKEN_DECIMALS = 18;
    const TOKEN_SYMBOL = "BIT"; 
    const TOKEN_NAME = "BitZero";

    const decimalUnits = {
        18: 'ether',
        15: 'finney',
        12: 'szabo',
        9: 'gwei',
        6: 'mwei',
        3: 'kwei',
        1: 'wei'
    };

    let web3;
    let userAddress;
    let contract;
    let isConnecting = false;

    const connectButton = document.getElementById("connectButton");
    const disconnectButton = document.getElementById("disconnectButton");
    const walletInfo = document.getElementById("walletInfo");
    const walletAddressDisplay = document.getElementById("walletAddressDisplay");
    const claimCard = document.getElementById("claimCard");
    const mainMessage = document.getElementById("mainMessage");
    const userInfo = document.getElementById("userInfo");
    const statusMessage = document.getElementById("statusMessage");
    const allocationAmount = document.getElementById("allocationAmount");
    const tokenSymbolElement = document.getElementById("tokenSymbol");
    const claimButton = document.getElementById("claimButton");
    const taskVerification = document.getElementById("taskVerification");
    const taskFollowX = document.getElementById("taskFollowX");
    const taskJoinTelegram = document.getElementById("taskJoinTelegram");
    const linkFollowX = document.getElementById("linkFollowX");
    const linkJoinTelegram = document.getElementById("linkJoinTelegram");
    const loaderContainer = document.getElementById("loaderContainer");
    const loaderText = document.getElementById("loaderText");
    const toastContainer = document.getElementById("tx-toast-container");

    if (typeof window.ethereum === "undefined" && typeof window.okxwallet === "undefined" && typeof window.bitkeep === "undefined") {
        connectButton.innerText = "Install Wallet";
        connectButton.disabled = true;
        showToast("Wallet not detected. Please install a compatible wallet.", "error");
        return;
    }

    connectButton.addEventListener("click", openWalletModal);
    disconnectButton.addEventListener("click", disconnectWallet);
    claimButton.addEventListener("click", claimTokens);
    taskFollowX.addEventListener("change", checkTaskCompletion);
    taskJoinTelegram.addEventListener("change", checkTaskCompletion);

    linkFollowX.addEventListener("click", () => {
        if(taskFollowX.disabled) {
            taskFollowX.disabled = false;
            taskFollowX.checked = true;
            showToast("Follow X task marked as complete.", "success");
            checkTaskCompletion();
        }
    });
    
    linkJoinTelegram.addEventListener("click", () => {
        if(taskJoinTelegram.disabled) {
            taskJoinTelegram.disabled = false;
            taskJoinTelegram.checked = true;
            showToast("Join Telegram task marked as complete.", "success");
            checkTaskCompletion();
        }
    });
    
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                onConnect(accounts[0]);
            } else {
                disconnectWallet();
            }
        });

        window.ethereum.on('chainChanged', (chainId) => {
            if (chainId !== ETH_CHAIN_ID) {
                showToast('Incorrect network. Please switch to Base.', 'error');
                disconnectWallet();
            } else {
                window.location.reload();
            }
        });
    }
 
    trySilentConnect();

    async function trySilentConnect() {
        if (window.ethereum && window.ethereum.selectedAddress) {
            
            if (isConnecting) return;
            isConnecting = true;
            try {
                await connectSpecificWallet(window.ethereum);
            } catch (error) {
                console.warn("Failed to perform silent connect: ", error.message);
                disconnectWallet();
            } finally {
                isConnecting = false;
            }
        }
    }

    async function switchToBaseNetwork() {
        const provider = web3.currentProvider; 
        if (!provider) return;
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ETH_CHAIN_ID }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [ETH_PARAMS],
                    });
                } catch (addError) {
                    
                    showToast('Failed to add the Base network to your wallet.', 'error');
                    throw addError;
                }
            } else {
                
                showToast('Failed to switch to the Base network. Please do it manually.', 'error');
                throw switchError;
            }
        }
    }

    async function onConnect(address) {
        userAddress = address;
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        
        updateUI(true);
        tokenSymbolElement.innerText = TOKEN_SYMBOL;
        
        await checkEligibility();
    }

    function disconnectWallet() {
        userAddress = null;
        contract = null;
        web3 = null;
        updateUI(false);
    }

    function updateUI(isConnected) {
        if (isConnected) {
            connectButton.classList.add("hidden");
            walletInfo.classList.remove("hidden");
            const formattedAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
            walletAddressDisplay.innerText = formattedAddress;
            
            mainMessage.innerText = `Checking your ${TOKEN_NAME} (${TOKEN_SYMBOL}) allocation...`;
            mainMessage.classList.remove("hidden");
            userInfo.classList.add("hidden");
            claimButton.classList.add("hidden");
            taskVerification.classList.add("hidden");

        } else {
            connectButton.classList.remove("hidden");
            walletInfo.classList.add("hidden");
            walletAddressDisplay.innerText = "";
            
            mainMessage.innerText = `Please connect your wallet to check your ${TOKEN_NAME} airdrop allocation.`;
            mainMessage.classList.remove("hidden");
            userInfo.classList.add("hidden");
            claimButton.classList.add("hidden");
            taskVerification.classList.add("hidden");
        }
    }

    async function checkEligibility() {
        if (!contract) {
             
             showToast("Error: Contract not initialized. Please reconnect.", "error");
             return;
        }
        
        showLoader(true, "Checking eligibility...");
        try {
            const hasClaimed = await contract.methods.hasClaimed(userAddress).call();
            const allocation = await contract.methods.allocations(userAddress).call();

            const unit = decimalUnits[TOKEN_DECIMALS];
            if (!unit) {
                console.error(`Unsupported TOKEN_DECIMALS: ${TOKEN_DECIMALS}. web3.js fromWei only supports specific units.`);
                showToast(`Error: Unsupported token decimals (${TOKEN_DECIMALS}).`, "error");
                return;
            }
            const formattedAllocation = web3.utils.fromWei(allocation.toString(), unit);

            mainMessage.classList.add("hidden");
            userInfo.classList.remove("hidden");
            if (hasClaimed) {
                statusMessage.innerText = "✅ Already Claimed";
                allocationAmount.innerText = formattedAllocation;
                tokenSymbolElement.innerText = TOKEN_SYMBOL;
                claimButton.classList.add("hidden");
                claimButton.disabled = true;
                taskVerification.classList.add("hidden"); 
                showToast(`You have already claimed your ${TOKEN_SYMBOL} airdrop.`, "success");
            } else if (allocation.toString() !== '0') {
                statusMessage.innerText = "You are Eligible!💙💜";
                allocationAmount.innerText = formattedAllocation;
                tokenSymbolElement.innerText = TOKEN_SYMBOL;
                taskVerification.classList.remove("hidden");
                claimButton.classList.remove("hidden");
                taskFollowX.disabled = true;
                taskJoinTelegram.disabled = true;
                taskFollowX.checked = false;
                taskJoinTelegram.checked = false;

                checkTaskCompletion();
                
                showToast(`Allocation found! Amount: ${formattedAllocation} ${TOKEN_SYMBOL}.`, "success");
            } else {
                statusMessage.innerText = "no eligible. don't worry, you can join the next phase!";
                allocationAmount.innerText = "Sorry Your Not Eligible😞";
                tokenSymbolElement.innerText = "";
                claimButton.classList.add("hidden");
                claimButton.disabled = true;
                taskVerification.classList.add("hidden"); 
                showToast(`Sorry, your address does not have a ${TOKEN_SYMBOL} allocation.`, "error");
            }

        } catch (error) {
            
            showToast("Failed to check contract data. Make sure you are on the correct network (Base).", "error");
            mainMessage.innerText = "Failed to load data. Try refreshing.";
            mainMessage.classList.remove("hidden");
            userInfo.classList.add("hidden");
        } finally {
            showLoader(false);
        }
    }

    async function claimTokens() {
        if (!web3 || !contract) {
            showToast("Please connect your wallet first.", "error");
            return;
        }

        if (taskFollowX.disabled || taskJoinTelegram.disabled || !taskFollowX.checked || !taskJoinTelegram.checked) {
            showToast("Please complete and check off all tasks to claim.", "error");
            return;
        }

        claimButton.disabled = true;
        showLoader(true, "Waiting for confirmation in your wallet...");

        try {
            const receipt = await contract.methods.claimAirdrop().send({ from: userAddress });
            showLoader(false);
            showToast(`${TOKEN_SYMBOL} Claim Successful! Tx: ${receipt.transactionHash.substring(0, 10)}...`, "success");
            statusMessage.innerText = "✅ Already Claimed";
            claimButton.classList.add("hidden");
            taskVerification.classList.add("hidden");

        } catch (error) {
            showLoader(false);
            
            
            let airdropError = "Transaction Failed.";
            if (error.code === 4001 || (error.message && error.message.includes("User denied transaction signature"))) {
                airdropError = "Transaction cancelled by user.";
            } else if (error.message) {
                airdropError = error.message; 
            }
            
            showToast(`Claim Error: ${airdropError}`, "error");
            checkTaskCompletion();
        }
    }

    function showLoader(show, text = "Processing...") {
        loaderText.innerText = text;
        if (show) {
            loaderContainer.classList.add("show");
        } else {
            loaderContainer.classList.remove("show");
        }
    }

    function showToast(message, type = "") {
        const toast = document.createElement("div");
        toast.className = `tx-toast ${type}`;
        toast.innerText = message;
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    
    
    function openWalletModal() {
        const modal = document.getElementById('walletModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    function closeWalletModal() {
        const modal = document.getElementById('walletModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
        const modal = document.getElementById('walletModal');
        if (event.target == modal) {
            closeWalletModal();
        }
    }

    async function connectMetaMask() {
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
            await connectSpecificWallet(window.ethereum);
        } else {
            showToast('MetaMask is not installed.', 'error');
            window.open('https://metamask.io/download/', '_blank');
        }
        closeWalletModal();
    }

    async function connectBitget() {
        const provider = (typeof window.ethereum !== 'undefined' && window.ethereum.isBitget) ? window.ethereum : (window.bitkeep ? window.bitkeep.ethereum : null);
        if (provider) {
            await connectSpecificWallet(provider);
        } else {
            showToast('Bitget Wallet is not installed.', 'error');
        }
        closeWalletModal();
    }

    async function connectOkx() {
        const provider = window.okxwallet || (window.ethereum && window.ethereum.isOkxWallet ? window.ethereum : null);
        if (provider) {
            await connectSpecificWallet(provider);
        } else {
            showToast('OKX Wallet is not installed.', 'error');
        }
        closeWalletModal();
    }



    async function connectRabby() {
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isRabby) {
            await connectSpecificWallet(window.ethereum);
        } else {
            showToast('Rabby Wallet is not detected.', 'error');
        }
        closeWalletModal();
    }


    async function connectSpecificWallet(provider) {
        if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
             showToast("Error: Contract Address is not set!", "error");
             return;
        }
        
        if (isConnecting) return;
        isConnecting = true;
        showLoader(true, "Connecting to wallet...");

        try {
            web3 = new Web3(provider);
            
            await provider.request({ method: 'eth_requestAccounts' });

            showLoader(true, "Switching to Base Network...");
            await switchToBaseNetwork(); 

            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                throw new Error("No accounts found. Please unlock your wallet.");
            }
            
            await onConnect(accounts[0]);

        } catch (error) {
            
            let errMsg = error.message || "Failed to connect wallet.";
            if (error.code === 4001) {
                 errMsg = "Connection request cancelled by user.";
            }
            showToast(errMsg, "error");
            disconnectWallet(); 
        } finally {
            showLoader(false); 
            isConnecting = false;
            closeWalletModal();
        }
    }

    const closeModalButton = document.getElementById('closeModalButton');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeWalletModal);
    }

    const connectMetaMaskButton = document.getElementById('connectMetaMaskButton');
    if (connectMetaMaskButton) {
        connectMetaMaskButton.addEventListener('click', connectMetaMask);
    }
    
    const connectBitgetButton = document.getElementById('connectBitgetButton');
    if (connectBitgetButton) {
        connectBitgetButton.addEventListener('click', connectBitget);
    }
    
    const connectOkxButton = document.getElementById('connectOkxButton');
    if (connectOkxButton) {
        connectOkxButton.addEventListener('click', connectOkx);
    }

    const connectRabbyButton = document.getElementById('connectRabbyButton');
    if (connectRabbyButton) {
        connectRabbyButton.addEventListener('click', connectRabby);
    }
    
    function checkTaskCompletion() {
        if (!taskFollowX.disabled && !taskJoinTelegram.disabled && taskFollowX.checked && taskJoinTelegram.checked) {
            claimButton.disabled = false;
        } else {
            claimButton.disabled = true;
        }
    }

});