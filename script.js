// script.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging.js';
import { getAuth,onAuthStateChanged , GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js';
import { getFirestore, collection, getDocs, addDoc, query, where, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js';
import { themes } from '/words.js'; // Asegúrate de que esta ruta sea correcta


// Importa la función desde aula.js
import { cargarTopics } from './aula.js';

// Ejecuta la función cargarTopics cuando el documento esté listo
window.onload = () => {
    cargarTopics();
};




// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDgFJNyUL2AxT6YatY84E1udDkMSz9DGGs",
    authDomain: "risapp-37bd9.firebaseapp.com",
    projectId: "risapp-37bd9",
    storageBucket: "risapp-37bd9.appspot.com",
    messagingSenderId: "909578481013",
    appId: "1:909578481013:web:541567a62b2c71f019773c",
    measurementId: "G-46EQJBZQ3T"
};


// Inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let points = 0;
let currentJokeTheme = '';
let isGameOver = false;
let totalTime;
let startTime; // Agregar la variable startTime aquí
let timer;


const jokeInput = document.getElementById("joke-input");
const jokeContainer = document.getElementById("joke-container");
const startButton = document.getElementById("start-button");
const gameContainer = document.getElementById("game-container");
const loginContainer = document.getElementById("login-container");
const submitJokeButton = document.getElementById("submit-joke-button");
const pointsDisplay = document.getElementById("points-display");
const toggleTableButton = document.getElementById("toggle-table-button");
const timerBar = document.getElementById("timer-bar");
const difficultySelect = document.getElementById("difficulty-select");


// Función para iniciar sesión con Google
async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        // Redirige a main.html
        window.location.href = "main.html"; // Cambia el enlace si es necesario
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
}

// Función para mostrar la información del usuario
function displayUserInfo() {
    const logoutButton = document.getElementById("logout-button");

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await auth.signOut();
                // Cambia el estilo del botón al cerrar sesión
                logoutButton.style.display = "none";
                window.location.href = "index.html";

            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        });
    } else {
        console.log("El botón de cierre de sesión no se encontró en el DOM.");
    }
}


// Controlar la visibilidad de main-menu basado en el estado de autenticación
auth.onAuthStateChanged((user) => {
    const topicsContainer = document.getElementById("topics-container");
    const mainMenu = document.getElementById("main-menu");
    const loginContainer = document.getElementById("login-container");

    if (user) {
        // Usuario autenticado: mostrar elementos relevantes y ocultar login-container
        if (topicsContainer) {
            topicsContainer.style.display = "block";
        }
        if (mainMenu) {
            mainMenu.style.display = "block";
        }
        if (loginContainer) {
            loginContainer.style.display = "none";
        }
    } else {
        // Usuario no autenticado: ocultar elementos y mostrar login-container
        if (topicsContainer) {
            topicsContainer.style.display = "none";
        }
        if (mainMenu) {
            mainMenu.style.display = "none";
        }
        if (loginContainer) {
            loginContainer.style.display = "block";
        }
    }
});


// Controlar la visibilidad de topics-container basado en el estado de autenticación
auth.onAuthStateChanged((user) => {
    const topicsContainer = document.getElementById("topics-container");
    const loginContainer = document.getElementById("login-container");

    if (user) {
        // Usuario autenticado: mostrar topics-container y ocultar login-container
        if (topicsContainer) {
            topicsContainer.style.display = "block";
        }
        if (loginContainer) {
            loginContainer.style.display = "none";
        }
    } else {
        // Usuario no autenticado: ocultar topics-container y mostrar login-container
        if (topicsContainer) {
            topicsContainer.style.display = "none";
        }
        if (loginContainer) {
            loginContainer.style.display = "block";
        }
    }
});



async function deleteJoke(jokeId) {
    try {
        await deleteDoc(doc(db, "jokes", jokeId)); // Elimina el documento del Firestore
        displayMessage("Chiste eliminado con éxito."); // Muestra un mensaje de éxito
    } catch (error) {
        console.error("Error al eliminar el chiste:", error);
        displayMessage("Error al eliminar el chiste."); // Muestra un mensaje de error
    }
}

