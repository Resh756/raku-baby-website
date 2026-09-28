/* =========================================================
   RESH_DADA HUNTER SYSTEM
   VERSION 2.0
========================================================= */


/* =========================
   DEFAULT SYSTEM DATA
========================= */

const DEFAULT_STATE = {
    level: 1,
    xp: 0,
    gold: 0,

    streak: 0,
    bestStreak: 0,

    totalQuests: 0,

    lastActiveDate: null,

    examDate: "2027-04-27T08:00:00",

    quests: {
        study: {
            completed: false,
            lastCompleted: 0
        },

        gym: {
            completed: false,
            lastCompleted: 0
        },

        walk: {
            completed: false,
            lastCompleted: 0
        },

        revision: {
            completed: false,
            lastCompleted: 0
        }
    }
};


/* =========================
   LOAD DATA
========================= */

let savedData = localStorage.getItem("resh_dada_system");

let gameState;

try {

    gameState = savedData
        ? JSON.parse(savedData)
        : structuredClone(DEFAULT_STATE);

} catch (error) {

    console.error("Save data corrupted. Resetting.");

    gameState = structuredClone(DEFAULT_STATE);
}


/* =========================
   MERGE MISSING DATA
========================= */

gameState = {
    ...structuredClone(DEFAULT_STATE),
    ...gameState,

    quests: {
        ...structuredClone(DEFAULT_STATE.quests),
        ...(gameState.quests || {})
    }
};


/* =========================
   AUDIO SYSTEM
========================= */

let audioCtx = null;

function getAudioContext() {

    if (!audioCtx) {
        audioCtx = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();
    }

    return audioCtx;
}


function playSystemSound(type) {

    try {

        const ctx = getAudioContext();

        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const osc = ctx.createOscillator();

        const gain = ctx.createGain();

        osc.connect(gain);

        gain.connect(ctx.destination);


        if (type === "success") {

            osc.type = "sine";

            osc.frequency.setValueAtTime(
                523,
                ctx.currentTime
            );

            osc.frequency.setValueAtTime(
                659,
                ctx.currentTime + 0.08
            );

            osc.frequency.setValueAtTime(
                784,
                ctx.currentTime + 0.16
            );

            gain.gain.setValueAtTime(
                0.08,
                ctx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.4
            );

            osc.start();

            osc.stop(ctx.currentTime + 0.4);

        }


        else if (type === "levelup") {

            osc.type = "triangle";

            osc.frequency.setValueAtTime(
                392,
                ctx.currentTime
            );

            osc.frequency.setValueAtTime(
                523,
                ctx.currentTime + 0.12
            );

            osc.frequency.setValueAtTime(
                659,
                ctx.currentTime + 0.24
            );

            osc.frequency.setValueAtTime(
                988,
                ctx.currentTime + 0.36
            );

            gain.gain.setValueAtTime(
                0.1,
                ctx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.8
            );

            osc.start();

            osc.stop(ctx.currentTime + 0.8);

        }


        else if (type === "penalty") {

            osc.type = "sawtooth";

            osc.frequency.setValueAtTime(
                160,
                ctx.currentTime
            );

            osc.frequency.linearRampToValueAtTime(
                60,
                ctx.currentTime + 0.5
            );

            gain.gain.setValueAtTime(
                0.08,
                ctx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.5
            );

            osc.start();

            osc.stop(ctx.currentTime + 0.5);
        }

    } catch (error) {

        console.log("Audio unavailable.");

    }
}


/* =========================
   SAVE
========================= */

function saveGame() {

    localStorage.setItem(
        "resh_dada_system",
        JSON.stringify(gameState)
    );
}


/* =========================
   DATE HELPERS
========================= */

function getToday() {

    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;
}


function resetDailyQuestsIfNeeded() {

    const today = getToday();

    if (gameState.lastActiveDate !== today) {

        gameState.quests.study.completed = false;
        gameState.quests.gym.completed = false;
        gameState.quests.walk.completed = false;
        gameState.quests.revision.completed = false;

        gameState.lastActiveDate = today;

        saveGame();
    }
}


/* =========================
   RANK SYSTEM
========================= */

function getRank(level) {

    if (level >= 75) return "S-RANK";

    if (level >= 50) return "A-RANK";

    if (level >= 30) return "B-RANK";

    if (level >= 15) return "C-RANK";

    if (level >= 5) return "D-RANK";

    return "E-RANK";
}


/* =========================
   UPDATE MAIN UI
========================= */

