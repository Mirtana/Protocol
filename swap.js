let swapContract;
let currentBuyBackPriceWei = 0n;

/** * 1. Инициализация контракта свапа 
 * Теперь берет данные из конфига текущей сети
 */
async function initSwap() {
    try {
        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);
        const swapAddress = CONTRACT_CONFIG[chainId]?.SWAP_ADDRESS;

        if (swapAddress && swapAddress !== "0x0000000000000000000000000000000000000000") {
            // Используем глобальный signer из твоего app-connect.js
            swapContract = new ethers.Contract(swapAddress, SWAP_ABI, signer);
            console.log(`Swap Contract initialized on chain ${chainId}`);
            await fetchSwapPrice(); // Сразу подтягиваем цену
        } else {
            console.warn("Swap address not found for this network");
        }
    } catch (e) {
        console.error("Failed to init swap:", e);
    }
}

/** * 2. Получаем актуальную цену из контракта 
 */
async function fetchSwapPrice() {
    if (!swapContract) return;
    try {
        currentBuyBackPriceWei = await swapContract.buyBackPrice();
        const priceEth = ethers.formatUnits(currentBuyBackPriceWei, 18);
        
        const displayElement = document.getElementById('currentBuybackPrice');
        if (displayElement) {
            displayElement.innerText = priceEth;
        }
    } catch (e) {
        console.error("Error fetching price:", e);
    }
}

/** * 3. "Живой" расчет в интерфейсе (Калькулятор)
 */
function updateSwapReturn() {
    const amountInput = document.getElementById('swapAmountMirta').value;
    const outputField = document.getElementById('ethReceiveEstimate');
    
    if (!amountInput || amountInput <= 0 || currentBuyBackPriceWei === 0n) {
        if (outputField) outputField.value = "0.0";
        return;
    }

    try {
        // Расчет: (MIRTA_Amount * BuyBackPrice) / 10^18
        const amountWei = ethers.parseUnits(amountInput, 18);
        const totalReturnWei = (amountWei * currentBuyBackPriceWei) / ethers.parseUnits("1", 18);
        
        if (outputField) {
            // Форматируем до 6 знаков для красоты
            const formatted = ethers.formatUnits(totalReturnWei, 18);
            outputField.value = parseFloat(formatted).toFixed(6);
        }
    } catch (e) {
        if (outputField) outputField.value = "Error";
    }
}

/** * 4. Функция Свапа MIRTA -> ETH 
 */
async function swapMirta() {
    const amountInput = document.getElementById('swapAmountMirta').value;
    if (!amountInput || amountInput <= 0) return alert("Enter amount!");

    if (!swapContract) {
        return alert("Swap contract not initialized. Please check your network.");
    }

    try {
        const net = await provider.getNetwork();
        const chainId = Number(net.chainId);
        const amountWei = ethers.parseUnits(amountInput, 18);
        const userAddress = await signer.getAddress();
        const mirtaAddress = CONTRACT_CONFIG[chainId].MIRTA;

        // 1. Проверяем и делаем Approve
        const mirtaToken = new ethers.Contract(mirtaAddress, [
            "function allowance(address, address) view returns (uint256)",
            "function approve(address, uint256) returns (bool)"
        ], signer);

        const currentAllowance = await mirtaToken.allowance(userAddress, swapContract.target);

        if (currentAllowance < amountWei) {
            openModal('loading', 'Step 1/2: Approving MIRTA...');
            const txApprove = await mirtaToken.approve(swapContract.target, amountWei);
            await txApprove.wait();
        }

        // 2. Выполняем сам Свап
        openModal('loading', 'Step 2/2: Swapping to ETH...');
        const txSwap = await swapContract.swapMirtaToEth(amountWei);
        await txSwap.wait();

        openModal('success', `Successfully swapped ${amountInput} MIRTA for ETH!`, txSwap.hash);
        
        // Обновляем балансы в хедере и цену
        if (typeof updateBalances === "function") await updateBalances(); 
        await fetchSwapPrice();
        document.getElementById('swapAmountMirta').value = "";
        updateSwapReturn();

    } catch (e) {
        console.error(e);
        const errorMessage = e.reason || e.message || "Swap failed";
        openModal('error', errorMessage);
    }
}