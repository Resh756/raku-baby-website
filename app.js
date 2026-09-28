// Local Database Engine - Set to exactly 211 Days from today in Nepal Time (April 27, 2027)
let gameState = JSON.parse(localStorage.getItem('resh_dada_system')) || {
    level: 1,
    xp: 0,
    gold: 0,
    streak: 0,
    examDate: "2027-04-27T00:00:00+05:45", // Hardcoded Nepal Time Zone (UTC+5:45)
    lastStudyTime: 0,
    lastGymTime: 0
};

// Synth Audio Engine for Anime SFX
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSystemSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); 
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
    
    let rank = "E-RANK";
    if (gameState.level >= 5) rank = "D-RANK";
    if (gameState.level >= 15) rank = "C-RANK";
    if (gameState.level >= 30) rank = "B-RANK";
    if (gameState.level >= 50) rank = "A-RANK";
    if (gameState.level >= 75) rank = "S-RANK";
    
    document.getElementById('rankBadge').innerText = rank;
    localStorage.setItem('resh_dada_system', JSON.stringify(gameState));
    checkCooldowns();
}

// Anti-Abuse Tracking Engine
window.completeTask = function(type, rewardXP) {
    const now = Date.now();
    
    if (type === 'study') {
        const studyCooldown = 60 * 60 * 1000; // Strict 1 Hour Cooldown
        if (now - gameState.lastStudyTime < studyCooldown) {
            alert("⚠️ SYSTEM ERROR: System cooldown in effect. Your mental focus energy is depleted.");
            return;
        }
        gameState.lastStudyTime = now;
    } else if (type === 'gym') {
        const gymCooldown = 16 * 60 * 60 * 1000; // 16 Hours Cooldown to stop spamming workouts
        if (now - gameState.lastGymTime < gymCooldown) {
            alert("⚠️ SYSTEM ERROR: Muscles are torn down. Rest protocol active.");
            return;
        }
        gameState.lastGymTime = now;
    }

    playSystemSound('success');
    gameState.xp += rewardXP;
    gameState.gold += Math.floor(rewardXP * 0.5);

    if (gameState.xp >= 100) {
        gameState.level += 1;
        gameState.xp -= 100;
    }
    updateDOM();
};

// Cooldown UI Management
function checkCooldowns() {
    const now = Date.now();
    const studyBtn = document.querySelector('.neon-blue');
    const gymBtn = document.querySelector('.neon-green');

    // Study Button validation
    const studyTimeLeft = (60 * 60 * 1000) - (now - gameState.lastStudyTime);
    if (studyTimeLeft > 0) {
        studyBtn.disabled = true;
        const minLeft = Math.ceil(studyTimeLeft / (60 * 1000));
        studyBtn.innerText = `🔒 Cooldown: ${minLeft}m left`;
    } else {
        studyBtn.disabled = false;
        studyBtn.innerText = "Complete 1 Hour Session";
    }

    // Gym Button validation
    const gymTimeLeft = (16 * 60 * 60 * 1000) - (now - gameState.lastGymTime);
    if (gymTimeLeft > 0) {
        gymBtn.disabled = true;
        const hoursLeft = Math.ceil(gymTimeLeft / (60 * 60 * 1000));
        gymBtn.innerText = `🔒 Recovering: ${hoursLeft}h left`;
    } else {
        gymBtn.disabled = false;
        gymBtn.innerText = "Clear Workout Session";
    }
}

window.triggerPenalty = function() {
    playSystemSound('penalty');
    alert("ALERT: Daily routine neglected. Initiating System Penalty protocol.");
    gameState.streak = 0;
    if (gameState.level > 1) gameState.level -= 1;
    updateDOM();
};

window.resetData = function() {
    if(confirm("Are you sure you want to wipe all hunter data?")) {
        localStorage.removeItem('resh_dada_system');
        location.reload();
    }
}

// Live Countdown synced directly via Nepal Time Zone 
function runTimer() {
    const target = new Date(gameState.examDate).getTime();
    const now = Date.now();
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
    
    checkCooldowns();
}

// Initial Run Core
updateDOM();
setInterval(runTimer, 30000); // Ticks system every 30 seconds to refresh countdown & cooldown states
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
