// script.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { themes } from  "/words.js";




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
let startTime; // Agregar la variable startTime aquí
let isGameOver = false; // Variable de control para verificar si el juego ha terminado





// Función para mostrar la información del usuario

function displayUserInfo() {
    // Elimina la información de usuario existente si ya hay una
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

        // Inserta el contenedor de usuario antes del contenedor de inicio de sesión
        const loginContainer = document.getElementById("login-container");
        if (loginContainer) {
            loginContainer.insertAdjacentElement('beforebegin', userInfo); // Inserta antes del contenedor de inicio de sesión
        }

        // Actualiza la imagen del usuario en el menú
        const userAvatar = document.getElementById("user-avatar");
        if (userAvatar) {
            //userAvatar.src = currentUser.photoURL; // Descomenta esta línea si tienes la URL de la foto del usuario
        }

        // Asegúrate de que el botón de cierre de sesión exista
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            // Mostrar el botón de cierre de sesión
            logoutButton.classList.add('visible'); 

            // Agregar evento de cierre de sesión
            logoutButton.addEventListener("click", async () => {
                await auth.signOut();
                userInfo.remove();
                logoutButton.classList.remove('visible'); // Ocultar botón de cierre de sesión
                gameContainer.style.display = "none"; // Ocultar contenedor del juego
                loginContainer.style.display = "block"; // Mostrar botón de inicio de sesión
                points = 0; // Reinicia los puntos
                updatePointsDisplay();
                jokeContainer.innerHTML = ""; // Limpiar chistes al cerrar sesión
                document.getElementById("current-theme").innerText = "Por 2 puntos escribe sobre: "; // Limpiar el tema en el DOM
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
        // Redirige a game.html
        window.location.href = "main.html"; // Cambia el enlace si es necesario
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
}

async function deleteJoke(jokeId) {
    try {
        await deleteDoc(doc(db, "jokes", jokeId)); // Elimina el documento del Firestore
        displayMessage("Chiste eliminado con éxito."); // Muestra un mensaje de éxito
    } catch (error) {
        console.error("Error al eliminar el chiste:", error);
        displayMessage("Error al eliminar el chiste."); // Muestra un mensaje de error
    }
}

async function getJokes() {
    try {
        const q = query(collection(db, "jokes"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        jokeContainer.innerHTML = ""; // Limpia el contenedor de chistes
        let totalPoints = 0;

        // Crear el elemento de encabezado para mostrar los puntos totales
        const totalPointsDisplay = document.createElement("h3");
        totalPointsDisplay.classList.add("total-points-display"); // Agregar estilos adicionales si es necesario

        // Crear el elemento tabla y los encabezados
        const table = document.createElement("table");
        table.classList.add("jokes-table");

        const headerRow = document.createElement("tr");
        const headers = [ "Chiste", "Acciones"]; // Añadir encabezado de acciones

        headers.forEach(headerText => {
            const header = document.createElement("th");
            header.classList.add("border-bottom");
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        table.appendChild(headerRow);

        // Crear una fila para cada chiste
        querySnapshot.forEach((doc) => {
            const jokeData = doc.data();

            if (jokeData.topic && jokeData.content) {
                const row = document.createElement("tr");

                const topicCell = document.createElement("td");
                topicCell.textContent = jokeData.topic;

                const contentCell = document.createElement("td");
                contentCell.textContent = jokeData.content;

                // Sumar los puntos de cada chiste al total
                totalPoints += jokeData.points;

                // Crear la celda de acción con el botón de eliminar
                const actionCell = document.createElement("td");
                const deleteButton = document.createElement("button");
                deleteButton.innerHTML = "🗑️"; // Cambiar el texto por el emoji de bote de basura
                deleteButton.classList.add("px-4", "py-2", "rounded", "hover:bg-red-600");

                // Agregar el evento de eliminación
                deleteButton.addEventListener("click", async () => {
                    const confirmation = confirm("¿Estás seguro de que deseas eliminar este chiste?");
                    if (confirmation) {
                        await deleteJoke(doc.id);
                        await getJokes();
                    }
                });

                actionCell.appendChild(deleteButton);
                row.appendChild(topicCell);
                row.appendChild(contentCell);
                row.appendChild(actionCell); // Agregar celda de acción

                table.appendChild(row);
            } else {
                console.warn(`El documento ${doc.id} no contiene el tema o el chiste.`);
            }
        });

        // Actualizar la visualización del total de puntos
        totalPointsDisplay.textContent = `Total de puntos: ${totalPoints}`;
        jokeContainer.appendChild(totalPointsDisplay); // Agregar el total de puntos antes de la tabla

        jokeContainer.appendChild(table);
        points = totalPoints;
        updatePointsDisplay();
    } catch (error) {
        console.error("Error al obtener los chistes:", error);
    }
}



if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
            })
            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });
    });
}



