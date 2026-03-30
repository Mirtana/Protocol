// ==========================================
// 1. КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================

const CONTRACT_CONFIG = {
    46630: {
        networkName: "Robinhood Chain",
        nativeTicker: "ETH",
        MIRTA: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
        SWAP_ADDRESS: "0xEf2EA09A748348f1D7e2D8ebF8534540FB0a21f1",
        explorerUrl: "https://explorer.testnet.chain.robinhood.com"
    },
    11155111: {
        networkName: "Sepolia",
        nativeTicker: "ETH",
        MIRTA: "0x97773AAb730103aa2957E2Cc299488c41753b54C",
        SWAP_ADDRESS: "0x0000000000000000000000000000000000000000",
        explorerUrl: "https://sepolia.etherscan.io"
    }
};

const SWAP_ABI = [{"inputs":[{"internalType":"address","name":"_mirtaToken","type":"address"},{"internalType":"uint256","name":"_initialPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LiquidityAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"mirtaAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"}],"name":"Swapped","type":"event"},{"inputs":[],"name":"buyBackPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fundLiquidity","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mirtaToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setBuyBackPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_mirtaAmount","type":"uint256"}],"name":"swapMirtaToEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawMirta","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const MIRTA_ABI = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address payable","name":"_treasuryWallet","type":"address"},{"internalType":"uint256","name":"_initialMintPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalCost","type":"uint256"}],"name":"TokensMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldTreasury","type":"address"},{"indexed":true,"internalType":"address","name":"newTreasury","type":"address"}],"name":"TreasuryUpdated","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"setMintPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTreasury","type":"address"}],"name":"setTreasuryWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasuryWallet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; 

let provider, signer, MIRTAContract;
let userAccount = null;
let currentPriceWei = 0n;

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ И ПОДКЛЮЧЕНИЕ
// ==========================================

/** Основная функция подключения кошелька и настройки интерфейса */
async function connect() {
    if (!window.ethereum) return alert("Install Wallet");
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        userAccount = await signer.getAddress();
        
        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);

        if (setupContracts(chainId, signer)) {
            document.getElementById('connect-btn').innerText = `${userAccount.slice(0,6)}...${userAccount.slice(-4)}`;
            document.getElementById('balances').classList.remove('hidden');
            document.getElementById('mintBtn').disabled = false;
            document.getElementById('mintBtnText').innerText = "MINT NOW";

            await fetchMIRTAData();
            await updateBalances();
            await updateMintProgress();
            await initSwap();
        }
          
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (e) { console.error(e); }
}

/** Создает экземпляр контракта для работы с текущей сетью */
function setupContracts(chainId, signerOrProvider) {
    const config = CONTRACT_CONFIG[Number(chainId)];
    if (!config) {
        alert("Switch to Robinhood or Sepolia network!");
        return false;
    }
    MIRTAContract = new ethers.Contract(config.MIRTA, MIRTA_ABI, signerOrProvider);
    return true;
}

/** Функция инициализации при загрузке страницы */
async function init() {
    await syncNetworkDisplay();
    await updateMintProgress();

    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connect();
        }
    }
}

// ==========================================
// 3. ПОЛУЧЕНИЕ ДАННЫХ И ОБНОВЛЕНИЕ UI
// ==========================================

/** Загружает актуальную цену минта из контракта */
async function fetchMIRTAData() {
    if (!MIRTAContract) return;
    try {
        const price = await MIRTAContract.mintPrice();
        currentPriceWei = price;
        
        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);
        const config = CONTRACT_CONFIG[chainId];

        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay && config) {
            const ticker = config.nativeTicker || "NATIVE";
            priceDisplay.innerText = `${ethers.formatEther(price)} ${ticker}`;
        }
    } catch (e) {
        console.error("Ошибка загрузки цены:", e);
    }
}

