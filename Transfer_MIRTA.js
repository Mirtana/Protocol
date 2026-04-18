const MIRTA_CONFIG = {
    // Robinhood Testnet (ChainID: 46630)
    46630: {
        address: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
        explorer: "https://explorer.testnet.chain.robinhood.com/tx/"
    },
    // Arc Testnet (ChainID: 5042002)
    5042002: {
        address: "0xad4d6Ed80F18768a1DdE5f2b6a97a900A5C874e1",
        explorer: "https://testnet.arcscan.app/tx/"
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

        const minABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
        const contract = new ethers.Contract(config.address, minABI, provider);

        const [balance, decimals] = await Promise.all([
            contract.balanceOf(userAccount),
            contract.decimals()
        ]);

        const formattedBalance = ethers.formatUnits(balance, decimals);
        const input = document.getElementById('transferAmount');
        if (input) input.value = formattedBalance;

    } catch (e) {
        console.error("Balance fetch failed", e);
    }
}

async function sendMirtaTokens() {
    const recipient = document.getElementById('transferAddress').value;
    const amount = document.getElementById('transferAmount').value;

    // Валидация
    if (!ethers.isAddress(recipient)) return alert("Invalid recipient address!");
    if (!amount || amount <= 0) return alert("Enter valid amount!");

    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const config = MIRTA_CONFIG[chainId];

        if (!config) {
            alert("MIRTA token is not available on this network!");
            return;
        }

        // 1. Открываем модалку инициализации
        if (window.openModal) {
            window.openModal('loading', `Preparing to send ${amount} MIRTA to ${recipient.substring(0, 8)}...`);
        }

        const abi = [
            "function transfer(address to, uint256 amount) returns (bool)", 
            "function decimals() view returns (uint8)"
        ];
        const contract = new ethers.Contract(config.address, abi, signer);

        const decimals = await contract.decimals();
        const parsedAmount = ethers.parseUnits(amount, decimals);

        // 2. Запрос в кошельке
        const tx = await contract.transfer(recipient, parsedAmount);
        
        // 3. Обновляем статус: Транзакция в блокчейне
        if (window.openModal) {
            window.openModal('loading', 'Transfer sent! Waiting for network confirmation...', tx.hash);
        }

        // 4. Ожидание подтверждения
        await tx.wait();

        // 5. УСПЕХ
        if (window.openModal) {
            window.openModal('success', `Successfully transferred ${amount} MIRTA to ${recipient}`, tx.hash);
        }

        // Очищаем поля ввода
        document.getElementById('transferAddress').value = "";
        document.getElementById('transferAmount').value = "";

        // Обновляем балансы в интерфейсе
        if (typeof updateBalances === 'function') updateBalances();

    } catch (e) {
        console.error("Transfer failed", e);
        
        if (e.code === 4001) {
            // Если отмена пользователем, закрываем модалку без ошибки
            if (window.closeStatusModal) window.closeStatusModal();
        } else {
            // Показываем ошибку через универсальную модалку
            const errorMsg = e.reason || e.message || "Transaction failed. Please check your balance or gas.";
            if (window.openModal) {
                window.openModal('error', errorMsg);
            }
        }
    }
}