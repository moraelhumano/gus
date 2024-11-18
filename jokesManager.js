// jokesManager.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

import { controlContainer } from './auth.js';  // Asegúrate de que la ruta sea correcta

let currentUser = null;
let points = 0;
let currentJokeTheme = '';
let timer;
let totalTime;
let startTime; // Agregar la variable startTime aquí
let isGameOver = false; // Variable de control para verificar si el juego ha terminado

 const jokeContainer = document.getElementById("joke-container");
 const jokeInput = document.getElementById("joke-input");


// Elemento para el botón de mostrar/ocultar tabla
export let toggleTableButton = document.createElement("button");
toggleTableButton.textContent = "Mostrar Chistes";
toggleTableButton.classList.add("bg-blue-500", "text-white", "px-4", "py-2", "rounded", "hover:bg-blue-600");

// Añadir el selector y el botón al contenedor
controlContainer.appendChild(toggleTableButton); // Añadir el botón al lado

// Colocar el contenedor de control antes del contenedor de la tabla
jokeContainer.insertAdjacentElement('beforebegin', controlContainer); // Inserta el contenedor de control antes del contenedor de la tabla

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

// Al cargar chistes, asegúrate de que la tabla esté oculta
jokeContainer.style.display = "none"; // Inicialmente oculta el contenedor de chistes


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
jokeInput.style.display = "none"; // Ocultar el input inicialmente
submitJokeButton.style.display = "none"; // Ocultar el botón de enviar inicialmente

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
        totalPointsDisplay.style.color = 'white'; // Esto cambia el color del texto a blanco

        jokeContainer.appendChild(totalPointsDisplay); // Agregar el total de puntos antes de la tabla

        jokeContainer.appendChild(table);
        points = totalPoints;
        updatePointsDisplay();
    } catch (error) {
        console.error("Error al obtener los chistes:", error);
    }
}



// Función para obtener un chiste por ID

async function deleteJoke(jokeId) {
    try {
        await deleteDoc(doc(db, "jokes", jokeId)); // Elimina el documento del Firestore
        displayMessage("Chiste eliminado con éxito."); // Muestra un mensaje de éxito
    } catch (error) {
        console.error("Error al eliminar el chiste:", error);
        displayMessage("Error al eliminar el chiste."); // Muestra un mensaje de error
    }
}





// Exportar las funciones para su uso en otros archivos
export { getJokes, deleteJoke };
