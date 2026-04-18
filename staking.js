// ==========================================
// 1. КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================

const ADDRESSES = {
    46630: { // Robinhood Testnet
        staking: "0x8AE8e28E19a66aDfD816Ab1833bAb8a734BDD09a",
        token: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
    },
    5042002: {
        staking: "0x5956ac1Fc6178EC22d873dD1aC371E35253F5ff6",
        token: "0xad4d6Ed80F18768a1DdE5f2b6a97a900A5C874e1",
    },
    11155111: { // Sepolia
        staking: "0x32446FdE8838482b3F8D0E4a9A28A1Df3cbCee5D", 
        token: "0x97773AAb730103aa2957E2Cc299488c41753b54C",
    }
};

const EXPLORERS = {
    46630: "https://explorer.testnet.chain.robinhood.com/tx/",
    5042002: "https://testnet.arcscan.app/tx/",
    11155111: "https://sepolia.etherscan.io/tx/"
};

const STAKING_ABI = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address","name":"_token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"REWARD_RATE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"enum MirtanaStaking.StakingTier","name":"tier","type":"uint8"}],"name":"calculateReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fundRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"enum MirtanaStaking.StakingTier","name":"tier","type":"uint8"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stakingToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum MirtanaStaking.StakingTier","name":"","type":"uint8"}],"name":"tierConfigs","outputs":[{"internalType":"uint256","name":"lockDuration","type":"uint256"},{"internalType":"uint256","name":"rewardMultiplier","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"enum MirtanaStaking.StakingTier","name":"tier","type":"uint8"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"enum MirtanaStaking.StakingTier","name":"","type":"uint8"}],"name":"userStakes","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"lockDuration","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"}];

const plans = [
    { id: 0, name: "Flexible", apy: "10.5%" },
    { id: 1, name: "7 Days", apy: "15%" },
    { id: 2, name: "30 Days", apy: "18%" },
    { id: 3, name: "90 Days", apy: "22.5%" }
];

let stakingContract;
let globalSigner;
let selectedTier = 0; 
let STAKING_ADDRESS;
let MIRTA_TOKEN_ADDRESS;



// ==========================================
// 2. СЛУЖЕБНЫЕ ФУНКЦИИ И ИНИЦИАЛИЗАЦИЯ
// ==========================================

async function updateContractAddresses() {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const currentConfig = ADDRESSES[chainId];

    if (!currentConfig) {
        alert("This network is not supported!");
        return false;
    }

    MIRTA_TOKEN_ADDRESS = currentConfig.token;
    STAKING_ADDRESS = currentConfig.staking;
    return true;
}

async function setMaxStake() {
    if (!userAccount || !signer) return;
    try {
        // Берем адрес из уже определенной глобальной переменной
        const tokenAddr = MIRTA_TOKEN_ADDRESS; 
        if (!tokenAddr) return;

        const minABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
        const tokenContract = new ethers.Contract(tokenAddr, minABI, provider);
        

        // 3. Получаем баланс и количество знаков
        const [balance, decimals] = await Promise.all([
            tokenContract.balanceOf(userAccount),
            tokenContract.decimals()
        ]);

        // 4. Форматируем в понятное число (например, из 1000000000000000000 в 1.0)
        const formattedBalance = ethers.formatUnits(balance, decimals);

        // 5. Подставляем в инпут по твоему ID 'stakeAmount'
        const input = document.getElementById('stakeAmount');
        if (input) {
            input.value = formattedBalance;
            
            // 6. Генерируем событие ввода, чтобы сразу сработал расчет наград (updateRewardCalc)
            input.dispatchEvent(new Event('input'));
        }

    } catch (e) {
        console.error("Error fetching MIRTA balance:", e);
    }
}



// ==========================================
// 3. ФУНКЦИИ КАЛЬКУЛЯТОРА (UI LOGIC)
// ==========================================

