// ==========================================
// 1. КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================

const CONTRACT_CONFIG = {
    46630: {                    // Robinhood Chain Testnet
        networkName: "Robinhood Chain Testnet",
        nativeTicker: "ETH",
        MIRTA: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
        SWAP_ADDRESS: "0xEf2EA09A748348f1D7e2D8ebF8534540FB0a21f1",
        explorerUrl: "https://explorer.testnet.chain.robinhood.com",
        chainIdHex: "0xB626",
        rpcUrl: "https://rpc.testnet.chain.robinhood.com"
    },   

    5042002: {                  // Arc Testnet
        networkName: "Arc Testnet",
        nativeTicker: "USDC",
        MIRTA: "0xad4d6Ed80F18768a1DdE5f2b6a97a900A5C874e1",
        SWAP_ADDRESS: "0x6935CF14a5F318Effd758D3d9454336134323383",
        explorerUrl: "https://testnet.arcscan.app",
        chainIdHex: "0x4cef52",
        rpcUrl: "https://rpc.testnet.arc.network"
    },

    11155111: {                 // Sepolia
        networkName: "Sepolia",
        nativeTicker: "ETH",
        MIRTA: "0x97773AAb730103aa2957E2Cc299488c41753b54C",
        SWAP_ADDRESS: "0x0000000000000000000000000000000000000000",
        explorerUrl: "https://sepolia.etherscan.io",
        chainIdHex: "0xaa36a7",
        rpcUrl: "https://rpc.sepolia.org"
    }
};
const SWAP_ABI = [{"inputs":[{"internalType":"address","name":"_mirtaToken","type":"address"},{"internalType":"uint256","name":"_initialPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LiquidityAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"mirtaAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"}],"name":"Swapped","type":"event"},{"inputs":[],"name":"buyBackPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fundLiquidity","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mirtaToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setBuyBackPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_mirtaAmount","type":"uint256"}],"name":"swapMirtaToEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawMirta","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const MIRTA_ABI = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address payable","name":"_treasuryWallet","type":"address"},{"internalType":"uint256","name":"_initialMintPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalCost","type":"uint256"}],"name":"TokensMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldTreasury","type":"address"},{"indexed":true,"internalType":"address","name":"newTreasury","type":"address"}],"name":"TreasuryUpdated","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"setMintPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTreasury","type":"address"}],"name":"setTreasuryWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasuryWallet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; 

let provider, signer, MIRTAContract;
let userAccount = null;
let currentPriceWei = 0n;

// =========================================
// 2. ИНИЦИАЛИЗАЦИЯ И ПОДКЛЮЧЕНИЕ
// =========================================

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
            await checkGMStatus();
        }
          
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (e) { console.error(e); }
}

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

async function initStaking() {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            globalSigner = await provider.getSigner();
            
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            
            if (ADDRESSES[chainId]) {
                STAKING_ADDRESS = ADDRESSES[chainId].staking;
                MIRTA_TOKEN_ADDRESS = ADDRESSES[chainId].token;
                console.log(`✅ Connected to ${chainId}! Staking: ${STAKING_ADDRESS}`);
            } else {
                console.error("❌ Unsupported network:", chainId);
                return; 
            }

            stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, globalSigner);
            await loadUserStakes();
        } catch (e) { 
            console.error("Init Error:", e); 
        }
    }
}

function setupContracts(chainId, signerOrProvider) {
    const config = CONTRACT_CONFIG[Number(chainId)];
    if (!config) {
        triggerModal("Wrong Network", "Please switch to Robinhood or Arc Network!", "error");
        return false;
    }

    // Проверяем наличие адреса, чтобы ethers не выдал ошибку INVALID_ARGUMENT
    if (config.MIRTA && config.MIRTA !== "0x0000000000000000000000000000000000000000") {
        MIRTAContract = new ethers.Contract(config.MIRTA, MIRTA_ABI, signerOrProvider);
        return true;
    } else {
        console.warn("MIRTA Contract not deployed on this network yet.");
        return false; 
    }
}




// =========================================
// 3. ПОЛУЧЕНИЕ ДАННЫХ И ОБНОВЛЕНИЕ UI
// =========================================

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

async function updateBalances() {
    if (!userAccount || !provider) return;
    
    const balance = await provider.getBalance(userAccount);
    document.getElementById('native-balance').innerText = parseFloat(ethers.formatEther(balance)).toFixed(4);

    if (MIRTAContract) {
        const tokenBal = await MIRTAContract.balanceOf(userAccount);
        document.getElementById('mirta-balance').innerText = parseFloat(ethers.formatUnits(tokenBal, 18)).toFixed(2);
    }
}

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

async function switchNetwork(targetChainId) {
    const config = CONTRACT_CONFIG[Number(targetChainId)];
    if (!config) {
        console.error("Network configuration not found for ID:", targetChainId);
        return;
    }

    const hexChainId = config.chainIdHex || '0x' + Number(targetChainId).toString(16);

    try {
        
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: hexChainId }],
        });
    } catch (switchError) {
        
        if (switchError.code === 4902 || switchError.code === -32603) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: hexChainId,
                        chainName: config.networkName,
                        rpcUrls: [config.rpcUrl],
                        nativeCurrency: { 
                            name: config.nativeTicker, 
                            symbol: config.nativeTicker, 
                            decimals: 18 
                        },
                        blockExplorerUrls: [config.explorerUrl]
                    }]
                });
            } catch (addError) {
                console.error("User rejected adding the network");
            }
        }
    }
}