// Crear un contenedor para el selector de dificultad y el botón
const controlContainer = document.createElement("div");
controlContainer.style.display = "flex"; // Usar flexbox
controlContainer.style.alignItems = "center"; // Alinear verticalmente
controlContainer.style.justifyContent = "center"; // Centrar horizontalmente
controlContainer.style.margin = "20px 0"; // Añadir margen superior e inferior



// Elemento para el botón de mostrar/ocultar tabla
const toggleTableButton = document.createElement("button");
toggleTableButton.textContent = "Mostrar Chistes";
toggleTableButton.classList.add("bg-blue-500", "text-white", "px-4", "py-2", "rounded", "hover:bg-blue-600");

// Añadir el selector y el botón al contenedor
controlContainer.appendChild(toggleTableButton); // Añadir el botón al lado

// Verificar si jokeContainer existe antes de intentar modificar su visibilidad
if (jokeContainer && jokeContainer.style.display !== "none") {
    jokeContainer.style.display = "none"; // Inicialmente oculta el contenedor de chistes
    console.info("El contenedor de chistes ha sido ocultado.");
} else {
    console.warn("jokeContainer no está presente o ya está oculto.");
    // Opcional: Lógica alternativa si jokeContainer no existe o ya está oculto
}

// Verificar si jokeInput existe y no está oculto antes de modificar su visibilidad
if (jokeInput && jokeInput.style.display !== "none") {
    jokeInput.style.display = "none"; // Ocultar el input
    console.info("El input de chistes ha sido ocultado.");
} else {
    console.warn("jokeInput no está presente o ya está oculto.");
    // Opcional: Lógica alternativa si jokeInput no existe o ya está oculto
}

// Verificar si submitJokeButton existe y no está oculto antes de modificar su visibilidad
if (submitJokeButton && submitJokeButton.style.display !== "none") {
    submitJokeButton.style.display = "none"; // Ocultar el botón de enviar inicialmente
    console.info("El botón de enviar ha sido ocultado.");
} else {
    console.warn("submitJokeButton no está presente o ya está oculto.");
    // Opcional: Lógica alternativa si submitJokeButton no existe o ya está oculto
}


// Inicializa la tabla oculta
let isTableVisible = false;
toggleTableButton.addEventListener("click", () => {
    isTableVisible = !isTableVisible; // Cambia el estado de visibilidad

    if (isTableVisible) {
        jokeContainer.style.display = "block"; // Muestra la tabla
        toggleTableButton.textContent = "Ocultar Chistes"; // Cambia el texto del botón
    } else {
        jokeContainer.style.display = "none"; // Oculta la tabla
        toggleTableButton.textContent = "Mostrar Chistes"; // Cambia el texto del botón
    }
});



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


// Al iniciar, oculta el input y el botón de enviar

// Función para iniciar el temporizador
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
                // Cambiar el mensaje de tema para 1 punto
                document.getElementById("current-theme").innerText = `Por 1 punto escribe sobre: ${currentJokeTheme}`;

                points += 1; // Solo se sumará 1 punto
                updatePointsDisplay();
                isGameOver = true;

                // Vuelve a mostrar el botón de inicio
                startButton.style.display = "block"; // Mostrar el botón de inicio
            }
            resetTimer();
        }
    }, 1000);
}


function startGame() {
    startButton.style.display = "none";
    currentJokeTheme = getRandomTheme();
    document.getElementById("current-theme").innerText = `Por 2 puntos escribe sobre: ${currentJokeTheme}`;
    totalTime = getTotalTime();
    startTime = new Date(); // Aquí se asigna startTime
    startTimer();
    jokeInput.value = "";
    jokeInput.style.display = "block";
    submitJokeButton.style.display = "block";
}