function updateDOM() {

    resetDailyQuestsIfNeeded();


    document.getElementById("playerLevel").innerText =
        gameState.level;


    document.getElementById("playerXP").innerText =
        gameState.xp;


    document.getElementById("playerGold").innerText =
        gameState.gold;


    document.getElementById("playerStreak").innerText =
        `${gameState.streak} DAYS`;


    const rank = getRank(gameState.level);

    document.getElementById("rankBadge").innerText =
        rank;


    /* XP */

    const xpPercentage =
        Math.min(gameState.xp, 100);

    document.getElementById("xpBar").style.width =
        `${xpPercentage}%`;

    document.getElementById("xpPercentage").innerText =
        `${xpPercentage}%`;


    /* Quests */

    const completed =
        Object.values(gameState.quests)
        .filter(q => q.completed).length;


    document.getElementById("questCount").innerText =
        `${completed}/4`;

    document.getElementById("completedQuestNumber").innerText =
        completed;


    updateQuestUI();

    updateProgress();

    updateAchievements();

    updateCooldowns();

    saveGame();
}


/* =========================
   QUEST COMPLETION
========================= */

function completeTask(type) {

    resetDailyQuestsIfNeeded();


    if (!gameState.quests[type]) {
        return;
    }


    if (gameState.quests[type].completed) {

        showNotification(
            "QUEST ALREADY COMPLETE",
            "This quest has already been completed today.",
            "warning"
        );

        return;
    }


    const rewards = {

        study: {
            xp: 25,
            gold: 12,
            message: "Study protocol successfully completed."
        },

        gym: {
            xp: 40,
            gold: 20,
            message: "Training gate successfully cleared."
        },

        walk: {
            xp: 15,
            gold: 7,
            message: "Mobility quest completed."
        },

        revision: {
            xp: 20,
            gold: 10,
            message: "Revision protocol completed."
        }

    };


    const reward = rewards[type];


    if (!reward) {
        return;
    }


    const previousLevel = gameState.level;


    gameState.quests[type].completed = true;

    gameState.quests[type].lastCompleted =
        Date.now();


    gameState.xp += reward.xp;

    gameState.gold += reward.gold;

    gameState.totalQuests++;


    updateStreak();


    /* LEVEL UP */

    while (gameState.xp >= 100) {

        gameState.xp -= 100;

        gameState.level++;
    }


    saveGame();


    playSystemSound(
        gameState.level > previousLevel
            ? "levelup"
            : "success"
    );


    if (gameState.level > previousLevel) {

        showLevelUp();

    } else {

        showNotification(
            "QUEST COMPLETE",
            `${reward.message} +${reward.xp} XP • +${reward.gold}G`,
            "success"
        );
    }


    updateDOM();
}


/* =========================
   STREAK
========================= */

function updateStreak() {

    const today = getToday();

    const lastDate = gameState.lastActiveDate;


    if (!lastDate) {

        gameState.streak = 1;

    }

    else if (lastDate !== today) {

        const previous =
            new Date(lastDate);

        const current =
            new Date(today);


        const difference =
            Math.floor(
                (current - previous) /
                (1000 * 60 * 60 * 24)
            );


        if (difference === 1) {

            gameState.streak++;

        }

        else if (difference > 1) {

            gameState.streak = 1;
        }
    }


    if (gameState.streak >
        gameState.bestStreak) {

        gameState.bestStreak =
            gameState.streak;
    }


    gameState.lastActiveDate =
        today;
}


/* =========================
   QUEST UI
========================= */

function updateQuestUI() {

    const questMap = {

        study: {
            card: "studyQuest",
            button: "studyButton",
            text: "COMPLETE STUDY"
        },

        gym: {
            card: "gymQuest",
            button: "gymButton",
            text: "CLEAR WORKOUT"
        },

        walk: {
            card: "walkQuest",
            button: "walkButton",
            text: "COMPLETE WALK"
        },

        revision: {
            card: "revisionQuest",
            button: "revisionButton",
            text: "COMPLETE REVISION"
        }

    };


    for (const type in questMap) {

        const data = questMap[type];

        const card =
            document.getElementById(data.card);

        const button =
            document.getElementById(data.button);


        if (gameState.quests[type].completed) {

            card.classList.add("completed");

            button.disabled = true;

            button.innerText =
                "✓ QUEST COMPLETE";

        } else {

            card.classList.remove("completed");

            button.disabled = false;

            button.innerText =
                data.text;
        }
    }
}


/* =========================
   PROGRESS
========================= */

function updateProgress() {

    const quests = gameState.quests;


    const study =
        quests.study.completed ? 100 : 0;

    const gym =
        quests.gym.completed ? 100 : 0;

    const walk =
        quests.walk.completed ? 100 : 0;

    const revision =
        quests.revision.completed ? 100 : 0;


    setProgress(
        "studyProgress",
        "studyProgressText",
        study
    );

    setProgress(
        "gymProgress",
        "gymProgressText",
        gym
    );

    setProgress(
        "walkProgress",
        "walkProgressText",
        walk
    );

    setProgress(
        "revisionProgress",
        "revisionProgressText",
        revision
    );
}


function setProgress(barId, textId, value) {

    document.getElementById(barId).style.width =
        `${value}%`;

    document.getElementById(textId).innerText =
        `${value}%`;
}


