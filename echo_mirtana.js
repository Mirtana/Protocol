const ECHO_CONFIG = Object.freeze({
    "0x4cef52": Object.freeze({
        echo: "0x82134a26AD8eB91273b2AAe92cC4a9468977fAB7",
        nft:  "0x392a38398ab7358947caCC77F244A5ee1D6091f5",
        explorer: "https://testnet.arcscan.app/tx/"
    }),
    "0xb626": Object.freeze({
        echo: "0xd55386926EA4AAe28663d81094A8748CA70fcefd",
        nft:  "0xa37b518e9CC09FFb3280810Ff456999AC84D10cc",
        explorer: "https://explorer.testnet.chain.robinhood.com/tx/"
    }),
    "0x538": Object.freeze({
        echo: "0xc8C671AA28407DaeFb214Bc41a79D3605B20616c",
        nft:  "0xd46882eaF6a6afFBBDA58b82eff7934D2551E402",
        explorer: "https://testnet.explorer.kiichain.io/tx/"
    }),
    "0x3d8": Object.freeze({
        echo: "0xA56026ab3EBBd8937a1572b20118f61851fdf84E",
        nft:  "0xE952ee8BA2B025f8Fa17779fb18aDeA387cAC811",
        explorer: "https://testnet.iopn.tech/tx/"
    })
    
});


const echoABI = [{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_treasuryAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"}],"name":"EchoPublished","type":"event"},{"inputs":[],"name":"COOLDOWN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_postId","type":"uint256"}],"name":"adminDeleteEcho","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastPostTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mirtaToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextPostId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"postPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"posts","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"publishEcho","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newPrice","type":"uint256"}],"name":"setPostPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newTreasury","type":"address"}],"name":"setTreasury","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"treasury","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

let echoTimerInterval = null;
let isPublishing = false;
let initInProgress = false;
let lastInitId = 0;
let walletChangeTimeout;

async function getEchoContract(readOnly = false) {
    if (typeof window.ethereum === 'undefined') {
        throw new Error("Wallet not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    
    let accounts = await provider.send("eth_accounts", []);
    if (!accounts.length && !readOnly) {
        accounts = await provider.send("eth_requestAccounts", []);
    }

    const network = await provider.getNetwork();
    const chainId = "0x" + network.chainId.toString(16);

    const config = ECHO_CONFIG[chainId];

    if (!config) {
        throw new Error("Wrong network. Please switch to a supported network.");
    }

    const currentAddress = config.echo;

    if (readOnly) {
        return new ethers.Contract(currentAddress, echoABI, provider);
    }

    const signer = await provider.getSigner();
    return new ethers.Contract(currentAddress, echoABI, signer);
}

const echoMessage = document.getElementById('echo-message');
const charCount = document.getElementById('char-count');

if (echoMessage && charCount) {
    echoMessage.addEventListener('input', () => {
        const length = echoMessage.value.length;
        charCount.textContent = length;
        charCount.style.color = (length >= 145) ? "#ff4d4d" : "#8a8d91";
    });
}

async function hasMirtanaNFT(userAddress) {
    try {
        if (!userAddress) {
            throw new Error("Invalid address");
        }

        if (typeof window.ethereum === 'undefined') {
            throw new Error("Wallet not installed");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16);

        const config = ECHO_CONFIG[chainId];

        if (!config) {
            throw new Error("Unsupported network");
        }

        const nftAddress = config.nft;

        const nftAbi = ["function balanceOf(address owner) view returns (uint256)"];
        const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);

        const balance = await nftContract.balanceOf(userAddress);

        return balance > 0n;

    } catch (e) {
        console.error("NFT Check Error:", e);
        return false;
    }
}

async function publishToEcho() {
    if (isPublishing) return;

    const input = document.getElementById('echo-message');
    if (!input) return;

    const message = input.value.trim();

    if (!message) {
        alert("Please enter a message!");
        return;
    }

    if (message.length > 145) {
        showStatusError("Message too long (max 145 chars)");
        return;
    }

    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error("Wallet not installed");
        }

        isPublishing = true;

        const txInfo = document.getElementById('txInfo');
        const closeBtn = document.getElementById('statusCloseBtn');

        if (txInfo) txInfo.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        showStatusModal("Verification", "Checking Mirtana NFT ownership...", true);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const isHolder = await hasMirtanaNFT(userAddress);

        if (!isHolder) {
            showStatusError("Access Denied! You must own at least one Mirtana NFT.");
            return;
        }

        const filterResult = isToxic(message);
        if (filterResult.toxic) {
            showStatusError(filterResult.reason);
            return;
        }

        showStatusModal("Preparing Echo", "Connecting to contract...", true);

        const activeEchoContract = await getEchoContract();
        const echoAddress = await activeEchoContract.getAddress();

        const price = await activeEchoContract.postPrice();
        const mirtaContract = new ethers.Contract(MIRTA_TOKEN_ADDRESS, MIRTA_ABI, signer);

        const allowance = await mirtaContract.allowance(userAddress, echoAddress);

        if (allowance < price) {
            showStatusModal("Approval Required", "Please approve MIRTA usage...", true);

            const approveTx = await mirtaContract.approve(echoAddress, ethers.MaxUint256);

            showStatusModal("Approving", "Waiting for approval confirmation...", true);
            await approveTx.wait();
        }

        showStatusModal("Broadcasting", "Sending your message...", true);

        const tx = await activeEchoContract.publishEcho(message);

        showStatusModal("Confirming", "Waiting for block confirmation...", true);
        const receipt = await tx.wait();

        showStatusSuccess(receipt.hash);

        input.value = '';

        const counter = document.getElementById('char-count');
        if (counter) counter.textContent = '0';

        loadEchoFeed();

    } catch (error) {
        console.error(error);

        if (error.code === 4001) {
            showStatusError("Transaction cancelled by user");
        } else {
            showStatusError(error.reason || error.message || "Transaction failed");
        }

        const txInfo = document.getElementById('txInfo');
        if (txInfo) txInfo.style.display = 'none';

    } finally {
        isPublishing = false;
    }
}