function updateRewardCalc() {
    const amountInput = document.getElementById('stakeAmount');
    const rewardSpan = document.getElementById('calculatedReward');
    const rewardHint = document.getElementById('stakeRewardCalc');
    
    if (!amountInput || !rewardSpan) return;
    const amount = parseFloat(amountInput.value) || 0;
    
    const tiers = [
        { name: "Flexible", apy: 10.5, days: 1 },
        { name: "7 Days", apy: 15, days: 7 },
        { name: "30 Days", apy: 18, days: 30 },
        { name: "90 Days", apy: 22.5, days: 90 }
    ];

    const currentTier = tiers[selectedTier] || tiers[0];

    if (amount > 0) {
        const yearly = (amount * currentTier.apy) / 100;
        const daily = yearly / 365;
        const totalForPeriod = daily * currentTier.days;

        if (currentTier.days <= 1) {
            rewardSpan.innerText = daily.toFixed(2);
            rewardHint.innerHTML = `~<span id="calculatedReward">${daily.toFixed(2)}</span> MIRTA Daily Reward`;
        } else {
            rewardSpan.innerText = totalForPeriod.toFixed(2);
            rewardHint.innerHTML = `~<span id="calculatedReward">${totalForPeriod.toFixed(2)}</span> MIRTA Total Reward (${currentTier.name})`;
        }
    } else {
        rewardSpan.innerText = "0.00";
        rewardHint.innerHTML = `~<span id="calculatedReward">0.00</span> MIRTA Reward`;
    }
}

function calculateAndDisplayRewards() {
    const amountInput = document.getElementById('stakeAmount');
    const rewardDisplay = document.getElementById('rewardProjectionDisplay');
    
    if (!amountInput || !rewardDisplay) return;
    const amount = parseFloat(amountInput.value) || 0;
    
    const tiers = [
        { name: "Flexible", apy: 10.5, days: 1 },
        { name: "7 Days", apy: 15, days: 7 },
        { name: "30 Days", apy: 18, days: 30 },
        { name: "90 Days", apy: 22.5, days: 90 }
    ];

    const currentTier = tiers[selectedTier] || tiers[0];

    if (amount > 0) {
        const yearly = (amount * currentTier.apy) / 100;
        const daily = yearly / 365;
        const totalForPeriod = daily * currentTier.days;

        if (currentTier.days <= 1) {
            rewardDisplay.innerText = `~${daily.toFixed(2)} MIRTA Daily Reward`;
        } else {
            rewardDisplay.innerText = `~${totalForPeriod.toFixed(2)} MIRTA Total Reward (${currentTier.name})`;
        }
    } else {
        rewardDisplay.innerText = `~0,00 MIRTA Reward`;
    }
}



// ==========================================
// 4. ОСНОВНЫЕ БЛОКЧЕЙН-ОПЕРАЦИИ (STAKE/UNSTAKE)
// ==========================================

