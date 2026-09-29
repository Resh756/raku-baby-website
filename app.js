/* =========================================================
   RESH_DADA HUNTER SYSTEM
   VERSION 2.3
========================================================= */


/* =========================
   COUNTDOWN CONFIGURATION
========================= */

const COUNTDOWN_DATE =
    "2027-04-27T08:00:00+05:45";


/* =========================
   USER ACCOUNT
========================= */

/*
   TEMPORARY USERNAME SUPPORT

   This is NOT the final registration system.

   Later, Java + MySQL will provide the real
   authenticated username and player data.
*/

const DEFAULT_USERNAME =
    "RESH_DADA";


function getCurrentUsername() {

    const username =
        localStorage.getItem(
            "hunter_username"
        );

    if (
        !username ||
        username.trim() === ""
    ) {

        return DEFAULT_USERNAME;

    }

    return username.trim();
}


function updateUsernameUI() {

    const username =
        getCurrentUsername();


    const playerUsername =
        document.getElementById(
            "playerUsername"
        );


    const accountUsername =
        document.getElementById(
            "accountUsername"
        );


    if (playerUsername) {

        playerUsername.innerText =
            username;

    }


    if (accountUsername) {

        accountUsername.innerText =
            username;

    }

}


/*
   Temporary logout function.

   Once the Java backend is connected,
   this will become a real server logout.
*/

function logoutUser() {

    const confirmed =
        confirm(
            "LOG OUT OF HUNTER SYSTEM?\n\n" +
            "Your account progress will remain saved."
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        "hunter_username"
    );


    /*
       For now return to the default
       development account.
    */

    updateUsernameUI();


    showNotification(
        "SESSION ENDED",
        "Hunter session has been logged out.",
        "warning"
    );

}


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

    examDate:
        COUNTDOWN_DATE,

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

let savedData =
    localStorage.getItem(
        "resh_dada_system"
    );


let gameState;


try {

    gameState = savedData
        ? JSON.parse(savedData)
        : structuredClone(
            DEFAULT_STATE
        );

} catch (error) {

    console.error(
        "Save data corrupted. Resetting.",
        error
    );

    gameState =
        structuredClone(
            DEFAULT_STATE
        );

}


/* =========================
   MERGE DATA
========================= */

gameState = {

    ...structuredClone(
        DEFAULT_STATE
    ),

    ...gameState,

    quests: {

        ...structuredClone(
            DEFAULT_STATE.quests
        ),

        ...(gameState.quests || {})

    }

};


/*
   Always use configured countdown.
*/

gameState.examDate =
    COUNTDOWN_DATE;


/* =========================
   AUDIO SYSTEM
========================= */

let audioCtx = null;


function getAudioContext() {

    if (!audioCtx) {

        audioCtx =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    return audioCtx;

}


function playSystemSound(type) {

    try {

        const ctx =
            getAudioContext();


        if (
            ctx.state ===
            "suspended"
        ) {

            ctx.resume();

        }


        const osc =
            ctx.createOscillator();


        const gain =
            ctx.createGain();


        osc.connect(gain);

        gain.connect(
            ctx.destination
        );


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


            osc.stop(
                ctx.currentTime + 0.4
            );

        }


        else if (type === "levelup") {

            osc.type =
                "triangle";


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


            osc.stop(
                ctx.currentTime + 0.8
            );

        }


        else if (type === "penalty") {

            osc.type =
                "sawtooth";


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


            osc.stop(
                ctx.currentTime + 0.5
            );

        }

    } catch (error) {

        console.log(
            "Audio unavailable."
        );

    }

}


/* =========================
   SAVE
========================= */

function saveGame() {

    try {

        localStorage.setItem(
            "resh_dada_system",
            JSON.stringify(
                gameState
            )
        );

    } catch (error) {

        console.error(
            "Could not save game data.",
            error
        );

    }

}


/* =========================
   DATE HELPERS
========================= */

function getToday() {

    const now =
        new Date();


    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;

}


function resetDailyQuestsIfNeeded() {

    const today =
        getToday();


    if (
        gameState.lastActiveDate !==
        today
    ) {

        gameState.quests.study.completed =
            false;

        gameState.quests.gym.completed =
            false;

        gameState.quests.walk.completed =
            false;

        gameState.quests.revision.completed =
            false;


        gameState.lastActiveDate =
            today;


        saveGame();

    }

}


/* =========================
   RANK SYSTEM
========================= */

function getRank(level) {

    if (level >= 75)
        return "S-RANK";

    if (level >= 50)
        return "A-RANK";

    if (level >= 30)
        return "B-RANK";

    if (level >= 15)
        return "C-RANK";

    if (level >= 5)
        return "D-RANK";

    return "E-RANK";

}


/* =========================
   SAFE ELEMENT HELPER
========================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            value;

    }

}


/* =========================
   UPDATE MAIN UI
========================= */

