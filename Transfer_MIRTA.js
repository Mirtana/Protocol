const MIRTA_CONFIG = {

    // Arc Testnet (ChainID: 5042002)
    5042002: {
        address: "0xad4d6Ed80F18768a1DdE5f2b6a97a900A5C874e1",
        explorer: "https://testnet.arcscan.app/tx/"
    },

    // Robinhood Testnet (ChainID: 46630)
    46630: {
        address: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
        explorer: "https://explorer.testnet.chain.robinhood.com/tx/"
    },
  
    // Kii Testnet Oro (ChainID: 1336)
    1336: { 
        address: "0x97773AAb730103aa2957E2Cc299488c41753b54C",
        explorer: "https://testnet.explorer.kiichain.io/tx/"
    },
    
    // OPN Testnet (ChainID: 984)
    984: { 
        address: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
        explorer: "https://testnet.iopn.tech/tx/"
    }
};

async function setMaxTransfer() {
    if (!userAccount || !provider) return;

    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = MIRTA_CONFIG[chainId];

        if (!config) {
            console.error("MIRTA not supported on this network");
            return;
        }

        const minABI = [
            "function balanceOf(address) view returns (uint256)", 
            "function decimals() view returns (uint8)"
        ];

        const contract = new ethers.Contract(config.address, minABI, provider);

        const [balance, decimals] = await Promise.all([
            contract.balanceOf(userAccount),
            contract.decimals()
        ]);

        const formattedBalance = ethers.formatUnits(balance, decimals);

        const input = document.getElementById('transferAmount');
        if (input) {
            
            const cleanValue = Number(formattedBalance).toFixed(6).replace(/\.?0+$/, '');
            input.value = cleanValue;
        }

    } catch (e) {
        console.error("Balance fetch failed", e);
    }
}

async function sendMirtaTokens() {
    const recipient = document.getElementById('transferAddress').value;

    const amount = document
        .getElementById('transferAmount')
        .value.replace(',', '.')
        .trim();
    
    
    if (!ethers.isAddress(recipient)) {
        return alert("Invalid recipient address!");
    }
    
    
    if (!/^\d+(\.\d+)?$/.test(amount)) {
        return alert("Invalid amount format!");
    }
    
    const amountNum = Number(amount);
    
    if (amountNum <= 0) {
        return alert("Enter valid amount!");
    }

    
    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = MIRTA_CONFIG[chainId];

        if (!config) {
            alert("MIRTA token is not available on this network!");
            return;
        }

        if (window.openModal) {
            const safeAmount = String(amount).replace(/[<>]/g, "");
            const safeRecipient = recipient.substring(0, 8);

            window.openModal(
                'loading',
                `Preparing to send ${safeAmount} MIRTA to ${safeRecipient}...`
            );
        }

        const abi = [
            "function transfer(address to, uint256 amount) returns (bool)", 
            "function decimals() view returns (uint8)"
        ];
        const contract = new ethers.Contract(config.address, abi, signer);

        const decimals = await contract.decimals();

        let parsedAmount;
        try {
            parsedAmount = ethers.parseUnits(amount, decimals);
        } catch {
            return alert("Invalid amount format");
        }

        const tx = await contract.transfer(recipient, parsedAmount);
        
        if (window.openModal) {
            window.openModal('loading', 'Transfer sent! Waiting for network confirmation...', tx.hash);
        }

        await tx.wait();

        await new Promise(res => setTimeout(res, 800));

        const safeAmount = String(amount).replace(/[<>]/g, "");
        const safeRecipientFull = String(recipient).replace(/[<>]/g, "");

        if (window.openModal) {
            window.openModal(
                'success',
                `Successfully transferred ${safeAmount} MIRTA to ${safeRecipientFull}`,
                tx.hash
            );
        }

        document.getElementById('transferAddress').value = "";
        document.getElementById('transferAmount').value = "";

        if (typeof updateBalances === 'function') updateBalances();

    } catch (e) {
        console.error("Transfer failed", e);
        
        if (e.code === 4001) {
            if (window.closeStatusModal) window.closeStatusModal();
        } else {
            const errorMsg = e.reason || e.message || "Transaction failed. Please check your balance or gas.";
            if (window.openModal) {
                window.openModal('error', errorMsg);
            }
        }
    }
}