async function stakeTokens() {
    const amountInput = document.getElementById('stakeAmount').value;
    
    // Проверка ввода
    if (!amountInput || Number(amountInput) <= 0) {
        return alert("Please enter an amount greater than 0");
    }

    // Проверка глобальных переменных (из ADDRESSES)
    if (!STAKING_ADDRESS || !MIRTA_TOKEN_ADDRESS) {
        return alert("Contract addresses not found. Please check your network connection.");
    }

    try {
        // 1. Инициализация провайдера и сигнера
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        // Открываем модалку: Начало процесса
        if (window.openModal) {
            window.openModal('loading', 'Preparing your staking transaction...');
        }

        // 2. Настройка контрактов
        const stakingContract = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
        const tokenAbi = [
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function allowance(address owner, address spender) external view returns (uint256)",
            "function balanceOf(address account) external view returns (uint256)"
        ];
        const tokenContract = new ethers.Contract(MIRTA_TOKEN_ADDRESS, tokenAbi, signer);

        const amountWei = ethers.parseUnits(amountInput, 18);

        // 3. Проверка баланса
        const balance = await tokenContract.balanceOf(userAddress);
        if (balance < amountWei) {
            throw new Error(`Insufficient balance. You have ${ethers.formatUnits(balance, 18)} MIRTA`);
        }

        // 4. Проверка и выполнение Approval (Шаг 1)
        const allowance = await tokenContract.allowance(userAddress, STAKING_ADDRESS);
        if (allowance < amountWei) {
            if (window.openModal) {
                window.openModal('loading', 'Step 1/2: Approving MIRTA tokens. Please confirm in your wallet...');
            }
            const approveTx = await tokenContract.approve(STAKING_ADDRESS, amountWei);
            await approveTx.wait();
            console.log("Approval confirmed");
        }

        // 5. Выполнение Staking (Шаг 2)
        if (window.openModal) {
            window.openModal('loading', 'Step 2/2: Confirming stake in your wallet...');
        }

        const tx = await stakingContract.stake(amountWei, Number(selectedTier));

        // 6. Ожидание подтверждения в блокчейне
        if (window.openModal) {
            window.openModal('loading', 'Transaction sent! Finalizing on blockchain...', tx.hash);
        }

        await tx.wait();

        // 7. УСПЕХ
        if (window.openModal) {
            window.openModal('success', `Successfully staked ${amountInput} MIRTA! Your rewards start accumulating now.`, tx.hash);
        }

        // Обновляем данные на странице
        if (typeof loadUserStakes === 'function') loadUserStakes();

    } catch (error) {
        console.error("Staking error:", error);
        
        // Закрываем модалку или показываем ошибку
        if (error.code === 4001) {
            // Если пользователь отменил транзакцию сам — просто закрываем
            if (window.closeStatusModal) window.closeStatusModal();
            alert("Transaction rejected by user.");
        } else {
            // Если произошла техническая ошибка — показываем в модалке
            const errorMessage = error.reason || error.message || "Staking failed. Please try again.";
            if (window.openModal) {
                window.openModal('error', errorMessage);
            }
        }
    }
}

async function unstake(tier) {
    try {
        // 1. Проверка инициализации
        if (!stakingContract) await initStaking();
        const userAddress = await globalSigner.getAddress();

        // Открываем модалку в режиме загрузки
        if (window.openModal) {
            window.openModal('loading', 'Reading stake data and calculating rewards...');
        }

        // 2. Получаем данные о стейке до транзакции (для финального отчета)
        const stakeData = await stakingContract.userStakes(userAddress, tier);
        const rewardAmount = await stakingContract.calculateReward(userAddress, tier);
        
        const amountLocked = ethers.formatUnits(stakeData.amount, 18);
        const amountReward = ethers.formatUnits(rewardAmount, 18);
        const totalAmount = (Number(amountLocked) + Number(amountReward)).toFixed(4);

        // 3. Запрос подписи в кошельке
        if (window.openModal) {
            window.openModal('loading', 'Please confirm the Unstake & Claim transaction in your wallet...');
        }

        const tx = await stakingContract.unstake(tier);

        // 4. Ожидание подтверждения
        if (window.openModal) {
            window.openModal('loading', 'Processing withdrawal... Your tokens are on the way.', tx.hash);
        }

        await tx.wait();

        // 5. УСПЕХ (с твоим кастомным HTML-отчетом)
        if (window.openModal) {
            const successHtml = `
                <p style="margin-bottom: 15px;">Tokens and rewards successfully withdrawn!</p>
                <div style="text-align: left; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; border: 1px solid rgba(0,242,255,0.2);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                        <span style="color: #8a8d91;">Returned Deposit:</span>
                        <span style="color: #fff; font-weight: bold;">${Number(amountLocked).toLocaleString()} MIRTA</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: #00f2ff; font-size: 14px;">
                        <span>Earned Reward:</span>
                        <span style="font-weight: bold;">+${Number(amountReward).toFixed(4)} MIRTA</span>
                    </div>
                    <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold;">
                        <span>Total Received:</span>
                        <span style="color: #fff;">${totalAmount}</span>
                    </div>
                </div>
            `;
            window.openModal('success', successHtml, tx.hash);
        }

        // Обновляем список стейков на странице
        if (typeof loadUserStakes === 'function') loadUserStakes();

    } catch (e) {
        console.error("Unstake error:", e);
        
        if (e.code === 4001) {
            if (window.closeStatusModal) window.closeStatusModal();
            alert("Transaction rejected.");
        } else {
            const errorMsg = e.reason || e.message || "Unstake failed. Make sure the lock period has ended.";
            if (window.openModal) {
                window.openModal('error', errorMsg);
            }
        }
    }
}

