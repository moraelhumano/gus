// ui.js
import { loginWithGoogle } from "./auth.js";
import { saveJoke, getJokes, deleteJoke } from "./firestore.js";
import { startGame } from "./gamelogic.js";

export const jokeContainer = document.getElementById("joke-container");
export const jokeInput = document.getElementById("joke-input");
export const startButton = document.getElementById("start-button");
export const submitJokeButton = document.getElementById("submit-joke-button");
export const loginButton = document.getElementById("login-button");
export const pointsDisplay = document.getElementById("points-display");
export const timerBar = document.getElementById("timer-bar");
export const difficultySelect = document.getElementById("difficulty-select");

loginButton.addEventListener("click", loginWithGoogle);
submitJokeButton.addEventListener("click", saveJoke);
startButton.addEventListener("click", startGame);

export function updatePointsDisplay() {
    pointsDisplay.innerText = `Puntos Totales: ${points}`;
}

export function displayMessage(msg) {
    const messageElement = document.createElement("div");
    messageElement.innerText = msg;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
}

export async function loadJokes() {
    const jokes = await getJokes();
    jokes.forEach(joke => {
        // Renderiza cada chiste en el contenedor
    });
}