// Función para obtener y mostrar los chistes del usuario actual
async function displayJokes() {
    const jokeContainer = document.getElementById('joke-container');
    const toggleTableButton = document.getElementById('toggle-table-button');
    const jokeTable = document.createElement('table');
    jokeTable.classList.add('min-w-full', 'table-auto', 'border-collapse');

    // Crear encabezados de la tabla
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Tema', 'Chiste', ''];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.classList.add('px-4', 'py-2', 'text-left', 'border-b');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    tableHeader.appendChild(headerRow);
    jokeTable.appendChild(tableHeader);

    // Crear cuerpo de la tabla
    const tableBody = document.createElement('tbody');

    // Obtener el ID del usuario actual
    const user = auth.currentUser;
    if (!user) {
        return;
    }
    const userId = user.uid;

    // Consultar chistes del usuario actual
    const jokesRef = collection(db, "jokes");
    const userJokesQuery = query(jokesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(userJokesQuery);

    let totalPoints = 0; // Variable para almacenar los puntos totales

    querySnapshot.forEach(docSnap => {
        const row = document.createElement('tr');
        const topic = docSnap.data().topic;
        const content = docSnap.data().content;
        const points = docSnap.data().points || 0; // Obtener puntos, si no existen, asignar 0
        const jokeId = docSnap.id; 

        // Sumar los puntos del chiste al total
        totalPoints += points;

        // Agregar la fila con los datos
        const topicCell = document.createElement('td');
        topicCell.classList.add('px-4', 'py-2', 'border-b');
        topicCell.textContent = topic;

        const contentCell = document.createElement('td');
        contentCell.classList.add('px-4', 'py-2', 'border-b');
        contentCell.textContent = content;

        // Crear la celda para las acciones (botón de basura)
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('px-4', 'py-2', 'border-b', 'text-center');
        const trashIcon = document.createElement('span');
        trashIcon.textContent = '🗑️'; 
        trashIcon.classList.add('cursor-pointer');

        // Añadir el evento de clic para eliminar el chiste
        trashIcon.addEventListener('click', async () => {
            const confirmation = window.confirm('¿Estás seguro de que deseas borrar este chiste?');
            if (confirmation) {
                try {
                    await deleteDoc(doc(db, "jokes", jokeId));
                    row.remove();
                    totalPoints -= points; // Restar los puntos del chiste eliminado
                    updateTotalPointsDisplay(totalPoints); // Actualizar la visualización de puntos
                    alert('Chiste borrado exitosamente');
                } catch (error) {
                    console.error('Error al borrar el chiste:', error);
                    alert('Hubo un error al borrar el chiste');
                }
            }
        });

        actionsCell.appendChild(trashIcon);
        row.appendChild(topicCell);
        row.appendChild(contentCell);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });

    jokeTable.appendChild(tableBody);

    // Crear y mostrar los puntos totales
    const totalPointsDisplay = document.createElement('div');
    totalPointsDisplay.id = 'total-points';
    totalPointsDisplay.classList.add('mb-4', 'text-lg', 'font-bold');
    totalPointsDisplay.textContent = `Puntos totales: ${totalPoints}`;

    // Agregar los puntos totales en la parte superior del contenedor
    jokeContainer.innerHTML = '';
    jokeContainer.appendChild(totalPointsDisplay); // Los puntos totales se añaden primero
    jokeContainer.appendChild(jokeTable); // Luego la tabla

    // Hacer visible el botón de "Mostrar Chistes"
    toggleTableButton.style.display = 'block';

    // Agregar el evento al botón para mostrar la tabla
    toggleTableButton.addEventListener('click', () => {
        jokeContainer.style.display = jokeContainer.style.display === 'none' ? 'block' : 'none';
        toggleTableButton.textContent = jokeContainer.style.display === 'none' ? 'Mostrar Chistes' : 'Ocultar Chistes';
    });

    // Función para actualizar la visualización de puntos totales
    function updateTotalPointsDisplay(points) {
        totalPointsDisplay.textContent = `Puntos totales: ${points}`;
    }
}

// Llamar a la función cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    displayJokes();
});


// Llamar a la función cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    displayJokes();
});





// Actualiza la visualización de puntos
function updatePointsDisplay() {
    pointsDisplay.innerText = `Puntos: ${points}`;
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



// Verificar si jokeContainer existe antes de intentar modificar su visibilidad
if (jokeContainer && jokeContainer.style.display !== "none") {
    jokeContainer.style.display = "none"; // Inicialmente oculta el contenedor de chistes
    console.info("El contenedor de chistes ha sido ocultado.");
} else {
    console.warn("jokeContainer no está presente o ya está oculto.");
    // Opcional: Lógica alternativa si jokeContainer no existe o ya está oculto
}


//Verificar si jokeInput existe y no está oculto antes de modificar su visibilidad
if (jokeInput && jokeInput.style.display !== "none") {
    jokeInput.style.display = "none"; // Ocultar el input
     console.info("El input de chistes ha sido ocultado.");
 } else {
     console.warn("jokeInput no está presente o ya está oculto.");
     // Opcional: Lógica alternativa si jokeInput no existe o ya está oculto
 }

//Verificar si submitJokeButton existe y no está oculto antes de modificar su visibilidad
if (submitJokeButton && submitJokeButton.style.display !== "none") {
    submitJokeButton.style.display = "none"; // Ocultar el botón de enviar inicialmente
     console.info("El botón de enviar ha sido ocultado.");
 } else {
     console.warn("submitJokeButton no está presente o ya está oculto.");
     // Opcional: Lógica alternativa si submitJokeButton no existe o ya está oculto
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


auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;

        // Ocultar el botón de inicio de sesión y mostrar el contenedor del juego
        loginContainer.style.display = "none";
        gameContainer.style.display = "block";

        // Cargar chistes
        displayJokes();

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



    // Inicializar el servicio de mensajería después de la inicialización de Firebase
    const messaging = getMessaging(app);

        // Exportar auth y db para su uso en otros scripts
        window.auth = auth;
        window.db = db;



// Manejo de notificaciones en primer plano
onMessage(messaging, (payload) => {
    console.log('Notificación recibida en primer plano:', payload);
    // Personaliza el despliegue de la notificación
    const { title, body } = payload.notification;
    new Notification(title, { body });
});




 if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("/service-worker.js")
 .then(() => console.log("Service Worker registrado"))
 .catch((error) => console.log("Error al registrar el Service Worker:", error));
}


 // Asegúrate de que el código Firebase de notificaciones esté después de la inicialización
//  messaging.getToken({ vapidKey: 'BHsf56viOIcnDAyNAGFmmH7_imkprzoJC8puoDVBi3jxeqyw4S1NT5DGkBx6qnYSRDU9ocj' })
//      .then((currentToken) => {
//          if (currentToken) {
//              console.log('Token de dispositivo:', currentToken);
//              // Aquí puedes enviar el token al servidor si lo necesitas
//          } else {
//              console.log('No hay token disponible.');
//          }
//      })
//      .catch((err) => {
//          console.log('Error al obtener el token:', err);
//      });


// Eventos
document.getElementById('login-button').addEventListener('click', loginWithGoogle);
document.getElementById('submit-joke-button').addEventListener('click', saveJoke);
document.getElementById('start-button').addEventListener('click', startGame);
