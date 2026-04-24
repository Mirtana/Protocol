let swapContract;
let currentBuyBackPriceWei = 0n;


async function initSwap() {
    try {
        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);
        const swapAddress = CONTRACT_CONFIG[chainId]?.SWAP_ADDRESS;

        if (swapAddress && swapAddress !== "0x0000000000000000000000000000000000000000") {
            
            swapContract = new ethers.Contract(swapAddress, SWAP_ABI, signer);
            
            await fetchSwapPrice();
        } else {
            console.warn("Swap address not found for this network");
        }
    } catch (e) {
        console.error("Failed to init swap:", e);
    }
}

async function fetchSwapPrice() {
    if (!swapContract) return;
    try {
        currentBuyBackPriceWei = await swapContract.buyBackPrice();
        const priceEth = ethers.formatUnits(currentBuyBackPriceWei, 18);
        
        const displayElement = document.getElementById('currentBuybackPrice');
        if (displayElement) {
            displayElement.innerText = priceEth;
        }
    } catch (e) {
        console.error("Error fetching price:", e);
    }
}

function updateSwapReturn() {
    const amountInput = document.getElementById('swapAmountMirta').value;
    const outputField = document.getElementById('ethReceiveEstimate');
    
    if (!/^\d*\.?\d+$/.test(amountInput) || Number(amountInput) <= 0 || currentBuyBackPriceWei === 0n) {
        if (outputField) outputField.value = "0.0";
        return;
    }

    try {
        const amountWei = ethers.parseUnits(amountInput, 18);
        const totalReturnWei = (amountWei * currentBuyBackPriceWei) / ethers.parseUnits("1", 18);
        
        if (outputField) {
            const formatted = ethers.formatUnits(totalReturnWei, 18);
            outputField.value = parseFloat(formatted).toFixed(6);
        }
    } catch (e) {
        if (outputField) outputField.value = "Error";
    }
}

async function swapMirta() {
    const amountInput = document.getElementById('swapAmountMirta').value;
    if (!/^\d*\.?\d+$/.test(amountInput) || Number(amountInput) <= 0) {
        return alert("Invalid amount");
    }

    if (currentBuyBackPriceWei === 0n) {
        return alert("Price not loaded");
    }

    if (!swapContract) {
        return alert("Swap contract not initialized. Please check your network.");
    }

    try {
        await ensureCorrectNetwork();

        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);
        
        const symbol = (chainId === 5042002) ? "USDC" : "ETH";
        
        const amountWei = ethers.parseUnits(amountInput, 18);
        const userAddress = await signer.getAddress();

        const config = CONTRACT_CONFIG[chainId];
        if (!config) return alert("Wrong network");

        const mirtaAddress = config.MIRTA;

        const mirtaToken = new ethers.Contract(mirtaAddress, [
            "function allowance(address, address) view returns (uint256)",
            "function approve(address, uint256) returns (bool)"
        ], signer);

        const currentAllowance = await mirtaToken.allowance(userAddress, swapContract.target);

        if (currentAllowance < amountWei) {
            openModal('loading', `Step 1/2: Approving MIRTA...`);
            const txApprove = await mirtaToken.approve(swapContract.target, amountWei);
            await txApprove.wait();
        }

        openModal('loading', `Step 2/2: Swapping to ${symbol}...`);
        
        const txSwap = await swapContract.swapMirtaToEth(amountWei);
        await txSwap.wait();

        openModal('success', `Successfully swapped ${amountInput} MIRTA for ${symbol}!`, txSwap.hash);
        
        if (typeof updateBalances === "function") await updateBalances(); 
        await fetchSwapPrice();
        const input = document.getElementById('swapAmountMirta');
        if (input) input.value = "";
        updateSwapReturn();

    } catch (e) {
        console.error(e);
        const errorMessage = e.reason || e.message || "Swap failed";
        openModal('error', errorMessage);
    }
}

async function updateNetworkIdentity() {
    if (!window.ethereum) return;
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    const isArc = (chainId === 5042002);
    const symbol = isArc ? "USDC" : "ETH";

    const elements = {
        'swapTitleSymbol': symbol,
        'buybackPriceSymbol': symbol,
        'receiveTokenSymbol': symbol
    };

    for (let [id, val] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }
    const nativeIcon = document.getElementById('native-icon');
    if (nativeIcon) {
        if (isArc) {
            nativeIcon.className = 'fas fa-dollar-sign';
        } else {
            nativeIcon.className = 'fab fa-ethereum';
        }
    }
}

updateNetworkIdentity();
if (window.ethereum) {
    window.ethereum.on('chainChanged', updateNetworkIdentity);
}