/** Обновляет баланс ETH и токенов MIRTA для пользователя */
async function updateBalances() {
    if (!userAccount || !provider) return;
    
    const balance = await provider.getBalance(userAccount);
    document.getElementById('native-balance').innerText = parseFloat(ethers.formatEther(balance)).toFixed(4);

    if (MIRTAContract) {
        const tokenBal = await MIRTAContract.balanceOf(userAccount);
        document.getElementById('mirta-balance').innerText = parseFloat(ethers.formatUnits(tokenBal, 18)).toFixed(2);
    }
}

/** Рассчитывает прогресс минта и обновляет Progress Bar */
async function updateMintProgress() {
    if (!MIRTAContract) return;
    try {
        const totalSupply = await MIRTAContract.totalSupply(); 
        const maxSupply = await MIRTAContract.MAX_SUPPLY();

        if (maxSupply === 0n) return;

        const progressBP = (totalSupply * 10000n) / maxSupply; 
        const percentage = Number(progressBP) / 100;

        const minted = Number(ethers.formatUnits(totalSupply, 18)).toLocaleString();
        const total = Number(ethers.formatUnits(maxSupply, 18)).toLocaleString();

        const bar = document.getElementById('supplyBar');
        const textPercent = document.getElementById('soldPercentage');
        const textMinted = document.getElementById('mintedAmount');
        const textMax = document.getElementById('maxSupplyAmount');

        if (bar) bar.style.width = percentage + "%";
        if (textPercent) textPercent.innerText = percentage.toFixed(2) + "% SOLD";
        if (textMinted) textMinted.innerText = minted;
        if (textMax) textMax.innerText = total;

    } catch (e) {
        console.error("Error updating progress bar:", e);
    }
}

