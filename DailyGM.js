// --- КОНФИГУРАЦИЯ ---
const GM_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"count","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"GMSent","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getGMStatus","outputs":[{"internalType":"bool","name":"canClaim","type":"bool"},{"internalType":"uint256","name":"timeLeft","type":"uint256"},{"internalType":"uint256","name":"count","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"gmCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastGM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sayGM","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const GM_ADDRESSES = {
    46630: "0x7C3732b3712536A4f3720Ab198b9C1cCB431f84C",
    5042002: "0x6B86aDdc998560f001ff4432DBc978adF06ba6Cb"
   
};

let gmCountdown;

// 1. ЕДИНАЯ ФУНКЦИЯ ПРОВЕРКИ СТАТУСА
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

// 2. ТАЙМЕР
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

// 3. ОСНОВНАЯ ЛОГИКА ТРАНЗАКЦИИ
async function handleGM() {
    const btn = document.getElementById('gmBtn');
    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const gmAddr = GM_ADDRESSES[chainId];
        
        if (!gmAddr) return alert("Please switch to a supported network!");

        const contract = new ethers.Contract(gmAddr, GM_ABI, signer);

        // Показываем окно загрузки СРАЗУ
        showGMProcessingModal();
        if (btn) btn.disabled = true;

        const tx = await contract.sayGM();
        console.log("Transaction sent:", tx.hash);

        let explorerUrl = "";
        if (chainId === 46630) explorerUrl = `https://explorer.testnet.chain.robinhood.com/tx/${tx.hash}`;
        else if (chainId === 5042002) explorerUrl = `https://testnet.arcscan.app/tx/${tx.hash}`;
        else if (chainId === 97) explorerUrl = `https://testnet.bscscan.com/tx/${tx.hash}`;

        // Ждем подтверждения
        await tx.wait();
        
        // Показываем успех
        showGMSuccessModal(tx.hash, explorerUrl);
        await checkGMStatus();

    } catch (error) {
        console.error("GM error:", error);
        // Закрываем модалку при ошибке, чтобы она не висела вечно
        const modal = document.getElementById('txModal');
        if (modal) modal.style.display = 'none';

        if (error.code === 4001) {
            // Пользователь сам нажал "Отмена" в Метамаске — алерт тут уместен
            alert("Transaction rejected");
        } 
        await checkGMStatus();
    }
}

// 4. МОДАЛЬНЫЕ ОКНА (С исправленным принудительным показом)
function showGMProcessingModal(isFactory = false) {
    const modal = document.getElementById('txModal');
    if (!modal) return;

    // --- БЛОК СБРОСА (Fix для повторного вызова) ---
    // Скрываем и удаляем инлайновые стили перед новым показом
    modal.classList.add('hidden');
    modal.style.removeProperty('display');
    
    // Используем небольшую задержку, чтобы DOM успел обновить состояние
    setTimeout(() => {
        // Меняем текст в зависимости от того, что делаем
        const titleElem = document.getElementById('modalTitle');
        const iconElem = document.getElementById('modalIcon');
        const descElem = document.getElementById('modalDesc');
        const linkElem = document.getElementById('modalLinkHolder');

        if (titleElem) titleElem.innerText = isFactory ? "Deploying Token..." : "Sending Transaction...";
        
        // Вставляем новый SVG-спиннер с классом neon-spinner
        if (iconElem) {
            iconElem.innerHTML = `
                <div class="neon-spinner">
                    <svg viewBox="0 0 50 50">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                    </svg>
                </div>`;
        }

        const desc = isFactory 
            ? "Creating your smart contract... Please confirm in wallet." 
            : "Processing your transaction... Please confirm in wallet.";
            
        if (descElem) descElem.innerHTML = `<p style="color: rgba(255,255,255,0.7);">${desc}</p>`;
        if (linkElem) linkElem.innerHTML = "";

        // Принудительно отображаем модалку
        modal.style.setProperty('display', 'flex', 'important');
        modal.classList.remove('hidden');
    }, 10); 
}

function showGMSuccessModal(hash, url, isFactory = false) {
    const modal = document.getElementById('txModal');
    if (!modal) return;

    document.getElementById('modalTitle').innerText = isFactory ? "Token Deployed!" : "GM Recorded!";
    
    // Галочка с неоновым свечением
    document.getElementById('modalIcon').innerHTML = '<div class="success-icon-neon">✔</div>';
    
    const desc = isFactory 
        ? "Your custom smart contract is now live on blockchain!" 
        : "Your daily activity has been recorded!";

    document.getElementById('modalDesc').innerHTML = `<p style="color: rgba(255,255,255,0.7);">${desc}</p>`;

    if (hash) {
        document.getElementById('modalLinkHolder').innerHTML = `
            <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                <a href="${url}" target="_blank" style="color: #00f2ff; text-decoration: none; font-size: 13px;">
                    View Transaction ↗
                </a>
            </div>`;
    }

    modal.classList.remove('hidden'); 
    modal.style.setProperty('display', 'flex', 'important');
}

function closeModal() {
    const modal = document.getElementById('txModal');
    if (modal) {
        modal.classList.add('hidden');
        // Обязательно удаляем инлайновый стиль, который добавили через JS
        modal.style.removeProperty('display'); 
    }
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

// Глобальный доступ
window.handleGM = handleGM;
window.checkGMStatus = checkGMStatus;
window.showGMSuccessModal = showGMSuccessModal;

if (window.ethereum) {
    window.ethereum.on('chainChanged', () => window.location.reload());
}