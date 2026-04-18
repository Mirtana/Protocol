(function() {
    // 1. Динамические константы для разных сетей
    const LIKES_CONFIG = {
        '0x4cef52': { // Arc Testnet
            likesAddress: "0xDBc2c5dE4ddE2277C464539722ae5eabB475d754",
            mirtaAddress: "0xad4d6Ed80F18768a1DdE5f2b6a97a900A5C874e1",
            explorer: "https://testnet.arcscan.app/tx/"
        },
        '0xb626': { // Robinhood Testnet
            likesAddress: "0xcd01d2f8c7910a62a39803834Be53694eaa884AF",
            mirtaAddress: "0x9c256267EA5Fc6f77469bd0cB18498C335349Ab6",
            explorer: "https://explorer.testnet.chain.robinhood.com/tx/"
        }
    };

    const ERC20_ABI_LIKE = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
    ];

    const LIKES_ABI_LIKE = [{"inputs":[{"internalType":"address","name":"_mirtaToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"nftId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"Liked","type":"event"},{"inputs":[],"name":"LIKE_PRICE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_nftId","type":"uint256"}],"name":"getLikes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"hasLiked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_nftId","type":"uint256"}],"name":"likeNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"mirtaToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalLikes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

    const NFT_NAMES_MAP = {
        1: "Mirtana January", 2: "Mirtana February", 3: "Mirtana March",
        4: "Mirtana April", 5: "Mirtana May", 6: "Mirtana June",
        7: "Mirtana July", 8: "Mirtana August", 9: "Mirtana September",
        10: "Mirtana October", 11: "Mirtana November", 12: "Mirtana December"
    };

    // 2. Основная функция лайка
    window.handleLikeRequest = async function(nftId) {
        if (typeof window.ethereum === 'undefined') {
            alert("Please install MetaMask!");
            return;
        }

        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const config = LIKES_CONFIG[chainId.toLowerCase()];

            if (!config) {
                if (window.openModal) window.openModal('error', 'Please switch to Arc or Robinhood network!');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();
            
            const mirtaContract = new ethers.Contract(config.mirtaAddress, ERC20_ABI_LIKE, signer);
            const likesContract = new ethers.Contract(config.likesAddress, LIKES_ABI_LIKE, signer);

            const likePrice = ethers.parseUnits("1.0", 18);

            // ШАГ 1: Проверка Allowance
            if (window.openModal) window.openModal('loading', 'Checking token allowance...');

            const allowance = await mirtaContract.allowance(userAddress, config.likesAddress);
            
            if (allowance < likePrice) {
                if (window.openModal) window.openModal('loading', 'Step 1/2: Approve 1 MIRTA for this Like...');
                const approveTx = await mirtaContract.approve(config.likesAddress, likePrice);
                await approveTx.wait();
            }

            // ШАГ 2: Лайк
            if (window.openModal) window.openModal('loading', 'Step 2/2: Signing your Like on-chain...');
            const likeTx = await likesContract.likeNFT(nftId);
            
            if (window.openModal) window.openModal('loading', 'Recording your Like forever...', likeTx.hash);
            await likeTx.wait();

            // УСПЕХ
            const nftName = NFT_NAMES_MAP[nftId] || `NFT #${nftId}`;
            if (window.openModal) {
                window.openModal('success', `
                    <div style="text-align:center;">
                        <div style="font-size: 30px; margin-bottom: 10px;">❤️</div>
                        <p>Your like for <strong>${nftName}</strong> has been immortalized on the blockchain!</p>
                        <p style="color: #ffcc00; font-size: 0.9em; margin-top: 10px;">1 Like = 1 MIRTA</p>
                    </div>
                `, likeTx.hash);
            }

            // Обновляем сердце в UI
            const heart = document.getElementById(`heart-${nftId}`);
            if (heart) heart.classList.add('active');
            
            syncLikesWithBlockchain();

        } catch (error) {
            console.error("Like Error:", error);
            if (error.code === "ACTION_REJECTED" || error.code === 4001) {
                if (window.closeStatusModal) window.closeStatusModal();
            } else {
                let errorMsg = error.reason || "Transaction failed.";
                if (error.message && error.message.includes("already liked")) {
                    errorMsg = "Your like for this NFT is already immortalized on the blockchain!";
                }
                if (window.openModal) window.openModal('error', errorMsg);
            }
        }
    };

    // 3. Синхронизация данных (Оптимизировано)
    async function syncLikesWithBlockchain() {
        if (!window.ethereum || typeof ethers === 'undefined') return;
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const config = LIKES_CONFIG[chainId.toLowerCase()];
            if (!config) return;

            const provider = new ethers.BrowserProvider(window.ethereum);
            let userAddress = null;
            try {
                const signer = await provider.getSigner();
                userAddress = await signer.getAddress();
            } catch (e) {}

            const likesContract = new ethers.Contract(config.likesAddress, LIKES_ABI_LIKE, provider);

            for (let id = 1; id <= 12; id++) {
                try {
                    const count = await likesContract.getLikes(id);
                    const label = document.getElementById(`count-${id}`);
                    if (label) label.innerText = count.toString();

                    if (userAddress) {
                        const likedByUser = await likesContract.hasLiked(id, userAddress);
                        const heart = document.getElementById(`heart-${id}`);
                        if (heart) {
                            likedByUser ? heart.classList.add('active') : heart.classList.remove('active');
                        }
                    }
                } catch (err) {}
            }
        } catch (e) {}
    }

    // Удалены лишние window.openStatusModal, window.updateStatusModal и т.д.

    window.addEventListener('load', syncLikesWithBlockchain);
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', syncLikesWithBlockchain);
        window.ethereum.on('chainChanged', () => window.location.reload());
    }
})();