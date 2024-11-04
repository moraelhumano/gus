// script.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { themes } from "/words.js";

// Elementos del DOM
const jokeContainer = document.getElementById("joke-container");
const jokeInput = document.getElementById("joke-input");
const startButton = document.getElementById("start-button");
const submitJokeButton = document.getElementById("submit-joke-button");
const loginButton = document.getElementById("login-button");
const pointsDisplay = document.getElementById("points-display");
const gameContainer = document.getElementById("game-container");
const loginContainer = document.getElementById("login-container");
const timerBar = document.getElementById("timer-bar");
const difficultySelect = document.getElementById("difficulty-select");

let currentUser = null;
let points = 0;
let currentJokeTheme = '';
let timer;
let totalTime;
let startTime;
let isGameOver = false;

// Función para mostrar la información del usuario
function displayUserInfo() {
    const existingUserInfo = document.getElementById("user-info");
    if (existingUserInfo) {
        existingUserInfo.remove();
    }

    if (currentUser) {
        const userInfo = document.createElement("div");
        userInfo.classList.add("hidden");
        userInfo.id = "user-info";
        userInfo.innerHTML = `
            <img src="gus-logo.png" alt="Foto de perfil" class="h-10" />
            <button id="logout-button" class="hidden">Cerrar Sesión</button>
        `;

        const loginContainer = document.getElementById("login-container");
        if (loginContainer) {
            loginContainer.insertAdjacentElement('beforebegin', userInfo);
        }

        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.classList.add('visible');
            logoutButton.addEventListener("click", async () => {
                await auth.signOut();
                userInfo.remove();
                logoutButton.classList.remove('visible');
                gameContainer.style.display = "none";
                loginContainer.style.display = "block";
                points = 0;
                updatePointsDisplay();
                jokeContainer.innerHTML = "";
                currentJokeTheme = '';
                document.getElementById("current-theme").innerText = "Por 2 puntos escribe sobre: ";
                toggleTableButton.style.display = "none"; // Oculta el botón de "Mostrar Chistes" al cerrar sesión
            });
        } else {
            console.warn("El botón de cierre de sesión no se encontró en el DOM.");
        }
    }
}

// Función para iniciar sesión con Google
async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        window.location.href = "game.html";
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
}

// Función para obtener chistes
async function getJokes() {
    // Código de getJokes aquí (sin cambios)
}

// Crear un contenedor para el selector de dificultad y el botón
const controlContainer = document.createElement("div");
controlContainer.style.display = "flex";
controlContainer.style.alignItems = "center";
controlContainer.style.justifyContent = "center";
controlContainer.style.margin = "20px 0";

// Elemento para el botón de mostrar/ocultar tabla
const toggleTableButton = document.createElement("button");
toggleTableButton.textContent = "Mostrar Chistes";
toggleTableButton.classList.add("bg-blue-500", "text-white", "px-4", "py-2", "rounded", "hover:bg-blue-600");
toggleTableButton.style.display = "none"; // Oculta el botón inicialmente

controlContainer.appendChild(toggleTableButton);
jokeContainer.insertAdjacentElement('beforebegin', controlContainer);

let isTableVisible = false;
toggleTableButton.addEventListener("click", () => {
    isTableVisible = !isTableVisible;
    if (isTableVisible) {
        jokeContainer.style.display = "block";
        toggleTableButton.textContent = "Ocultar Chistes";
    } else {
        jokeContainer.style.display = "none";
        toggleTableButton.textContent = "Mostrar Chistes";
    }
});

jokeContainer.style.display = "none";

// Función para actualizar la visualización de puntos
function updatePointsDisplay() {
    pointsDisplay.innerText = `Puntos Totales: ${points}`;
}

// Verificar el estado de autenticación al cargar la aplicación
const auth = getAuth();
const db = getFirestore();

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loginContainer.style.display = "none";
        gameContainer.style.display = "block";
        toggleTableButton.style.display = "block"; // Mostrar el botón de "Mostrar Chistes" al iniciar sesión
        getJokes();
        displayUserInfo();
    } else {
        currentUser = null;
        loginContainer.style.display = "block";
        gameContainer.style.display = "none";
        jokeContainer.innerHTML = "";
        points = 0;
        updatePointsDisplay();
        document.getElementById("current-theme").innerText = "Por 2 puntos escribe sobre: ";
        toggleTableButton.style.display = "none"; // Ocultar el botón de "Mostrar Chistes" al cerrar sesión
        console.log("Usuario no autenticado.");
    }
});

// Eventos
loginButton.addEventListener("click", loginWithGoogle);
submitJokeButton.addEventListener("click", saveJoke);
startButton.addEventListener("click", startGame);
