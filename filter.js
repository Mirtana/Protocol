// filter.js

const BANNED_WORDS = [
    // Оскорбления и ненормативная лексика
    "fuck", "shit", "bitch", "nigger", "faggot", "asshole", "dick", "pussy", 
    "cunt", "bastard", "slut", "whore", "dumb", "idiot", "retard",
    
    // Мошенничество и Web3 скам
    "scam", "fake", "rugpull", "honeypot", "exploit", "hack", "drainer", 
    "airdrop", "presale", "whitelist", "investment", "guaranteed", "profit",
    
    // Подозрительные призывы (Spam)
    "free", "click", "buy", "sell", "telegram", "discord", "whatsapp", "join"
];

/**
 * Проверяет сообщение на токсичность и наличие ссылок.
 */
function isToxic(text) {
    const lowText = text.toLowerCase();

    // 1. ПРОВЕРКА НА ССЫЛКИ (URL)
    // Этот паттерн ловит http, https, а также просто домены типа mirtana.com или google.xyz
    const urlPattern = /([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d{1,5})?(\/.*)?/gi;
    if (urlPattern.test(lowText)) {
        return { toxic: true, reason: "Links are not allowed in Echo messages." };
    }

    // 2. ПРОВЕРКА НА ЗАПРЕЩЕННЫЕ СЛОВА
    const hasBannedWord = BANNED_WORDS.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowText);
    });

    if (hasBannedWord) {
        return { toxic: true, reason: "Your message contains forbidden words." };
    }

    return { toxic: false };
}