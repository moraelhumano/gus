// script.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

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

// Arreglo de temas
const themes = [
    "probar una nueva receta",
    "tener una mascota",
    "presentación en público",
    "estar atrapado en el tráfico",
    "día de playa",
    "tener una entrevista de trabajo",
    "saludar a alguien que no recuerdas",
    "viaje en avión",
    "despertarse tarde",
    "reunión de exalumnos",
    "pedir una pizza"
];

// Función para mostrar la información del usuario
function displayUserInfo() {
    // Elimina la información de usuario existente si ya hay una
    const existingUserInfo = document.getElementById("user-info");
    if (existingUserInfo) {
        existingUserInfo.remove();
    }

    if (currentUser) {
        const userInfo = document.createElement("div");
        userInfo.id = "user-info"; // Añade un ID para poder identificarlo
        userInfo.innerHTML = `
            <p>Bienvenido, ${currentUser.displayName}!</p>
            <img src="${currentUser.photoURL}" alt="Foto de perfil" />
            <button id="logout-button">Cerrar sesión</button>
        `;
        document.body.appendChild(userInfo);

        // Agregar evento de cierre de sesión
        document.getElementById("logout-button").addEventListener("click", async () => {
            await auth.signOut();
            userInfo.remove();
            gameContainer.style.display = "none"; // Ocultar contenedor del juego
            loginContainer.style.display = "block"; // Mostrar botón de inicio de sesión
            points = 0; // Reinicia los puntos
            updatePointsDisplay();
            jokeContainer.innerHTML = ""; // Limpiar chistes al cerrar sesión
            currentJokeTheme = ''; // Limpiar el tema actual
            document.getElementById("current-theme").innerText = "Tema actual: "; // Limpiar el tema en el DOM
        });
    }
}

// Función para iniciar sesión con Google
async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        loginContainer.style.display = "none"; // Ocultar el botón de inicio de sesión
        gameContainer.style.display = "block"; // Mostrar contenedor del juego
        getJokes(); // Carga los chistes después de iniciar sesión
        displayUserInfo(); // Mostrar información del usuario
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
}

// Función para obtener los chistes de Firestore
async function getJokes() {
    try {
        const q = query(collection(db, "jokes"), where("userId", "==", currentUser.uid)); // Filtrar por userId
        const querySnapshot = await getDocs(q);
        
        jokeContainer.innerHTML = ""; // Limpia el contenedor de chistes
        let totalPoints = 0; // Inicializa los puntos totales

        querySnapshot.forEach((doc) => {
            const jokeData = doc.data();
            console.log(jokeData); // Verificar qué datos estás recibiendo
            // Acceder a las propiedades correctas
            if (jokeData.topic && jokeData.content) {
                jokeContainer.innerHTML += `Tema: ${jokeData.topic} - Chiste: ${jokeData.content} - Puntos: ${jokeData.points}<br>`;
                totalPoints += jokeData.points; // Sumar puntos de cada chiste
            } else {
                console.warn(`El documento ${doc.id} no contiene el tema o el chiste.`);
            }
        });
        
        points = totalPoints; // Actualiza la variable de puntos acumulados
        updatePointsDisplay(); // Actualiza la visualización de puntos
    } catch (error) {
        console.error("Error al obtener los chistes:", error);
    }
}

// Función para agregar un chiste a Firestore
async function saveJoke() {
    const joke = jokeInput.value;
    if (!joke) return;

    try {
        await addDoc(collection(db, "jokes"), {
            userId: currentUser.uid, // Guardar el UID del usuario
            topic: currentJokeTheme,
            content: joke,
            points: 2 // Puntos por el chiste
        });
        points += 2; // Sumar puntos
        currentJokeTheme = ''; // Limpiar el tema actual
        document.getElementById("current-theme").innerText = "Tema actual: "; // Actualizar el texto en el DOM
        jokeInput.value = ""; // Limpiar el input
        getJokes(); // Obtener chistes nuevamente
        updatePointsDisplay();
        resetTimer(); // Reiniciar el temporizador
        displayMessage("¡Chiste enviado!");
    } catch (error) {
        console.error("Error al guardar el chiste:", error);
    }
}

// Función para actualizar la visualización de puntos
function updatePointsDisplay() {
    pointsDisplay.innerText = `Puntos Totales: ${points}`;
}

// Función para mostrar un mensaje en la pantalla
function displayMessage(msg) {
    const messageElement = document.createElement("div");
    messageElement.innerText = msg;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Función para iniciar el juego
function startGame() {
    currentJokeTheme = getRandomTheme(); // Obtener un tema aleatorio
    document.getElementById("current-theme").innerText = `Tema actual: ${currentJokeTheme}`; // Mostrar tema actual
    totalTime = getTotalTime();
    startTimer();
    jokeContainer.innerHTML = ""; // Limpiar chistes anteriores
}

// Función para obtener el tiempo total según la dificultad
function getTotalTime() {
    const difficulty = difficultySelect.value;
    switch (difficulty) {
        case "easy": return 90; // 1:30 minutos
        case "medium": return 60; // 1 minuto
        case "hard": return 30; // 30 segundos
        default: return 60; // Valor por defecto
    }
}

// Función para iniciar el temporizador
let isGameOver = false; // Variable de control para verificar si el juego ha terminado

// Función para iniciar el temporizador
function startTimer() {
    timerBar.style.width = "100%"; // Resetea la barra
    isGameOver = false; // Reinicia el estado del juego al iniciar el temporizador
    timer = setInterval(() => {
        totalTime--;
        const percentage = (totalTime / getTotalTime()) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (totalTime <= 0) {
            clearInterval(timer);
            if (!isGameOver) { // Solo sumar puntos si el juego no ha terminado aún
                displayMessage("Se acabó el tiempo! Has obtenido 1 punto.");
                points += 1; // Sumar un punto por tiempo agotado
                updatePointsDisplay();
                isGameOver = true; // Marca el juego como terminado
            }
            resetTimer();
        }
    }, 1000);
}

// Función para reiniciar el temporizador
function resetTimer() {
    clearInterval(timer);
    timerBar.style.width = "100%"; // Resetea la barra
}

// Función para obtener un tema aleatorio de la lista existente
function getRandomTheme() {
    const randomIndex = Math.floor(Math.random() * themes.length);
    return themes[randomIndex];
}

// Verificar el estado de autenticación al cargar la aplicación
const auth = getAuth();
const db = getFirestore();
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loginContainer.style.display = "none"; // Ocultar el botón de inicio de sesión
        gameContainer.style.display = "block"; // Mostrar contenedor del juego
        getJokes(); // Cargar chistes
        displayUserInfo(); // Mostrar información del usuario
    } else {
        currentUser = null;
        loginContainer.style.display = "block"; // Mostrar botón de inicio de sesión
        gameContainer.style.display = "none"; // Ocultar contenedor del juego
        jokeContainer.innerHTML = ""; // Limpiar los chistes al cerrar sesión
        points = 0; // Reiniciar los puntos
        updatePointsDisplay(); // Actualizar la visualización de puntos
        document.getElementById("current-theme").innerText = "Tema actual: "; // Limpiar el tema en el DOM
    }
});

// Eventos
loginButton.addEventListener("click", loginWithGoogle);
submitJokeButton.addEventListener("click", saveJoke);
startButton.addEventListener("click", startGame);
