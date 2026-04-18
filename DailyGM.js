// --- КОНФИГУРАЦИЯ ---
const GM_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"count","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"GMSent","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getGMStatus","outputs":[{"internalType":"bool","name":"canClaim","type":"bool"},{"internalType":"uint256","name":"timeLeft","type":"uint256"},{"internalType":"uint256","name":"count","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"gmCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastGM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sayGM","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const GM_ADDRESSES = {
    46630: "0x7C3732b3712536A4f3720Ab198b9C1cCB431f84C",
    5042002: "0x6B86aDdc998560f001ff4432DBc978adF06ba6Cb"
   
};

let gmCountdown;

async function checkGMStatus() {
    const btn = document.getElementById('gmBtn');
    const timerText = document.getElementById('gmTimerText');
    const countDisplay = document.getElementById('userGmCount');

    if (typeof signer === 'undefined' || !signer || !userAccount) return;

    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const gmAddr = GM_ADDRESSES[chainId];

        if (!gmAddr) {
            if (btn) {
                btn.innerText = "UNSUPPORTED NETWORK";
                btn.disabled = true;
            }
            return;
        }

        const contract = new ethers.Contract(gmAddr, GM_ABI, signer);
        const status = await contract.getGMStatus(userAccount);
        
        if (countDisplay) countDisplay.innerText = status.count.toString();

        if (status.canClaim) {
            if (btn) {
                btn.innerText = "SAY GM!";
                btn.disabled = false; // РАЗБЛОКИРУЕМ
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
            }
            if (timerText) timerText.innerText = "Ready to claim your daily GM!";
            if (gmCountdown) clearInterval(gmCountdown);
        } else {
            if (btn) {
                btn.disabled = true; // БЛОКИРУЕМ
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            }
            startGMTimer(parseInt(status.timeLeft));
        }
    } catch (error) {
        console.error("Failed to check GM status:", error);
    }
}

function startGMTimer(seconds) {
    const btn = document.getElementById('gmBtn');
    const timerText = document.getElementById('gmTimerText');
    
    if (gmCountdown) clearInterval(gmCountdown);

    gmCountdown = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(gmCountdown);
            checkGMStatus();
            return;
        }

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (btn) btn.innerText = "GM CLAIMED";
        if (timerText) timerText.innerText = `Next GM in: ${h}h ${m}m ${s}s`;
    }, 1000);
}

async function initGMContract() {
    const { chainId } = await provider.getNetwork();
    
    // Берем адрес из твоего объекта на основе текущего chainId
    const contractAddress = GM_ADDRESSES[chainId];

    if (!contractAddress) {
        console.error("Unsupported network! Please switch to Robinhood or Arc.");
        // Здесь можно вызвать switchNetwork(5042002) автоматически
        return;
    }

    const gmContract = new ethers.Contract(contractAddress, GM_ABI, signer);
    return gmContract;
}

async function handleGM() {
    const btn = document.getElementById('gmBtn');
    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const gmAddr = GM_ADDRESSES[chainId];
        
        if (!gmAddr) return alert("Please switch to a supported network!");

        const contract = new ethers.Contract(gmAddr, GM_ABI, signer);

        // ИСПОЛЬЗУЕМ НОВУЮ СТРУКТУРУ
        // openModal(type, message, txHash, extra)
        if (window.openModal) {
            window.openModal('loading', 'Recording your daily GM activity... Please confirm in wallet.');
        }

        if (btn) btn.disabled = true;

        const tx = await contract.sayGM();
        
        // Обновляем модалку - показываем, что транзакция в сети
        if (window.openModal) {
            const explorerUrl = getExplorerUrl(chainId, tx.hash);
            window.openModal('loading', 'GM Transaction sent! Waiting for blockchain confirmation...', tx.hash);
        }

        await tx.wait();
        
        // УСПЕХ
        if (window.openModal) {
            const explorerUrl = getExplorerUrl(chainId, tx.hash);
            window.openModal('success', 'Your daily GM has been recorded forever!', tx.hash);
        }

        await checkGMStatus();

    } catch (error) {
        console.error("GM error:", error);
        if (window.closeStatusModal) window.closeStatusModal();
        
        if (error.code === 4001) {
            alert("Transaction rejected");
        } else {
            // Можно вызвать openModal с типом 'error'
            if (window.openModal) window.openModal('error', error.reason || "Transaction failed");
        }
        await checkGMStatus();
    }
}

function getExplorerUrl(chainId, hash) {
    const explorers = {
        46630: "https://explorer.testnet.chain.robinhood.com/tx/",
        5042002: "https://testnet.arcscan.app/tx/"
    };
    return (explorers[chainId] || "") + hash;
}

// Глобальный доступ
window.handleGM = handleGM;
window.checkGMStatus = checkGMStatus;
if (window.ethereum) {
    window.ethereum.on('chainChanged', () => window.location.reload());
}