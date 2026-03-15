// --- КОНФИГУРАЦИЯ ---
const CONTRACT_CONFIG = {
    46630: { // Robinhood Chain Testnet (0x51c)
        networkName: "Robinhood Chain",
        nativeTicker: "ETH",
        MIRTA: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
        explorerUrl: "https://explorer.testnet.chain.robinhood.com"
    },
    11155111: { // Sepolia
        networkName: "Sepolia",
        nativeTicker: "ETH",
        MIRTA: "0x97773AAb730103aa2957E2Cc299488c41753b54C",
        explorerUrl: "https://sepolia.etherscan.io"
    }
}

// ABI у тебя верный, оставляем его
const MIRTA_ABI = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address payable","name":"_treasuryWallet","type":"address"},{"internalType":"uint256","name":"_initialMintPrice","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"PriceUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalCost","type":"uint256"}],"name":"TokensMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldTreasury","type":"address"},{"indexed":true,"internalType":"address","name":"newTreasury","type":"address"}],"name":"TreasuryUpdated","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burnFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"setMintPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newTreasury","type":"address"}],"name":"setTreasuryWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasuryWallet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]; 

let provider, signer, MIRTAContract;
let userAccount = null;
let currentPriceWei = 0n; // В v6 используем BigInt

// 1. ИНИЦИАЛИЗАЦИЯ КОНТРАКТОВ
function setupContracts(chainId, signerOrProvider) {
    const config = CONTRACT_CONFIG[Number(chainId)];
    if (!config) {
        alert("Switch to Robinhood or Sepolia network!");
        return false;
    }
    MIRTAContract = new ethers.Contract(config.MIRTA, MIRTA_ABI, signerOrProvider);
    return true;
}

// 2. ПОЛУЧЕНИЕ ДАННЫХ КОНТРАКТА (Цена, Сумма)
async function fetchMIRTAData() {
    if (!MIRTAContract) return;
    try {
        const price = await MIRTAContract.mintPrice();
        currentPriceWei = price; // Сохраняем для калькулятора
        
        // Получаем текущий ID сети
        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);
        const config = CONTRACT_CONFIG[chainId];

        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay && config) {
            // Вот тут магия: берем тикер из конфига (ETH, RHO и т.д.)
            const ticker = config.nativeTicker || "NATIVE";
            priceDisplay.innerText = `${ethers.formatEther(price)} ${ticker}`;
        }
    } catch (e) {
        console.error("Ошибка загрузки цены:", e);
    }
}

// 3. ОБНОВЛЕНИЕ БАЛАНСОВ
async function updateBalances() {
    if (!userAccount || !provider) return;
    
    // Нативный баланс
    const balance = await provider.getBalance(userAccount);
    document.getElementById('native-balance').innerText = parseFloat(ethers.formatEther(balance)).toFixed(4);

    // Баланс токена
    if (MIRTAContract) {
        const tokenBal = await MIRTAContract.balanceOf(userAccount);
        document.getElementById('mirta-balance').innerText = parseFloat(ethers.formatUnits(tokenBal, 18)).toFixed(2);
    }
}

// 4. КАЛЬКУЛЯТОР (Слушатель событий)
document.getElementById('mintAmountEth').addEventListener('input', function() {
    const val = this.value;
    if (val > 0 && currentPriceWei > 0n) {
        const weiToPay = ethers.parseEther(val.toString());
        // Расчет: сколько токенов получим
        const amount = weiToPay / currentPriceWei; 
        document.getElementById('calcOutput').innerText = `${amount.toString()} MIRTA`;
    } else {
        document.getElementById('calcOutput').innerText = "0 MIRTA";
    }
});

// 5. ГЛАВНАЯ ФУНКЦИЯ CONNECT
async function connect() {
    if (!window.ethereum) return alert("Install Wallet");
    try {
        provider = new ethers.BrowserProvider(window.ethereum); // v6 синтаксис
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
        }
          
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (e) { console.error(e); }
    console.log
}