function showStatusError(errorMsg) {
    const loader = document.getElementById('statusLoader');
    const title = document.getElementById('statusTitle');
    const message = document.getElementById('statusMessage');
    const closeBtn = document.getElementById('statusCloseBtn');

    if (loader) loader.style.display = 'none';
    if (title) {
        title.textContent = "Error";
        title.style.color = "#ff4d4d";
    }
    if (message) message.textContent = errorMsg;
    if (closeBtn) closeBtn.style.display = 'block';
}

function showStatusSuccess(hash) {
    const loader = document.getElementById('statusLoader');
    const title = document.getElementById('statusTitle');
    const message = document.getElementById('statusMessage');
    const txInfo = document.getElementById('txInfo');
    const explorerLink = document.getElementById('explorerLink');
    const closeBtn = document.getElementById('statusCloseBtn');


    if (loader) loader.style.display = 'none';

    if (title) {
        title.textContent = "Echo Published!";
        title.style.color = "#00f2ff";
    }

    if (message) {
        message.textContent = "Your message is live for 24 hours.";
    }

    if (txInfo) {
        txInfo.style.display = 'block';
    
        const stakedText = txInfo.querySelector('p');
        if (stakedText) stakedText.style.display = 'none';
    }

    if (explorerLink) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            provider.getNetwork().then(network => {
                const chainId = "0x" + network.chainId.toString(16);
                const config = ECHO_CONFIG[chainId];

                if (!config) {
                    explorerLink.href = "#";
                    return;
                }

                explorerLink.href = `${config.explorer}${hash}`;
            });

        } catch (e) {
            console.error("Explorer detect error:", e);
            explorerLink.href = "#";
        }
    }

    if (closeBtn) closeBtn.style.display = 'block';
}

function showStatusModal(title, msg, showLoader) {
    const modal = document.getElementById('statusModal');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    const statusLoader = document.getElementById('statusLoader');

    if (!modal) return;

    modal.style.display = 'flex';

    if (statusTitle) statusTitle.textContent = title;
    if (statusMessage) statusMessage.textContent = msg;
    if (statusLoader) {
        statusLoader.style.display = showLoader ? 'block' : 'none';
    }
}

