// 1. Твой объект с прямыми ссылками
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

function createNFTCard(id, isOwned) {
    const fullName = monthNames[id]; 
    const imagePath = pinataLinks[id]; 

    const statusClass = isOwned ? 'unlocked' : 'locked';
    const statusText = isOwned ? 'Unlocked' : 'Locked';

    // ФИКС: Кнопка Mint Now теперь ведет на секцию минта NFT, а не токена
    const actionButton = isOwned 
        ? `<button onclick="prepareTransfer(${id}, '${fullName}')" class="btn-transfer-card">TRANSFER</button>`
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
    const networkDisplay = document.getElementById('current-network-name');
    if (!grid) return;

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16).toLowerCase();
        
        const currentConfig = NETWORKS[chainId];
        if (!currentConfig) return;

        networkDisplay.innerText = (chainId === '0x4cef52') ? "ARC MAINNET" : "ROBINHOOD";
        
        const nftContract = new ethers.Contract(currentConfig.nftAddress, NFT_ABI, signer);

        grid.innerHTML = '';
        let ownedCount = 0;

        for (let monthId = 1; monthId <= 12; monthId++) {
            let isOwned = false;
            try {
                isOwned = await nftContract.hasEditionMinted(userAddress, monthId);
                if (isOwned) {
                    ownedCount++;
                }
            } catch (e) { 
                console.error(`Error checking month ${monthId}:`, e);
            }
            grid.innerHTML += createNFTCard(monthId, isOwned);
        }
        
        countDisplay.innerText = ownedCount;

        // --- ФИКС ДУБЛИРОВАНИЯ ---
        const existingNotice = document.querySelector('.dashboard-notice.info-panel');
        if (existingNotice) {
            existingNotice.remove();
        }

        grid.insertAdjacentHTML('afterend', `
            <div class="dashboard-notice info-panel">
                <div class="panel-content">
                    <span class="panel-icon">⚠️</span>
                    <p class="panel-text">
                        <b>LIMIT:</b> Each address is limited to minting only 12 unique NFTs (one for each month).<br>
                        Transferring an asset does not restore the right to re-mint that month.
                    </p>
                </div>
            </div>
        `);
        
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

function prepareTransfer(tokenId, name) {
    const content = `
        <div class="transfer-box" style="text-align:center;">
            <p style="margin-bottom: 15px; color: #fff;">Transfer <b>${name}</b></p>
            <input type="text" id="destAddress" placeholder="0x... Recipient Address">
            <button onclick="executeTransfer(${tokenId})" class="mint-btn" style="margin-top: 20px; width: 100%;">SEND ASSET</button>
        </div>
    `;
    updateModal("Transfer NFT", content, false);
}

async function executeTransfer(tokenId) {
    const to = document.getElementById('destAddress').value;
    
    if (!ethers.isAddress(to)) {
        alert("Invalid wallet address!");
        return;
    }

    const nftName = monthNames[tokenId] || `NFT #${tokenId}`;

    try {
        updateModal("Processing", "Please confirm transaction in your wallet...", true);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16).toLowerCase();
        
        const currentConfig = NETWORKS[chainId];
        const nftContract = new ethers.Contract(currentConfig.nftAddress, NFT_ABI, signer);
        
        const tx = await nftContract.transferFrom(await signer.getAddress(), to, tokenId);
        
        updateModal("Pending", `Transferring <b>${nftName}</b>...<br><br>Hash: <small>${tx.hash}</small>`, true);
        
        await tx.wait();

        const successMsg = `
            Successfully sent <b>${nftName}</b>!<br>
            <div style="margin-top:10px; font-size:0.8rem; opacity:0.8;">
                TX: ${tx.hash.substring(0, 10)}...${tx.hash.substring(62)}
            </div>
        `;
        
        updateModal("Success", successMsg, false);
        loadDashboard(); 
        
    } catch (e) {
        console.error(e);
        updateModal("Error", e.reason || "Transaction failed or cancelled", false);
    }
}