// 6. ФУНКЦИЯ МИНТА
async function mintToken() {
    if (!MIRTAContract) return;
    try {
        const val = document.getElementById('mintAmountEth').value;
        const wei = ethers.parseEther(val);
        const amount = wei / currentPriceWei;

        const tx = await MIRTAContract.mint(amount, { value: wei });
        await tx.wait();
        alert("Mint Success!");
        updateBalances();
    } catch (e) { console.error(e); alert("Mint failed"); }
}

// Привязка кнопки к функции (если не сделано в HTML)
document.getElementById('connect-btn').onclick = connect;
document.getElementById('mintBtn').onclick = mintToken;

async function init() {
    // 1. Сразу проверяем сеть, даже если кошелек не подключен
    await syncNetworkDisplay();

    // 2. Проверяем, авторизован ли уже пользователь
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            // Если уже залогинен — запускаем полный коннект
            await connect();
        }
    }
}

// Запуск при загрузке страницы
window.addEventListener('load', init);

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
            // Если сеть опознана — пишем её название
            networkBtn.innerHTML = `<i class="fas fa-network-wired"></i> ${config.networkName}`;
            if (tickerInput) tickerInput.innerText = config.nativeTicker;
        } else if (networkBtn) {
            // Если сеть не в нашем списке
            networkBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Select Network`;
        }
    } catch (e) {
        console.error("Ошибка определения сети:", e);
    }
}


async function addTokenToWallet() {
    const chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
    const config = CONTRACT_CONFIG[chainId];

    if (!config) {
        alert("Сначала подключитесь к правильной сети!");
        return;
    }

    try {
        // Запрос к кошельку на добавление токена
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', 
                options: {
                    address: config.MIRTA, // Адрес контракта MIRTA
                    symbol: 'MIRTA',        // Символ токена
                    decimals: 18,         // Десятичные доли (у тебя в ABI 18)
                    image: 'https://mirtana.com/logo.png', // Ссылка на иконку (поменяй на свою)
                },
            },
        });

        if (wasAdded) {
            console.log('Токен MIRTA добавлен в кошелек!');
        }
    } catch (error) {
        console.error("Ошибка при добавлении токена:", error);
    }
}


// --- ЛОГИКА ВЫПАДАЮЩЕГО СПИСКА И СМЕНЫ СЕТИ ---

// 1. Открытие/закрытие меню
const networkBtn = document.getElementById('current-network');
const networkList = document.getElementById('network-list');

if (networkBtn && networkList) {
    networkBtn.onclick = function(e) {
        e.stopPropagation();
        networkList.classList.toggle('show');
    };
}

// 2. Обработка клика по конкретной сети
if (networkList) {
    networkList.onclick = async (e) => {
        // Ищем ссылку, по которой кликнули
        const target = e.target.closest('a');
        if (!target) return;
        
        e.preventDefault();
        networkList.classList.remove('show');

        // Получаем ID из атрибута (например, "0x51c" или "46630")
        let chainId = target.getAttribute('data-chain-id');
        
        // Превращаем в Hex формат (Rabby любит 0x...), если это число
        if (!chainId.startsWith('0x')) {
            chainId = '0x' + parseInt(chainId).toString(16);
        }

        console.log("Переключено на:", chainId);

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });

            const config = CONTRACT_CONFIG[parseInt(chainId)]; 
            if (config) {
                document.getElementById('current-network').innerHTML = `<i class="fas fa-network-wired"></i> ${config.networkName}`;
            }

        } catch (switchError) {
            // Если сети нет в кошельке, пробуем добавить (используем твой 46630)
            if (switchError.code === 4902 || switchError.code === -32603) {
                const config = CONTRACT_CONFIG[46630]; // Берем настройки из твоего конфига
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xb626', // Это 46630 в hex
                            chainName: config.networkName,
                            rpcUrls: ["https://rpc.testnet.chain.robinhood.com"], // Замени на актуальный RPC если другой
                            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                            blockExplorerUrls: [config.explorerUrl]
                        }]
                    });
                } catch (addError) {
                    console.error("Пользователь отклонил добавление сети");
                }
            }
        }
    };
}

// Закрытие при клике мимо
window.onclick = () => networkList.classList.remove('show');

if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
        // chainId приходит в Hex, поэтому просто обновляем всё через reload
        // это самый безопасный способ обновить все балансы и стейты
        window.location.reload();
    });
}