function updateDOM() {

    resetDailyQuestsIfNeeded();


    updateUsernameUI();


    setText(
        "playerLevel",
        gameState.level
    );


    setText(
        "playerXP",
        gameState.xp
    );


    setText(
        "playerGold",
        gameState.gold
    );


    setText(
        "playerStreak",
        `${gameState.streak} DAYS`
    );


    setText(
        "rankBadge",
        getRank(
            gameState.level
        )
    );


    /* XP */

    const xpBar =
        document.getElementById(
            "xpBar"
        );


    if (xpBar) {

        const xpPercentage =
            Math.min(
                gameState.xp,
                100
            );


        xpBar.style.width =
            `${xpPercentage}%`;


        setText(
            "xpPercentage",
            `${xpPercentage}%`
        );

    }


    /* Quest count */

    const completed =
        Object.values(
            gameState.quests
        )
        .filter(
            q => q.completed
        )
        .length;


    setText(
        "questCount",
        `${completed}/4`
    );


    setText(
        "completedQuestNumber",
        completed
    );


    updateQuestUI();

    updateProgress();

    updateAchievements();


    saveGame();

}


/* =========================
   QUEST COMPLETION
========================= */

function completeTask(type) {

    resetDailyQuestsIfNeeded();


    if (!gameState.quests[type]) {

        console.error(
            "Unknown quest type:",
            type
        );

        return;

    }


    if (
        gameState.quests[type]
            .completed
    ) {

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

            message:
                "Study protocol successfully completed."

        },


        gym: {

            xp: 40,

            gold: 20,

            message:
                "Training gate successfully cleared."

        },


        walk: {

            xp: 15,

            gold: 7,

            message:
                "Mobility quest completed."

        },


        revision: {

            xp: 20,

            gold: 10,

            message:
                "Revision protocol completed."

        }

    };


    const reward =
        rewards[type];


    if (!reward) {

        return;

    }


    const previousLevel =
        gameState.level;


    gameState.quests[type]
        .completed = true;


    gameState.quests[type]
        .lastCompleted =
        Date.now();


    gameState.xp +=
        reward.xp;


    gameState.gold +=
        reward.gold;


    gameState.totalQuests++;


    updateStreak();


    /* LEVEL UP */

    while (
        gameState.xp >= 100
    ) {

        gameState.xp -= 100;

        gameState.level++;

    }


    saveGame();


    playSystemSound(
        gameState.level >
        previousLevel
            ? "levelup"
            : "success"
    );


    if (
        gameState.level >
        previousLevel
    ) {

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

    const today =
        getToday();


    const lastDate =
        gameState.lastActiveDate;


    if (!lastDate) {

        gameState.streak =
            1;

    }

    else if (
        lastDate !== today
    ) {

        const previous =
            new Date(
                lastDate
            );


        const current =
            new Date(
                today
            );


        const difference =
            Math.floor(
                (
                    current -
                    previous
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        if (
            difference === 1
        ) {

            gameState.streak++;

        }

        else if (
            difference > 1
        ) {

            gameState.streak =
                1;

        }

    }


    if (
        gameState.streak >
        gameState.bestStreak
    ) {

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

            card:
                "studyQuest",

            button:
                "studyButton",

            text:
                "COMPLETE STUDY"

        },


        gym: {

            card:
                "gymQuest",

            button:
                "gymButton",

            text:
                "CLEAR WORKOUT"

        },


        walk: {

            card:
                "walkQuest",

            button:
                "walkButton",

            text:
                "COMPLETE WALK"

        },


        revision: {

            card:
                "revisionQuest",

            button:
                "revisionButton",

            text:
                "COMPLETE REVISION"

        }

    };


    for (
        const type in questMap
    ) {

        const data =
            questMap[type];


        const card =
            document.getElementById(
                data.card
            );


        const button =
            document.getElementById(
                data.button
            );


        if (
            !card ||
            !button
        ) {

            continue;

        }


        if (
            gameState.quests[type]
                .completed
        ) {

            card.classList.add(
                "completed"
            );


            button.disabled =
                true;


            button.innerText =
                "✓ QUEST COMPLETE";

        }

        else {

            card.classList.remove(
                "completed"
            );


            button.disabled =
                false;


            button.innerText =
                data.text;

        }

    }

}


/* =========================
   PROGRESS
========================= */

function updateProgress() {

    const quests =
        gameState.quests;


    setProgress(
        "studyProgress",
        "studyProgressText",
        quests.study.completed
            ? 100
            : 0
    );


    setProgress(
        "gymProgress",
        "gymProgressText",
        quests.gym.completed
            ? 100
            : 0
    );


    setProgress(
        "walkProgress",
        "walkProgressText",
        quests.walk.completed
            ? 100
            : 0
    );


    setProgress(
        "revisionProgress",
        "revisionProgressText",
        quests.revision.completed
            ? 100
            : 0
    );

}


function setProgress(
    barId,
    textId,
    value
) {

    const bar =
        document.getElementById(
            barId
        );


    const text =
        document.getElementById(
            textId
        );


    if (bar) {

        bar.style.width =
            `${value}%`;

    }


    if (text) {

        text.innerText =
            `${value}%`;

    }

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


function unlockAchievement(
    id,
    unlocked
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    if (unlocked) {

        element.classList.add(
            "unlocked"
        );


        element.classList.remove(
            "locked"
        );

    }

    else {

        element.classList.remove(
            "unlocked"
        );


        element.classList.add(
            "locked"
        );

    }

}


/* =========================
   NOTIFICATIONS
========================= */

let notificationTimeout;


function showNotification(
    title,
    message,
    type = "success"
) {

    const notification =
        document.getElementById(
            "notification"
        );


    const titleElement =
        document.getElementById(
            "notificationTitle"
        );


    const messageElement =
        document.getElementById(
            "notificationMessage"
        );


    if (
        !notification ||
        !titleElement ||
        !messageElement
    ) {

        return;

    }


    titleElement.innerText =
        title;


    messageElement.innerText =
        message;


    if (
        type === "warning"
    ) {

        notification.style.borderColor =
            "#ff9d42";


        titleElement.style.color =
            "#ff9d42";

    }

    else if (
        type === "error"
    ) {

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


    notification.classList.add(
        "show"
    );


    clearTimeout(
        notificationTimeout
    );


    notificationTimeout =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================
   LEVEL UP
========================= */

function showLevelUp() {

    const newLevel =
        document.getElementById(
            "newLevel"
        );


    const newRank =
        document.getElementById(
            "newRank"
        );


    const overlay =
        document.getElementById(
            "levelUpOverlay"
        );


    if (!overlay) {

        return;

    }


    if (newLevel) {

        newLevel.innerText =
            gameState.level;

    }


    if (newRank) {

        newRank.innerText =
            getRank(
                gameState.level
            );

    }


    overlay.classList.add(
        "show"
    );

}


function closeLevelUp() {

    const overlay =
        document.getElementById(
            "levelUpOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }


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

    const daysElement =
        document.getElementById(
            "days"
        );


    const hoursElement =
        document.getElementById(
            "hours"
        );


    const minutesElement =
        document.getElementById(
            "minutes"
        );


    const secondsElement =
        document.getElementById(
            "seconds"
        );


    const statusElement =
        document.getElementById(
            "systemStatus"
        );


    if (
        !daysElement ||
        !hoursElement ||
        !minutesElement ||
        !secondsElement
    ) {

        console.error(
            "COUNTDOWN ERROR: Missing countdown HTML elements."
        );

        return;

    }


    const target =
        new Date(
            COUNTDOWN_DATE
        ).getTime();


    if (
        Number.isNaN(target)
    ) {

        console.error(
            "COUNTDOWN ERROR: Invalid date:",
            COUNTDOWN_DATE
        );

        return;

    }


    const difference =
        target -
        Date.now();


    if (
        difference <= 0
    ) {

        daysElement.innerText =
            "000";


        hoursElement.innerText =
            "00";


        minutesElement.innerText =
            "00";


        secondsElement.innerText =
            "00";


        if (statusElement) {

            statusElement.innerText =
                "EXAM GATE OPEN";

        }


        return;

    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const days =
        Math.floor(
            totalSeconds / 86400
        );


    const hours =
        Math.floor(
            (
                totalSeconds %
                86400
            ) / 3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            ) / 60
        );


    const seconds =
        totalSeconds %
        60;


    daysElement.innerText =
        String(days)
            .padStart(3, "0");


    hoursElement.innerText =
        String(hours)
            .padStart(2, "0");


    minutesElement.innerText =
        String(minutes)
            .padStart(2, "0");


    secondsElement.innerText =
        String(seconds)
            .padStart(2, "0");


    if (statusElement) {

        statusElement.innerText =
            "COUNTDOWN ACTIVE";

    }

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


    playSystemSound(
        "penalty"
    );


    gameState.streak =
        0;


    if (
        gameState.level > 1
    ) {

        gameState.level--;

        gameState.xp =
            0;

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

updateUsernameUI();


runTimer();


try {

    resetDailyQuestsIfNeeded();

    updateDOM();

} catch (error) {

    console.error(
        "HUNTER SYSTEM UI ERROR:",
        error
    );

}


setInterval(
    runTimer,
    1000
);


setInterval(
    () => {

        try {

            updateDOM();

        } catch (error) {

            console.error(
                "HUNTER SYSTEM UPDATE ERROR:",
                error
            );

        }

    },
    60000
);


/* =========================
   SERVICE WORKER
========================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./sw.js"
                )
                .then(
                    registration => {

                        console.log(
                            "Hunter System service worker active.",
                            registration
                        );


                        if (
                            registration.update
                        ) {

                            registration.update();

                        }

                    }
                )
                .catch(
                    error => {

                        console.log(
                            "Service worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}
