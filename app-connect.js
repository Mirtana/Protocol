const connectBtn = document.getElementById('connect-btn');
const networkBtn = document.getElementById('current-network');
const networkList = document.getElementById('network-list');
const balancesDiv = document.getElementById('balances');


// 1. Логика подключения кошелька
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            
            // Меняем кнопку на короткий адрес
            connectBtn.innerText = address.substring(0, 6) + "..." + address.substring(address.length - 4);
            
            // Показываем балансы
            balancesDiv.classList.remove('hidden');
            updateBalances(provider, address);
            
        } catch (error) {
            console.error("Ошибка подключения:", error);
        }
    } else {
        alert("Пожалуйста, установите MetaMask!");
    }
}

async function updateBalances(provider, address) {
    // Получение нативного баланса
    const balance = await provider.getBalance(address);
    document.getElementById('native-balance').innerText = parseFloat(ethers.formatEther(balance)).toFixed(4);
    
    // Заглушка для MIRTA (пока нет контракта)
    document.getElementById('mirta-balance').innerText = "0.00";
}

connectBtn.addEventListener('click', connectWallet);


// 2. Управление выпадающим списком
networkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    networkList.classList.toggle('show');
});

window.addEventListener('click', () => {
    networkList.classList.remove('show');
});


// 3. Смена сети (визуальная часть)
networkList.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        networkBtn.innerText = e.target.innerText;
        networkList.classList.remove('show');
        // Здесь будет логика switchNetwork через MetaMask
    });
});