// ==========================================
// 5. ОТОБРАЖЕНИЕ АКТИВНЫХ СТЕЙКОВ И ТАЙМЕРЫ
// ==========================================

async function loadUserStakes() {
    if (!globalSigner || !stakingContract) return;
    const container = document.getElementById('userStakesList');
    try {
        const user = await globalSigner.getAddress();
        let html = "";
        const now = Math.floor(Date.now() / 1000);

        for (let i = 0; i < 4; i++) {
            const data = await stakingContract.userStakes(user, i);
            if (data.amount > 0n) {
                const reward = await stakingContract.calculateReward(user, i);
                const startTime = Number(data.startTime);
                const lockDuration = Number(data.lockDuration);
                const endTime = startTime + lockDuration;
                const isLocked = now < endTime;

                html += `
                    <div class="active-stake-card">
                        <div class="stake-main-info">
                            <div class="stake-stat">
                                <label>Plan</label>
                                <span class="plan-name">${plans[i].name}</span>
                            </div>
                            <div class="stake-stat">
                                <label>Staked Amount</label>
                                <span>${Number(ethers.formatUnits(data.amount, 18)).toLocaleString()} MIRTA</span>
                            </div>
                            <div class="stake-stat">
                                <label>Earned Reward</label>
                                <span class="reward-value">+${Number(ethers.formatUnits(reward, 18)).toFixed(4)}</span>
                            </div>
                            ${isLocked ? `
                            <div class="stake-stat">
                                <label>Unlocks In</label>
                                <span class="countdown-timer" data-endtime="${endTime}">Loading...</span>
                            </div>
                            ` : ''}
                        </div>
                        <div class="stake-action">
                            <button class="unstake-btn-modern" ${isLocked ? 'disabled' : ''} onclick="unstake(${i})">
                                ${isLocked ? 'Locked' : 'Unstake & Claim'}
                            </button>
                        </div>
                    </div>`;
            }
        }
        container.innerHTML = html || "No active stakes";
        startGlobalTimers();
    } catch (e) { console.error(e); }
}

function startGlobalTimers() {
    if (window.stakeTimerInterval) clearInterval(window.stakeTimerInterval);

    window.stakeTimerInterval = setInterval(() => {
        const timers = document.querySelectorAll('.countdown-timer');
        const now = Math.floor(Date.now() / 1000);

        timers.forEach(timer => {
            const endTime = parseInt(timer.getAttribute('data-endtime'));
            const timeLeft = endTime - now;

            if (timeLeft <= 0) {
                timer.innerText = "Unlocked!";
                timer.style.color = "#00f2ff";
            } else {
                const days = Math.floor(timeLeft / 86400);
                const hours = Math.floor((timeLeft % 86400) / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                let timeStr = "";
                if (days > 0) timeStr += `${days}d `;
                timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                timer.innerText = timeStr;
            }
        });
    }, 1000);
}


// ==========================================
// 6. UI ИНТЕРФЕЙС И СОБЫТИЯ
// ==========================================

function initStakingUI() {
    const grid = document.getElementById('stakingPlans');
    if (!grid) return;
    grid.innerHTML = plans.map(p => `
        <div class="plan-card ${p.id === selectedTier ? 'active' : ''}" onclick="selectTier(${p.id}, this)">
            <h4>${p.name}</h4><span class="apy">${p.apy} APY</span>
        </div>`).join('');
}

function selectTier(id, element) {
    selectedTier = id;
    document.querySelectorAll('.plan-card').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    updateRewardCalc();
}

function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}



// ==========================================
// 7. СЛУШАТЕЛИ СОБЫТИЙ И ЗАПУСК
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initStakingUI();
    const input = document.getElementById('stakeAmount');
    if (input) input.addEventListener('input', updateRewardCalc);
    if (window.ethereum) initStaking();
});

if (window.ethereum) {
    /** Перезагрузка страницы при смене сети */
    window.ethereum.on('chainChanged', () => window.location.reload());

    /** Перезагрузка страницы при смене аккаунта */
    window.ethereum.on('accountsChanged', () => window.location.reload());
}