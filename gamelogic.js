// gameLogic.js
import { saveJoke } from "./firestore.js";
import { updatePointsDisplay, displayMessage } from "./ui.js";

let points = 0;
let currentJokeTheme = '';
let timer;
let totalTime;

export function startGame() {
    startButton.style.display = "none";
    currentJokeTheme = getRandomTheme();
    totalTime = getTotalTime();
    startTimer();
    jokeInput.value = "";
    jokeInput.style.display = "block";
    submitJokeButton.style.display = "block";
}

export function startTimer() {
    timerBar.style.width = "100%";
    timer = setInterval(() => {
        totalTime--;
        const percentage = (totalTime / getTotalTime()) * 100;
        timerBar.style.width = `${percentage}%`;
        if (totalTime <= 0) {
            clearInterval(timer);
            resetGame();
        }
    }, 1000);
}

export function getRandomTheme() {
    const randomIndex = Math.floor(Math.random() * themes.length);
    return themes[randomIndex];
}

export function getTotalTime() {
    const difficulty = difficultySelect.value;
    switch (difficulty) {
        case "easy": return 90;
        case "medium": return 60;
        case "hard": return 30;
        default: return 60;
    }
}

function resetGame() {
    points += 1;
    updatePointsDisplay();
    displayMessage("¡Tiempo agotado!");
}
