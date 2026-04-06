// Выносим конфиг в глобальную область, чтобы обе функции имели к нему доступ
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
    if (!userAccount) return;
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

        // Используем универсальный способ форматирования для ethers v6/v5
        const formattedBalance = ethers.formatUnits 
            ? ethers.formatUnits(balance, decimals) 
            : ethers.utils.formatUnits(balance, decimals);

        document.getElementById('transferAmount').value = formattedBalance;
    } catch (e) {
        console.error("Balance fetch failed", e);
    }
}

async function sendMirtaTokens() {
    const recipient = document.getElementById('transferAddress').value;
    const amount = document.getElementById('transferAmount').value;

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

        const abi = ["function transfer(address to, uint256 amount) returns (bool)", "function decimals() view returns (uint8)"];
        const contract = new ethers.Contract(config.address, abi, signer);

        const decimals = await contract.decimals();
        const parsedAmount = ethers.parseUnits(amount, decimals);

        // Показываем модалку загрузки
        showGMProcessingModal(true); 
        document.getElementById('modalTitle').innerText = "Sending MIRTA...";
        document.getElementById('modalDesc').innerText = `Transferring ${amount} to ${recipient.substring(0,6)}...`;

        const tx = await contract.transfer(recipient, parsedAmount);
        await tx.wait();

        // Показываем успех с правильным хешем и ссылкой на эксплорер текущей сети
        const scanUrl = `${config.explorer}${tx.hash}`;
        showGMSuccessModal(tx.hash, scanUrl);
        
        document.getElementById('modalTitle').innerText = "Transfer Complete!";
        document.getElementById('modalDesc').innerText = "Tokens sent successfully.";
        
    } catch (e) {
        console.error("Transfer failed", e);
        closeModal(); 
        
        if (e.code === 4001) {
            console.log("User cancelled transaction");
        } else {
            alert("Transaction failed! Check console.");
        }
    }
}