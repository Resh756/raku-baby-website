// Local Database Engine 
let gameState = JSON.parse(localStorage.getItem('resh_dada_system')) || {
    level: 1,
    xp: 0,
    gold: 0,
    streak: 0,
    examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // Default: 60 Days out
};

// Synth Audio Engine for Anime SFX
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSystemSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start(); osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'penalty') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    }
}

function updateDOM() {
    document.getElementById('playerLevel').innerText = gameState.level;
    document.getElementById('playerXP').innerText = gameState.xp;
    document.getElementById('playerGold').innerText = gameState.gold;
    
    // Rank evaluation
    let rank = "E-RANK";
    if (gameState.level >= 5) rank = "D-RANK";
    if (gameState.level >= 15) rank = "C-RANK";
    if (gameState.level >= 30) rank = "B-RANK";
    if (gameState.level >= 50) rank = "A-RANK";
    if (gameState.level >= 75) rank = "S-RANK";
    
    const badge = document.getElementById('rankBadge');
    badge.innerText = rank;
    localStorage.setItem('resh_dada_system', JSON.stringify(gameState));
}

window.completeTask = function(type, rewardXP) {
    playSystemSound('success');
    gameState.xp += rewardXP;
    gameState.gold += Math.floor(rewardXP * 0.5);

    if (gameState.xp >= 100) {
        gameState.level += 1;
        gameState.xp -= 100;
    }
    updateDOM();
};

window.triggerPenalty = function() {
    playSystemSound('penalty');
    alert("ALERT: Daily routine neglected. Initiating System Penalty protocol.");
    gameState.streak = 0;
    if (gameState.level > 1) {
        gameState.level -= 1;
    }
    updateDOM();
};

window.resetData = function() {
    if(confirm("Are you sure you want to wipe all hunter data?")) {
        localStorage.removeItem('resh_dada_system');
        location.reload();
    }
}

// Live Countdown calculations
function runTimer() {
    const target = new Date(gameState.examDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
        document.getElementById('countdownDisplay').innerText = "00d : 00h : 00m - GATE OPEN";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('countdownDisplay').innerText = 
        `${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m`;
}

// Initial Run
updateDOM();
setInterval(runTimer, 60000);
runTimer();
// Register PWA Engine so the app becomes installable
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
            const CACHE_NAME = 'resh-dada-v1';
            self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['./', './index.html', './styles.css', './app.js', './icon.svg', './manifest.json']))));
            self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(res => res || fetch(e.request))));
        `;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).catch(err => console.log("System offline module error:", err));
    });
}
