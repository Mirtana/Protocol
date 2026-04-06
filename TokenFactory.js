const FACTORY_CONFIG = {
    // Robinhood Testnet
    46630: {
        address: "0x1f6ac462b6322A06496ba14bE5D6b39e75DB2B40",
        explorer: "https://explorer.testnet.chain.robinhood.com/tx/"
    },
    // Arc Testnet
    5042002: {
        address: "0xA9960EcB55E45bEd1c860259a157c81c6c3d1C18",
        explorer: "https://testnet.arcscan.app/tx/"
    }
};
const FACTORY_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"string","name":"symbol","type":"string"},{"indexed":false,"internalType":"string","name":"tokenType","type":"string"}],"name":"TokenCreated","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allCreatedTokens","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"supply","type":"uint256"},{"internalType":"uint8","name":"tokenType","type":"uint8"}],"name":"createToken","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllTokensCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserTokens","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userToTokens","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

let selectedType = 0;

function selectTokenType(type, element) {
    selectedType = type;
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

async function deployToken() {
    const name = document.getElementById('tokenName').value;
    const symbol = document.getElementById('tokenSymbol').value;
    const supply = document.getElementById('tokenSupply').value;

    if (!name || !symbol || !supply) {
        triggerModal("Empty Fields", "Please fill in all the parameters to generate your token.", "error");
        return;
    }

    try {
        // Определяем текущую сеть
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = FACTORY_CONFIG[chainId];

        // Проверяем, развернута ли фабрика в этой сети
        if (!config) {
            triggerModal("Unsupported Network", "Please switch to Arc or Robinhood network.", "error");
            return;
        }

        // Создаем контракт фабрики с динамическим адресом
        const factory = new ethers.Contract(config.address, FACTORY_ABI, signer);
        
        showGMProcessingModal(true); 
        
        document.getElementById('modalTitle').innerText = "Deploying Token...";
        document.getElementById('modalDesc').innerText = `Creating ${name} (${symbol}) on ${chainId === 5042002 ? 'Arc' : 'Robinhood'}...`;

        // Отправка транзакции
        const tx = await factory.createToken(name, symbol, supply, selectedType);
        await tx.wait();
        
        // Показываем успех с правильной ссылкой на эксплорер
        showGMSuccessModal(tx.hash, `${config.explorer}${tx.hash}`);

        console.log("Refreshing tokens list...");
        
        // Обновляем UI
        document.getElementById('modalTitle').innerText = "Token Deployed!";
        document.getElementById('modalDesc').innerText = "Your custom smart contract is now live.";

        setTimeout(() => { loadUserTokens(); }, 1000);

    } catch (e) {
        console.error("Deployment Error:", e);
        closeModal(); 

        if (e.code !== 4001) {
            console.log("Transaction failed for reason other than user rejection.");
            triggerModal("Transaction Failed", "Something went wrong during deployment.", "error");
        } else {
            console.log("User cancelled the deployment.");
        }
    }
}

async function loadUserTokens() {
    if (!userAccount) return;
    const list = document.getElementById('userTokensList');
    
    try {
        // Определяем текущую сеть для выбора правильной фабрики
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = FACTORY_CONFIG[chainId];

        // Если сеть не поддерживается, очищаем список и выходим
        if (!config) {
            list.innerHTML = `<p style="text-align:center; opacity:0.6;">Unsupported network for factory.</p>`;
            return;
        }

        const factory = new ethers.Contract(config.address, FACTORY_ABI, provider);
        const tokenAddresses = await factory.getUserTokens(userAccount);
        
        if (tokenAddresses.length === 0) {
            list.innerHTML = `<p style="text-align:center; opacity:0.6;">You haven't created any tokens on this network yet.</p>`;
            return;
        }

        const ERC20_ABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];

        const tokenDataPromises = tokenAddresses.map(async (addr) => {
            const tokenContract = new ethers.Contract(addr, ERC20_ABI, provider);
            try {
                const [name, symbol, total, decimals] = await Promise.all([
                    tokenContract.name(),
                    tokenContract.symbol(),
                    tokenContract.totalSupply(),
                    tokenContract.decimals()
                ]);

                // Поддержка разных версий ethers для форматирования чисел
                const formattedTotal = ethers.formatUnits 
                    ? ethers.formatUnits(total, decimals) 
                    : ethers.utils.formatUnits(total, decimals);

                return { addr, name, symbol, total: formattedTotal };
            } catch (err) {
                console.error("Error fetching token data:", addr, err);
                return { addr, name: "Unknown", symbol: "???", total: "0" };
            }
        });

        const allTokens = await Promise.all(tokenDataPromises);

        // Рендерим список
        list.innerHTML = allTokens.map(token => `
            <div class="token-item">
                <div class="token-info">
                    <div class="token-header">
                        <h4>${token.name} <span>(${token.symbol})</span></h4>
                        <button class="copy-mini-btn" onclick="copyToClipboard('${token.addr}', this)">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="token-stats">
                        <p>Supply: <strong>${parseFloat(token.total).toLocaleString()}</strong></p>
                        <span>${token.addr.substring(0, 10)}...${token.addr.substring(token.addr.length - 5)}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.log("Error loading dashboard:", e);
        list.innerHTML = `<p style="text-align:center; color: #ff4d4d;">Failed to load tokens.</p>`;
    }
}

function closeModal() {
    const modal = document.getElementById('txModal');
    if (!modal) return;

    // 1. Прячем визуально (твой старый метод)
    modal.classList.add('hidden');
    
    // 2. УБИРАЕМ БЛОКИРОВКУ (самое важное)
    // Это гарантирует, что невидимое окно перестанет перекрывать кнопки
    modal.style.display = 'none'; 
    modal.style.setProperty('display', 'none', 'important'); 
    
    // 3. Сбрасываем контент
    document.getElementById('modalLinkHolder').innerHTML = "";
}
// Универсальная функция копирования
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('i');
        icon.classList.replace('fa-copy', 'fa-check');
        icon.style.color = '#00f2ff';
        setTimeout(() => {
            icon.classList.replace('fa-check', 'fa-copy');
            icon.style.color = '';
        }, 2000);
    });
}