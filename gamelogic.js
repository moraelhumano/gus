// gameLogic.js
import { saveJoke, getJokes } from './firestore.js';
import { loginWithGoogle, logout, onAuthStateChanged } from './auth.js';

let currentUser = null;
let points = 0;
let timer;
let totalTime;
let isGameOver = false;

export function startTimer(timerBar, totalTimeFunc) {
    timerBar.style.width = "100%";
    isGameOver = false;
    timer = setInterval(() => {
        if (isGameOver) {  // Detener el temporizador si el juego terminó
            clearInterval(timer);
            return;
        }
        totalTime--;
        const percentage = (totalTime / totalTimeFunc()) * 100;
        timerBar.style.width = `${percentage}%`;

        if (totalTime <= 0) {
            clearInterval(timer);
            isGameOver = true;
        }
    }, 1000);
}

export async function startGame(setJokeTheme, difficultySelect, updatePointsDisplay, setIsGameOver, setStartButton) {
    const currentJokeTheme = getRandomTheme();
    setJokeTheme(currentJokeTheme);
    totalTime = getTotalTime(difficultySelect);
    startTimer(setStartButton, totalTime);
    // Additional game setup logic...
}

export async function saveUserJoke(jokeInput, difficultySelect, updatePointsDisplay, setStartButton) {
    const joke = jokeInput.value;
    if (!joke || !currentUser) return;

    const jokeData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Usuario desconocido",
        topic: currentJokeTheme,
        content: joke,
        points: points,
        timestamp: new Date(),
        difficulty: difficultySelect.value
    };

    await saveJoke(jokeData);
    points += 1; // Increment points
    updatePointsDisplay();
    setStartButton();
}