// Modificar la función saveJoke
async function saveJoke() {
    const joke = jokeInput.value;
    if (!joke || !currentUser) return;

    try {
        const userName = currentUser.displayName || "Usuario desconocido";

        // Cambiar la lógica aquí: si el tiempo ha terminado, solo sumamos 1 punto.
        const pointsToAdd = (isGameOver) ? 1 : 2;

        // Calcular el tiempo transcurrido en segundos
        const endTime = new Date();
        const timeSpent = Math.floor((endTime - startTime) / 1000); // Diferencia en segundos

        await addDoc(collection(db, "jokes"), {
            userId: currentUser.uid,
            userName: userName,
            topic: currentJokeTheme,
            content: joke,
            points: pointsToAdd, // Añadimos los puntos correctos según el estado del juego
            timestamp: new Date(),
            ratings: [],
            difficulty: difficultySelect.value, // Aquí almacenamos la dificultad
            timeSpent: timeSpent // Almacena el tiempo que tardó el usuario
        });

        points += pointsToAdd;
        currentJokeTheme = '';
        document.getElementById("current-theme").innerText = "Por 2 puntos escribe sobre: ";
        jokeInput.value = ""; 
        updatePointsDisplay();

        isGameOver = true; // Termina el juego al enviar el chiste
        resetTimer(); // Detén el temporizador
        displayMessage("¡Chiste enviado!");

        // Vuelve a mostrar el botón de inicio
        startButton.style.display = "block"; // Mostrar el botón de inicio

        // Llama a getJokes() para refrescar la lista de chistes
        await getJokes();
    } catch (error) {
        console.error("Error al guardar el chiste:", error);
    }
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

        // Ocultar el botón de inicio de sesión y mostrar el contenedor del juego
        loginContainer.style.display = "none";
        gameContainer.style.display = "block";

        // Cargar chistes
        getJokes();

        // Mostrar información del usuario
        const userInfo = {
            name: user.displayName,
            photoURL: user.photoURL,
            // Agrega cualquier otro campo que necesites
        };
        displayUserInfo(userInfo);

    } else {
        // Resetear variables y UI al cerrar sesión
        currentUser = null;
        loginContainer.style.display = "block";
        gameContainer.style.display = "none";
        jokeContainer.innerHTML = ""; // Limpiar los chistes
        points = 0; // Reiniciar los puntos
        updatePointsDisplay();
        document.getElementById("current-theme").innerText = "Por 2 puntos escribe sobre: "; // Limpiar el tema en el DOM
        console.log("Usuario no autenticado.");
    }
});


let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    // Previene que el banner de instalación aparezca de inmediato
    e.preventDefault();
    deferredPrompt = e;
    
    // Muestra un botón o alguna indicación de que la app es instalable
    const installButton = document.getElementById("installButton");
    installButton.style.display = "block";

    // Manejar el clic en el botón para mostrar el prompt de instalación
    installButton.addEventListener("click", () => {
        installButton.style.display = "none";
        deferredPrompt.prompt();
        
        // Espera la respuesta del usuario
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("Usuario aceptó la instalación");
            } else {
                console.log("Usuario rechazó la instalación");
            }
            deferredPrompt = null;
        });
    });
});


// Oculta el botón "Mostrar Chistes" inicialmente
toggleTableButton.style.display = "none";

// Verificar el estado de autenticación al cargar la aplicación
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;

        // Ocultar el botón de inicio de sesión y mostrar el contenedor del juego
        loginContainer.style.display = "none";
        gameContainer.style.display = "block";

        // Muestra el botón "Mostrar Chistes" solo cuando el usuario está autenticado
        toggleTableButton.style.display = "block";

        // Cargar chistes
        getJokes();

        // Mostrar información del usuario
        const userInfo = {
            name: user.displayName,
            photoURL: user.photoURL,
            // Agrega cualquier otro campo que necesites
        };
        displayUserInfo(userInfo);

    } else {
        // Resetear variables y UI al cerrar sesión
        currentUser = null;
        loginContainer.style.display = "block";
        gameContainer.style.display = "none";
        jokeContainer.innerHTML = ""; // Limpiar los chistes
        points = 0; // Reiniciar los puntos
        updatePointsDisplay();
        document.getElementById("current-theme").innerText = "Por 2 puntos escribe sobre: "; // Limpiar el tema en el DOM
        toggleTableButton.style.display = "none"; // Oculta el botón "Mostrar Chistes" si no está autenticado
        console.log("Usuario no autenticado.");
    }
});





// Eventos
loginButton.addEventListener("click", loginWithGoogle);
submitJokeButton.addEventListener("click", saveJoke);
startButton.addEventListener("click", startGame);