/* =========================
   ACHIEVEMENTS
========================= */

function updateAchievements() {

    unlockAchievement(
        "achievementFirst",
        gameState.totalQuests >= 1
    );


    unlockAchievement(
        "achievementLevel",
        gameState.level >= 5
    );


    unlockAchievement(
        "achievementStreak",
        gameState.bestStreak >= 7
    );


    unlockAchievement(
        "achievementGold",
        gameState.gold >= 500
    );
}


function unlockAchievement(id, unlocked) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    if (unlocked) {

        element.classList.add("unlocked");

        element.classList.remove("locked");

    } else {

        element.classList.remove("unlocked");

        element.classList.add("locked");
    }
}


/* =========================
   NOTIFICATION SYSTEM
========================= */

let notificationTimeout;


function showNotification(
    title,
    message,
    type = "success"
) {

    const notification =
        document.getElementById("notification");

    const titleElement =
        document.getElementById("notificationTitle");

    const messageElement =
        document.getElementById("notificationMessage");


    titleElement.innerText =
        title;

    messageElement.innerText =
        message;


    if (type === "warning") {

        notification.style.borderColor =
            "#ff9d42";

        titleElement.style.color =
            "#ff9d42";

    }

    else if (type === "error") {

        notification.style.borderColor =
            "#ff245f";

        titleElement.style.color =
            "#ff245f";

    }

    else {

        notification.style.borderColor =
            "#00eaff";

        titleElement.style.color =
            "#00eaff";
    }


    notification.classList.add("show");


    clearTimeout(notificationTimeout);


    notificationTimeout =
        setTimeout(() => {

            notification.classList.remove("show");

        }, 3500);
}


/* =========================
   LEVEL UP
========================= */

function showLevelUp() {

    document.getElementById("newLevel").innerText =
        gameState.level;

    document.getElementById("newRank").innerText =
        getRank(gameState.level);


    document
        .getElementById("levelUpOverlay")
        .classList.add("show");
}


function closeLevelUp() {

    document
        .getElementById("levelUpOverlay")
        .classList.remove("show");


    showNotification(
        "LEVEL UP",
        `You reached Level ${gameState.level}. Keep progressing.`,
        "success"
    );
}


/* =========================
   COUNTDOWN
========================= */

function runTimer() {

    const target =
        new Date(gameState.examDate)
        .getTime();


    const now =
        Date.now();


    const difference =
        target - now;


    if (difference <= 0) {

        document.getElementById("days").innerText =
            "000";

        document.getElementById("hours").innerText =
            "00";

        document.getElementById("minutes").innerText =
            "00";

        document.getElementById("seconds").innerText =
            "00";

        document.getElementById("systemStatus").innerText =
            "EXAM GATE OPEN";

        return;
    }


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (difference %
                (1000 * 60 * 60 * 24)) /
            (1000 * 60 * 60)
        );


    const minutes =
        Math.floor(
            (difference %
                (1000 * 60 * 60)) /
            (1000 * 60)
        );


    const seconds =
        Math.floor(
            (difference %
                (1000 * 60)) /
            1000
        );


    document.getElementById("days").innerText =
        String(days).padStart(3, "0");


    document.getElementById("hours").innerText =
        String(hours).padStart(2, "0");


    document.getElementById("minutes").innerText =
        String(minutes).padStart(2, "0");


    document.getElementById("seconds").innerText =
        String(seconds).padStart(2, "0");
}


/* =========================
   PENALTY
========================= */

function triggerPenalty() {

    const confirmed =
        confirm(
            "⚠ SYSTEM WARNING\n\n" +
            "Simulate a routine failure?\n\n" +
            "This will reset your streak and remove one level if possible."
        );


    if (!confirmed) {
        return;
    }


    playSystemSound("penalty");


    gameState.streak = 0;


    if (gameState.level > 1) {

        gameState.level--;

        gameState.xp = 0;
    }


    saveGame();

    updateDOM();


    showNotification(
        "PENALTY PROTOCOL",
        "Routine failure registered. Streak reset.",
        "error"
    );
}


/* =========================
   RESET SYSTEM
========================= */

function resetData() {

    const confirmed =
        confirm(
            "⚠ RESET HUNTER SYSTEM?\n\n" +
            "All level, XP, gold, streak and quest data will be permanently reset."
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "resh_dada_system"
    );


    location.reload();
}


/* =========================
   INITIALIZATION
========================= */

resetDailyQuestsIfNeeded();

updateDOM();

runTimer();


/* Update countdown every second */

setInterval(
    runTimer,
    1000
);


/* Update cooldown / interface every minute */

setInterval(
    updateDOM,
    60000
);


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .then(() => {

                    console.log(
                        "Hunter System service worker active."
                    );

                })
                .catch(error => {

                    console.log(
                        "Service worker registration failed:",
                        error
                    );

                });
        }
    );
}