// ==========================================
// 4. ЛОГИКА МИНТА И КАЛЬКУЛЯТОРА
// ==========================================

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

async function setMaxMint() {
    if (!signer || !userAccount) {
        console.error("Wallet not connected");
        return;
    }

    try {
        
        const balance = await provider.getBalance(userAccount);
        
        const gasReserve = ethers.parseEther("0.001");

        let finalAmount;
        if (balance > gasReserve) {
            finalAmount = balance - gasReserve;
        } else {
            finalAmount = 0n;
        }

        const formatted = ethers.formatEther(finalAmount);
        
        const input = document.getElementById('mintAmountEth');
        
        if (input) {
            input.value = formatted;
            
            input.dispatchEvent(new Event('input'));
        }

    } catch (e) {
        console.error("Error setting max balance:", e);
    }
}

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
                    image: 'https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafkreidsp4ixqkzslgj7q5wx5lqpzizblu7qzyzmbxq4cbpgjd5sflxiyq',
                },
            },
        });
    } catch (error) { console.error("Ошибка при добавлении токена:", error); }
}

function showSection(sectionId, element) {
    // 1. Находим все блоки контента и скрываем их
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });

    // 2. Убираем подсветку у всех кнопок навигации
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // 3. Показываем тот блок, на который нажали
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // 4. Подсвечиваем нажатую кнопку
    element.classList.add('active');

    if (sectionId === 'TokenFactory-section') {
        console.log("Switching to Factory: Loading tokens...");
        loadUserTokens();
    }

    if (sectionId === 'dashboard-section') {
        console.log("Navigation: Dashboard selected, calling loadDashboard()...");
        loadDashboard(); 
    }
}


// ==========================================
// 5. МОДАЛЬНЫЕ ОКНА И UI ВЗАИМОДЕЙСТВИЕ
// ==========================================

function openModal(type, message, txHash = null, extra = {}) {
    const modal = document.getElementById('statusModal'); // Твой новый ID
    const loader = document.getElementById('statusLoader');
    const title = document.getElementById('statusTitle');
    const msg = document.getElementById('statusMessage');
    const txInfo = document.getElementById('txInfo');
    const stakedInfo = document.getElementById('stakedAmountInfo');
    const link = document.getElementById('explorerLink');
    const closeBtn = document.getElementById('statusCloseBtn');

    if (!modal) return;

    // Сброс состояния
    modal.style.display = 'flex';
    txInfo.style.display = 'none';
    if (stakedInfo) stakedInfo.parentElement.style.display = 'none';

    // Получаем URL эксплорера
    const chainId = window.ethereum ? Number(window.ethereum.chainId) : null;
    const config = chainId ? CONTRACT_CONFIG[chainId] : null;
    const explorerUrl = config ? config.explorerUrl : "";

    if (type === 'loading') {
        title.innerText = "Processing...";
        title.style.color = "#00f2ff";
        loader.style.display = 'block';
        closeBtn.style.display = 'none';
    } 
    else if (type === 'success') {
        title.innerText = "Success!";
        title.style.color = "#00ff88";
        loader.style.display = 'none';
        closeBtn.style.display = 'block';
    } 
    else if (type === 'error') {
        title.innerText = "Error";
        title.style.color = "#ff4d4d";
        loader.style.display = 'none';
        closeBtn.style.display = 'block';
    }

    msg.innerHTML = message;

    // Если есть транзакция, показываем блок инфо
    if (txHash && explorerUrl) {
        txInfo.style.display = 'block';
        link.href = `${explorerUrl}/tx/${txHash}`;
        
        // Если это стейкинг, показываем сумму
        if (extra.stakedAmount) {
            stakedInfo.parentElement.style.display = 'block';
            stakedInfo.innerText = extra.stakedAmount;
        }
    }
}

function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.style.display = 'none';
}

// Для совместимости со старыми вызовами в коде
function closeModal() {
    closeStatusModal();
}

function triggerModal(title, message, type = 'info') {
    const modalType = (type === 'error') ? 'error' : 'success';
    openModal(modalType, message);
    document.getElementById('statusTitle').innerText = title;
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

document.getElementById('connect-btn').onclick = connect;
document.getElementById('mintBtn').onclick = mintToken;

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

        const chainId = target.getAttribute('data-chain-id');
        await switchNetwork(chainId);
    };
}

window.addEventListener('load', init);
window.onclick = () => { if(networkList) networkList.classList.remove('show'); };

// Универсальное закрытие модалок при клике на темный фон (Overlay)
window.addEventListener('click', function(event) {
    const statusModal = document.getElementById('statusModal');
    const txModal = document.getElementById('txModal');
    const loader = document.getElementById('statusLoader');

    // 1. Обработка для statusModal
    if (event.target === statusModal) {
        // Проверяем, не идет ли сейчас загрузка, чтобы не закрыть окно случайно
        const isIdle = !loader || loader.style.display === 'none';
        if (isIdle) {
            closeStatusModal();
        }
    }

    // 2. Обработка для txModal
    if (event.target === txModal) {
        // Здесь обычно closeModal() просто скрывает окно
        closeModal();
    }
});