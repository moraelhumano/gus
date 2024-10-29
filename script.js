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
// Arreglo de temas y palabras
const themes = [
    // Situaciones
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
    "pedir una pizza",
    "celebrar una fiesta sorpresa",
    "perder las llaves",
    "primer día de clases",
    "cita romántica",
    "pagar impuestos",
    "ir de campamento",
    "conocer a los suegros",
    "salir de compras en Black Friday",
    "ir al dentista",
    "festejar un cumpleaños infantil",
    "mudanza a una nueva ciudad",
    "encontrarse con una celebridad",
    "hacer una llamada accidental",
    "responder una pregunta difícil",
    "comprar ropa en rebaja",
    "usar tecnología nueva",
    "tener una entrevista de televisión",
    "resolver un acertijo complicado",
    "probar comida exótica",
    "tener un mal corte de cabello",
    "tomar el autobús equivocado",
    "darse cuenta que olvidaste tu cartera",
    "escuchar tu canción favorita en la radio",
    "preparar una sorpresa para un amigo",
    "dar un discurso en una boda",
    "entregar un proyecto en el trabajo",
    "llegar tarde a una boda",
    "tener que improvisar un discurso",
    "ver una película de terror solo",
    "sobrevivir una despedida de soltero/a",
    "perderse en un museo",
    "confundir el nombre de alguien",
    "hacer ejercicio en el gimnasio",
    "participar en una competencia de talento",
    "estar en una cena familiar incómoda",
    "planear unas vacaciones soñadas",

    // Palabras comunes
    "zapato",
    "camiones",
    "bicicleta",
    "reloj",
    "espejo",
    "computadora",
    "montaña",
    "guitarra",
    "sandwich",
    "teléfono",
    "muñeca",
    "pintura",
    "cámara",
    "árbol",
    "avión",
    "sombrero",
    "silla",
    "lámpara",
    "café",
    "llave",
    "libro",
    "pasta de dientes",
    "mochila",
    "vaso",
    "pluma",
    "cojín",
    "cartera",
    "música",
    "cuchara",
    "baile",
    "parque",
    "amigo",
    "pelota",
    "ventana",
    "sol",
    "estrella",
    "animal",
    "carro",
    "tren",
    "bicicleta",
    "flor",
    "mesa"
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
        userInfo.classList.add("flex", "justify-around");
        userInfo.id = "user-info"; // Añade un ID para poder identificarlo
        userInfo.innerHTML = `
            <button id="logout-button" class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">Cerrar sesión</button>
            <p class="text-lg">Bienvenido, ${currentUser.displayName}!</p>
            <img src="${currentUser.photoURL}" alt="Foto de perfil" class="w-16 h-16 rounded-full  mb-2" />
        `;

        // Inserta el contenedor de usuario antes del contenedor de inicio de sesión
        const loginContainer = document.getElementById("login-container");
        loginContainer.insertAdjacentElement('beforebegin', userInfo); // Inserta antes del contenedor de inicio de sesión

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
// Función para obtener los chistes de Firestore
async function getJokes() {
    try {
        const q = query(collection(db, "jokes"), where("userId", "==", currentUser.uid)); // Filtrar por userId
        const querySnapshot = await getDocs(q);
        
        jokeContainer.innerHTML = ""; // Limpia el contenedor de chistes
        let totalPoints = 0; // Inicializa los puntos totales

        // Crear el elemento tabla y los encabezados
        const table = document.createElement("table");
        table.classList.add("jokes-table"); // Añadir una clase para estilizar la tabla si lo deseas
        
        const headerRow = document.createElement("tr");
        const headers = ["Tema", "Chiste", "Puntos"];
        
        headers.forEach(headerText => {
            const header = document.createElement("th");
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        
        table.appendChild(headerRow);

        // Crear una fila para cada chiste
        querySnapshot.forEach((doc) => {
            const jokeData = doc.data();
            console.log(jokeData); // Verificar qué datos estás recibiendo

            if (jokeData.topic && jokeData.content) {
                const row = document.createElement("tr");

                // Crear celdas para cada dato
                const topicCell = document.createElement("td");
                topicCell.textContent = jokeData.topic;
                
                const contentCell = document.createElement("td");
                contentCell.textContent = jokeData.content;
                
                const pointsCell = document.createElement("td");
                pointsCell.textContent = jokeData.points;

                // Añadir las celdas a la fila
                row.appendChild(topicCell);
                row.appendChild(contentCell);
                row.appendChild(pointsCell);

                // Añadir la fila a la tabla
                table.appendChild(row);

                // Sumar los puntos del chiste actual
                totalPoints += jokeData.points;
            } else {
                console.warn(`El documento ${doc.id} no contiene el tema o el chiste.`);
            }
        });
        
        jokeContainer.appendChild(table); // Agregar la tabla al contenedor de chistes
        points = totalPoints; // Actualiza la variable de puntos acumulados
        updatePointsDisplay(); // Actualiza la visualización de puntos
    } catch (error) {
        console.error("Error al obtener los chistes:", error);
    }
}


// Función para agregar un chiste a Firestore, incluyendo el nombre del usuario


async function getAllJokes() {
    try {
        const querySnapshot = await getDocs(collection(db, "jokes"));
        allJokesList.innerHTML = ""; // Limpiar la lista de chistes

        querySnapshot.forEach((doc) => {
            const jokeData = doc.data();
            const jokeDate = new Date(jokeData.timestamp.toDate()); // Convertir timestamp a Date
            const formattedDate = jokeDate.toLocaleString(); // Formato legible

            if (jokeData.content && jokeData.userName) {
                allJokesList.innerHTML += `
                    <div class="mb-4 border p-2 rounded">
                        <p class="font-bold">${jokeData.userName}</p>
                        <p>Tema: ${jokeData.topic}</p>
                        <p>Chiste: ${jokeData.content}</p>
                        <p class="text-gray-500 text-sm">${formattedDate}</p>
                    </div>
                `;
            }
        });

        allJokesContainer.style.display = "block"; // Mostrar el contenedor
    } catch (error) {
        console.error("Error al obtener los chistes de otros usuarios:", error);
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
async function saveJoke() {
    const joke = jokeInput.value;
    if (!joke || !currentUser) return;

    try {
        const userName = currentUser.displayName || "Usuario desconocido";
        
        await addDoc(collection(db, "jokes"), {
            userId: currentUser.uid,
            userName: userName,
            topic: currentJokeTheme,
            content: joke,
            points: 2,
            timestamp: new Date(),
            ratings: []
        });
        
        points += 2;
        currentJokeTheme = '';
        document.getElementById("current-theme").innerText = "Tema actual: ";
        jokeInput.value = ""; 
        updatePointsDisplay();
        
        isGameOver = true; // Termina el juego al enviar el chiste
        resetTimer(); // Detén el temporizador
        displayMessage("¡Chiste enviado!");
        
        // Llama a getJokes() para refrescar la lista de chistes
        await getJokes();
    } catch (error) {
        console.error("Error al guardar el chiste:", error);
    }
}


function startTimer() {
    timerBar.style.width = "100%";
    isGameOver = false;
    timer = setInterval(() => {
        if (isGameOver) {  // Detener el temporizador si el juego terminó
            clearInterval(timer);
            return;
        }

        totalTime--;
        const percentage = (totalTime / getTotalTime()) * 100;
        timerBar.style.width = `${percentage}%`;

        if (totalTime <= 0) {
            clearInterval(timer);
            if (!isGameOver) {
                displayMessage("Se acabó el tiempo! Has obtenido 1 punto.");
                points += 1;
                updatePointsDisplay();
                isGameOver = true;
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