/** Синхронизирует отображение текущей сети в кнопке меню */
async function syncNetworkDisplay() {
    if (!window.ethereum) return;
    try {
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await tempProvider.getNetwork();
        const chainId = Number(network.chainId);
        
        const config = CONTRACT_CONFIG[chainId];
        const networkBtn = document.getElementById('current-network');
        const tickerInput = document.getElementById('nativeTickerInput');

        if (config && networkBtn) {
            networkBtn.innerHTML = `<i class="fas fa-network-wired"></i> ${config.networkName}`;
            if (tickerInput) tickerInput.innerText = config.nativeTicker;
        } else if (networkBtn) {
            networkBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Select Network`;
        }
    } catch (e) {
        console.error("Ошибка определения сети:", e);
    }
}

// ==========================================
// 4. ЛОГИКА МИНТА И КАЛЬКУЛЯТОРА
// ==========================================

/** Главная функция покупки (минта) токенов за нативную валюту */
async function mintToken() {
    if (!MIRTAContract) return;
    try {
        const val = document.getElementById('mintAmountEth').value;
        if (!val || val <= 0) return alert("Enter amount!");

        const weiToPay = ethers.parseEther(val.toString());
        const tokensCount = weiToPay / currentPriceWei; 

        openModal('loading', 'Waiting for wallet confirmation...');

        const tx = await MIRTAContract.mint(tokensCount, { value: weiToPay });
        openModal('loading', 'Processing transaction...', tx.hash);
        await tx.wait();

        openModal('success', `Successfully minted ${tokensCount} MIRTA!`, tx.hash);
        await updateBalances();
        await updateMintProgress();
    } catch (e) {
        console.error("Full error:", e);
        openModal('error', e.reason || "Transaction failed. Check console for details.");
    }
}

/** Добавляет токен MIRTA в список активов кошелька пользователя */
async function addTokenToWallet() {
    const chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
    const config = CONTRACT_CONFIG[chainId];
    if (!config) return alert("Сначала подключитесь к правильной сети!");

    try {
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', 
                options: {
                    address: config.MIRTA,
                    symbol: 'MIRTA',
                    decimals: 18,
                    image: 'https://mirtana.com/logo.png',
                },
            },
        });
    } catch (error) { console.error("Ошибка при добавлении токена:", error); }
}

// ==========================================
// 5. МОДАЛЬНЫЕ ОКНА И UI ВЗАИМОДЕЙСТВИЕ
// ==========================================

/** Управляет отображением статусов транзакций (загрузка, успех, ошибка) */
function openModal(type, message, txHash = null) {
    const modal = document.getElementById('txModal');
    const icon = document.getElementById('modalIcon');
    const desc = document.getElementById('modalDesc');
    const linkHolder = document.getElementById('modalLinkHolder');
    const title = document.getElementById('modalTitle');
    const closeBtn = document.getElementById('modalCloseBtn');

    modal.classList.remove('hidden');
    linkHolder.innerHTML = ''; 

    const chainId = Number(window.ethereum.chainId);
    const config = CONTRACT_CONFIG[chainId];
    const explorerUrl = config ? config.explorerUrl : "";

    if (type === 'loading') {
        title.innerText = "Processing...";
        icon.innerHTML = '<i class="fas fa-spinner loading-icon"></i>';
        desc.innerText = message;
        closeBtn.style.display = 'none';
    } 
    else if (type === 'success') {
        title.innerText = "Success!";
        icon.innerHTML = '<i class="fas fa-check-circle" style="color: #00ff88;"></i>';
        desc.innerText = message;
        closeBtn.style.display = 'block';
    } 
    else if (type === 'error') {
        title.innerText = "Error";
        icon.innerHTML = '<i class="fas fa-times-circle" style="color: #ff4d4d;"></i>';
        desc.innerText = message;
        closeBtn.style.display = 'block';
    }

    if (txHash && explorerUrl) {
        linkHolder.innerHTML = `<a href="${explorerUrl}/tx/${txHash}" target="_blank">View on Explorer <i class="fas fa-external-link-alt"></i></a>`;
    }
}

/** Закрывает модальное окно транзакции */
function closeModal() {
    document.getElementById('txModal').classList.add('hidden');
}

// ==========================================
// 6. СЛУШАТЕЛИ И ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

// Калькулятор: пересчет MIRTA при вводе суммы ETH
document.getElementById('mintAmountEth').addEventListener('input', function() {
    const val = this.value;
    if (val > 0 && currentPriceWei > 0n) {
        const weiToPay = ethers.parseEther(val.toString());
        const amount = weiToPay / currentPriceWei; 
        document.getElementById('calcOutput').innerText = `${amount.toString()} MIRTA`;
    } else {
        document.getElementById('calcOutput').innerText = "0 MIRTA";
    }
});

// Кнопки управления
document.getElementById('connect-btn').onclick = connect;
document.getElementById('mintBtn').onclick = mintToken;

// Логика выбора сети (dropdown)
const networkBtn = document.getElementById('current-network');
const networkList = document.getElementById('network-list');

if (networkBtn && networkList) {
    networkBtn.onclick = function(e) {
        e.stopPropagation();
        networkList.classList.toggle('show');
    };
}

if (networkList) {
    networkList.onclick = async (e) => {
        const target = e.target.closest('a');
        if (!target) return;
        e.preventDefault();
        networkList.classList.remove('show');

        let chainId = target.getAttribute('data-chain-id');
        if (!chainId.startsWith('0x')) chainId = '0x' + parseInt(chainId).toString(16);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
        } catch (switchError) {
            if (switchError.code === 4902 || switchError.code === -32603) {
                const config = CONTRACT_CONFIG[46630];
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xb626',
                            chainName: config.networkName,
                            rpcUrls: ["https://rpc.testnet.chain.robinhood.com"],
                            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                            blockExplorerUrls: [config.explorerUrl]
                        }]
                    });
                } catch (addError) { console.error("User rejected network add"); }
            }
        }
    };
}

// Запуск инициализации при загрузке
window.addEventListener('load', init);

// Закрытие выпадающего списка при клике в любое место
window.onclick = () => { if(networkList) networkList.classList.remove('show'); };
