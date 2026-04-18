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
        if (window.openModal) {
            window.openModal('error', 'Please fill in all parameters to generate your token.');
        } else {
            alert("Empty Fields: Please fill in all parameters.");
        }
        return;
    }

    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = FACTORY_CONFIG[chainId];

        if (!config) {
            if (window.openModal) {
                window.openModal('error', 'Unsupported Network. Please switch to Arc or Robinhood.');
            }
            return;
        }

        // 1. Инициализация модалки
        if (window.openModal) {
            window.openModal('loading', `Preparing to deploy ${name} (${symbol})...`);
        }

        const factory = new ethers.Contract(config.address, FACTORY_ABI, signer);
        
        // 2. Отправка транзакции в кошелек
        const tx = await factory.createToken(name, symbol, supply, selectedType);
        
        // 3. Статус: Ждем блокчейн
        if (window.openModal) {
            window.openModal('loading', 'Deploying your smart contract to the blockchain...', tx.hash);
        }

        await tx.wait();

        // 4. УСПЕХ
        if (window.openModal) {
            const successMsg = `
                <div style="color: #00f2ff; font-weight: bold; margin-bottom: 10px;">Token Deployed Successfully!</div>
                <p>Your custom smart contract <strong>${name}</strong> is now live on the network.</p>
            `;
            window.openModal('success', successMsg, tx.hash);
        }

        // Очистка полей
        document.getElementById('tokenName').value = "";
        document.getElementById('tokenSymbol').value = "";
        document.getElementById('tokenSupply').value = "";

        // Обновляем список токенов пользователя
        setTimeout(() => { loadUserTokens(); }, 1500);

    } catch (e) {
        console.error("Deployment Error:", e);
        
        if (e.code === 4001) {
            if (window.closeStatusModal) window.closeStatusModal();
        } else {
            const errorMsg = e.reason || e.message || "Something went wrong during deployment.";
            if (window.openModal) {
                window.openModal('error', errorMsg);
            }
        }
    }
}

async function loadUserTokens() {
    if (!userAccount || !provider) return;
    const list = document.getElementById('userTokensList');
    if (!list) return;
    
    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = FACTORY_CONFIG[chainId];

        if (!config) {
            list.innerHTML = `<p style="text-align:center; opacity:0.6;">Unsupported network.</p>`;
            return;
        }

        const factory = new ethers.Contract(config.address, FACTORY_ABI, provider);
        const tokenAddresses = await factory.getUserTokens(userAccount);
        
        if (tokenAddresses.length === 0) {
            list.innerHTML = `<p style="text-align:center; opacity:0.6;">You haven't created any tokens here yet.</p>`;
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
                const formattedTotal = ethers.formatUnits(total, decimals);
                return { addr, name, symbol, total: formattedTotal };
            } catch (err) {
                return { addr, name: "Unknown", symbol: "???", total: "0" };
            }
        });

        const allTokens = await Promise.all(tokenDataPromises);

        list.innerHTML = allTokens.reverse().map(token => `
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
                        <span>${token.addr.substring(0, 10)}...${token.addr.substring(token.addr.length - 4)}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error("Load dashboard error:", e);
        list.innerHTML = `<p style="text-align:center; color: #ff4d4d;">Error loading token list.</p>`;
    }
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.replace('fa-copy', 'fa-check');
            icon.style.color = '#00f2ff';
            setTimeout(() => {
                icon.classList.replace('fa-check', 'fa-copy');
                icon.style.color = '';
            }, 2000);
        }
    });
}