async function loadEchoFeed() {
    const grid = document.getElementById('echo-feed-grid');
    if (!grid) return;

    if (!window.ethereum) {
        console.warn("No wallet detected");
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = "0x" + network.chainId.toString(16);

        const config = ECHO_CONFIG[chainId];
        if (!config) throw new Error("Unsupported network");

        const readOnlyContract = new ethers.Contract(config.echo, echoABI, provider);

        const nextId = await readOnlyContract.nextPostId();
        const startId = nextId > 20n ? nextId - 20n : 0n;

        const nftContract = new ethers.Contract(
            config.nft,
            ["function balanceOf(address owner) view returns (uint256)"],
            provider
        );

        let cardsHtml = '';
        let activeCount = 0;

        const now = Math.floor(Date.now() / 1000);
        const dayInSec = 86400;

        if (echoTimerInterval) clearInterval(echoTimerInterval);

        const postPromises = [];
        for (let i = nextId - 1n; i >= startId; i--) {
            postPromises.push(
                readOnlyContract.posts(i).catch(() => null)
            );
        }

        const posts = await Promise.all(postPromises);

        const balanceCache = {};

        for (let idx = 0; idx < posts.length; idx++) {
            const post = posts[idx];
            if (!post) continue;

            const i = Number(nextId - 1n - BigInt(idx));

            const postTimestamp = Number(post.timestamp);
            const timePassed = now - postTimestamp;

            if (post.isActive && timePassed < dayInSec) {
                activeCount++;

                const author = post.author;

                if (!(author in balanceCache)) {
                    try {
                        const bal = await nftContract.balanceOf(author);
                        balanceCache[author] = Number(bal);
                    } catch {
                        balanceCache[author] = 0;
                    }
                }

                const userBalance = balanceCache[author];
                const rank = getRankData(userBalance);

                const timeLeft = dayInSec - timePassed;
                const progress = (timeLeft / dayInSec) * 100;

                const safeContent = String(post.content || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

                cardsHtml += `
<div class="plan-card echo-post ${rank.class}" id="post-${i}">
    <div class="echo-header">
        <div class="author-info">
            <span class="rank-icon">${rank.icon}</span>
            <span class="echo-author">
                ${author.slice(0,6)}...${author.slice(-4)}
            </span>
            <span class="nft-badge">
                ${userBalance} NFT
            </span>
        </div>
        <span class="echo-timer" id="timer-${i}" data-expiry="${postTimestamp + dayInSec}">
            Calculating...
        </span>
    </div>
    <p class="echo-text">${safeContent}</p>
    <div class="echo-footer">
        <div class="echo-progress-bar">
            <div class="progress-fill" id="progress-${i}" style="width: ${progress}%"></div>
        </div>
    </div>
</div>`;
            }
        }

        const counterElement = document.getElementById('active-echo-count');
        if (counterElement) {
            counterElement.textContent = ` ${activeCount} Active posts `;
        }

        grid.innerHTML = cardsHtml || '<p style="color: #666; text-align: center;">No active echoes.</p>';

        startEchoTimers();

    } catch (e) {
        console.error("Load Feed Error:", e);
    }
}
function getRankData(balance) {
    let safeBalance;

    try {
        safeBalance = Number(balance);
        if (!isFinite(safeBalance)) safeBalance = 0;
    } catch {
        safeBalance = 0;
    }

    if (safeBalance >= 12) {
        return { icon: '👑', title: 'Legend of Myrtana', class: 'Legend-of-Myrtana' };
    }

    if (safeBalance >= 6) {
        return { icon: '💎', title: 'Epic Hero', class: 'Epic-hero' };
    }

    if (safeBalance >= 1) {
        return { icon: '🛡️', title: 'Loyal Custodian', class: 'Loyal-Custodian' };
    }

    return { icon: '👤', title: 'Member', class: '' };
}

function startEchoTimers() {
    if (echoTimerInterval) {
        clearInterval(echoTimerInterval);
    }

    const timers = Array.from(document.querySelectorAll('.echo-timer')).map(timer => {
        const expiry = parseInt(timer.getAttribute('data-expiry'));
        if (isNaN(expiry)) return null;

        const timerId = timer.id || "";
        const postId = timerId.replace('timer-', '');
        const progressBar = document.getElementById(`progress-${postId}`);

        return {
            el: timer,
            expiry,
            progressBar,
            lastText: null
        };
    }).filter(Boolean);

    echoTimerInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);

        timers.forEach(item => {
            const remaining = item.expiry - now;

            if (remaining <= 0) {
                if (item.lastText !== "Expired") {
                    item.el.textContent = "Expired";
                    item.el.style.color = "#ff4d4d";
                    item.lastText = "Expired";
                }

                if (item.progressBar) {
                    item.progressBar.style.width = '0%';
                }

                return;
            }

            const h = Math.floor(remaining / 3600);
            const m = Math.floor((remaining % 3600) / 60);
            const s = remaining % 60;

            const newText = `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s left`;

            if (item.lastText !== newText) {
                item.el.textContent = newText;
                item.lastText = newText;
            }

            if (item.progressBar) {
                const newProgress = Math.max(0, (remaining / 86400) * 100);
                item.progressBar.style.width = newProgress + '%';
            }
        });

    }, 1000);
}

async function updatePublishPrice() {
    const priceDisplay = document.getElementById('current-echo-price');
    if (!priceDisplay) return;

    try {
        const readOnlyContract = await getEchoContract(true);
        const priceRaw = await readOnlyContract.postPrice();

        let priceFormatted = ethers.formatUnits(priceRaw, 18);
        priceFormatted = Number(priceFormatted).toFixed(4);

        priceDisplay.textContent = priceFormatted;
    } catch (e) {
        console.error("Ошибка при получении цены:", e);
        priceDisplay.textContent = "Error";
    }
}

async function initEcho() {
    if (initInProgress) return;

    const currentInitId = ++lastInitId;
    initInProgress = true;

    try {
        await updatePublishPrice();

        if (currentInitId !== lastInitId) return;

        await loadEchoFeed();

    } catch (e) {
        console.error("Init error:", e);
    } finally {
        initInProgress = false;
    }
}

window.addEventListener('load', initEcho);

if (window.ethereum) {
    const handleChange = () => {
        clearTimeout(walletChangeTimeout);
        walletChangeTimeout = setTimeout(initEcho, 300);
    };

    window.ethereum.on('chainChanged', handleChange);
    window.ethereum.on('accountsChanged', handleChange);
}
