// 1. Твои ссылки
const pinataLinks = {
    1: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeiefgqgikud4zzjqjwygpzk7r4tnbddxczxuv7digwscv5lnck5n74",
    2: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeias3gmfaj6532haybgotwmf3ixtvuyp2ktbhv5tobh43kwwysnili",
    3: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeibohyqlulcvneu364fpsfyz25u5bryquol3azmdi2ghlb4ruq7zjm",
    4: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeicn25bixcyq6eluts77ui4dhawjp3vw3n7fryznhqrasmgnuskviq",
    5: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeig2ancpwjnsmjcs6yuuouz6n4hqfp6uhch5nia6hdg72rezfrgmpy",
    6: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeigsk4ccswblgk45ma7n7b4uhb7maxqfbsydm5gjiwjbdt77mchova",
    7: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeiap76t3o6xo73jnne6vjyyy2sxn2k57c4ftxoh2dmu56bomuu6y7y",
    8: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeievt7kdqqxnlextsjhagpcclfqbg46mg6zeikky3ribwqrs3pj5we",
    9: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeibaasdyspehpm6ilymaars3vccycyzarhzxqmhvsuefra3qsvnbj4",
    10: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeie6emalqsqbxzvmmt6afseo2ktqcqzq6rvdqjejo2zjve4fqw3tia",
    11: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeifpgfz344q766fx2w55ajcs436bui5gl33mce6kzuegtj4h7mqkxu",
    12: "https://orange-characteristic-lion-588.mypinata.cloud/ipfs/bafybeiaprfe7pckfwui2xvwez5bbl77klw4nh75a5frveia7quolnxfrpm",
};


// const NETWORKS = {
//     "0xB626": {
//         nftAddress: "0xa37b518e9CC09FFb3280810Ff456999AC84D10cc",
//         explorer: "https://explorer.testnet.chain.robinhood.com"
//     },
//     "0x4cef52": {
//         nftAddress: "0x392a38398ab7358947caCC77F244A5ee1D6091f5",
//         explorer: "https://testnet.arcscan.app"
//     }
// };


function createNFTCard(id, isOwned, realTokenId = null) {
    const fullName = monthNames[id]; 
    const imagePath = pinataLinks[id]; 

    const statusClass = isOwned ? 'unlocked' : 'locked';
    const statusText = isOwned ? 'Unlocked' : 'Locked';

    // Если у нас есть реальный ID из контракта, используем его, иначе ID месяца
    const transferId = (realTokenId !== null) ? realTokenId : id;

    const actionButton = isOwned 
        ? `<button onclick="prepareTransfer(${transferId}, '${fullName}')" class="btn-transfer-card">TRANSFER</button>`
        : `<button onclick="showSection('nft-mint-section', this)" class="btn-mint-card">MINT NOW</button>`;

    return `
        <div class="nft-collection-card ${statusClass}">
            <img src="${imagePath}" class="nft-card-img" alt="${fullName}">
            <div class="nft-card-info">
                <h4 class="nft-month">${fullName}</h4>
                <span class="nft-status">${statusText}</span>
                <div class="card-actions">${actionButton}</div>
            </div>
        </div>
    `;
}

async function loadDashboard() {
    const grid = document.getElementById('nft-collection-grid');
    const countDisplay = document.getElementById('user-nft-count');
    if (!grid) return;

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16).toLowerCase();
        const currentConfig = NETWORKS[chainId];
        if (!currentConfig) return;

        const nftContract = new ethers.Contract(currentConfig.nftAddress, NFT_ABI, signer);

        // Получаем списки через новые функции твоего контракта
        const userTokenIds = await nftContract.getUserNFTs(userAddress);
        const userEditions = await nftContract.getUserEditions(userAddress);

        // Создаем карту: какой месяц -> какой реальный ID токена
        const ownershipMap = {};
        userEditions.forEach((edition, index) => {
            ownershipMap[Number(edition)] = Number(userTokenIds[index]);
        });

        grid.innerHTML = '';
        let ownedCount = 0;

        for (let monthId = 1; monthId <= 12; monthId++) {
            const realId = ownershipMap[monthId];
            const isOwned = (realId !== undefined);
            
            if (isOwned) ownedCount++;
            
            // Передаем realId в функцию создания карточки
            grid.innerHTML += createNFTCard(monthId, isOwned, realId);
        }
        
        if (countDisplay) countDisplay.innerText = ownedCount;
        
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// 1. Подготовка трансфера
function prepareTransfer(tokenId, name) {
    const content = `
        <div class="transfer-box" style="text-align:center;">
            <p style="margin-bottom: 15px; color: #fff; font-size: 14px;">
                You are transferring <b>${name}</b><br>
                <span style="color: #00f2ff; font-size: 12px;">Token ID: ${tokenId}</span>
            </p>
            <input type="text" id="destAddress" placeholder="0x... Recipient Address" 
                   style="width:100%; padding:12px; border-radius:8px; border:1px solid #333; background:#1a1a1a; color:white; outline:none; font-size: 13px;">
            <button onclick="executeTransfer(${tokenId}, '${name}')" class="mint-btn" 
                    style="margin-top: 20px; width: 100%; cursor: pointer;">
                SEND ASSET
            </button>
        </div>
    `;

    updateModal("Transfer NFT", content, false);

    // --- УПРАВЛЕНИЕ ВИЗУАЛОМ (чтобы не ломать другие функции) ---
    const txInfo = document.getElementById("txInfo");
    const closeBtn = document.getElementById("statusCloseBtn");

    if (txInfo) txInfo.style.display = "none"; // Прячем блок стейкинга только сейчас
    if (closeBtn) closeBtn.style.display = "none"; // Прячем кнопку закрытия
}

// 2. Выполнение транзакции
async function executeTransfer(tokenId, name) {
    const to = document.getElementById('destAddress').value.trim();
    const txInfo = document.getElementById("txInfo");
    const closeBtn = document.getElementById("statusCloseBtn");

    if (!ethers.isAddress(to)) {
        updateModal("Error", "Invalid wallet address.", false);
        if (closeBtn) closeBtn.style.display = "block";
        return;
    }

    try {
        updateModal("Processing", "Confirm transaction in your wallet...", true);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16).toLowerCase();
        const currentConfig = NETWORKS[chainId];
        
        const nftContract = new ethers.Contract(currentConfig.nftAddress, NFT_ABI, signer);
        const tx = await nftContract.safeTransferFrom(await signer.getAddress(), to, tokenId);
        
        let explorerBase = currentConfig.explorer || "";
        explorerBase = explorerBase.replace(/\/$/, ''); 
        const explorerUrl = `${explorerBase}/${tx.hash}`;
        
        const pendingContent = `
            <div style="text-align:center;">
                <p>Transferring <b>${name}</b>...</p>
                <p style="margin: 15px 0;"><small style="opacity:0.5; font-size:10px; word-break:break-all;">Hash: ${tx.hash}</small></p>
            </div>
        `;
        updateModal("Pending", pendingContent, true);

        // Показываем блок со ссылкой, но без текста "Staked"
        if (txInfo) {
            txInfo.style.display = "block";
            const stakedText = txInfo.querySelector('p');
            if (stakedText) stakedText.style.display = "none"; // Скрываем именно "Staked: 0 MIRTA"
            
            const link = document.getElementById("explorerLink");
            if (link) {
                link.href = explorerUrl;
                link.style.display = "inline-block";
            }
        }

        await tx.wait();

        updateModal("Success", `<b>${name}</b> successfully transferred!`, false);
        if (closeBtn) closeBtn.style.display = "block"; // Показываем кнопку в самом конце

        setTimeout(() => { if (typeof loadDashboard === "function") loadDashboard(); }, 2000);

    } catch (e) {
        console.error(e);
        updateModal("Error", e.reason || "Transaction failed", false);
        if (closeBtn) closeBtn.style.display = "block";
        
        // Возвращаем видимость тексту стейкинга для других функций при закрытии
        const stakedText = txInfo?.querySelector('p');
        if (stakedText) stakedText.style.display = "block";
    }
}







function updateModal(title, content, showLoader = false) {
    const modal = document.getElementById("statusModal");
    const titleEl = document.getElementById("statusTitle");
    const messageEl = document.getElementById("statusMessage");
    const loaderEl = document.getElementById("statusLoader");
    const closeBtn = document.getElementById("statusCloseBtn");

    if (!modal || !titleEl || !messageEl) {
        console.error("Элементы модального окна не найдены в HTML!");
        return;
    }

    titleEl.innerText = title;
    messageEl.innerHTML = content;
    
    // Лоадер
    if (loaderEl) loaderEl.style.display = showLoader ? "block" : "none";
    
    // Кнопка CLOSE
    if (closeBtn) {
        closeBtn.style.display = showLoader ? "none" : "block";
        closeBtn.onclick = () => modal.style.display = "none";
    }

    modal.style.display = "flex";
}