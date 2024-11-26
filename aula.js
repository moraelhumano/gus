// Importar Firebase y funciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configura tu app de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDgFJNyUL2AxT6YatY84E1udDkMSz9DGGs",
    authDomain: "risapp-37bd9.firebaseapp.com",
    projectId: "risapp-37bd9",
    storageBucket: "risapp-37bd9.appspot.com",
    messagingSenderId: "909578481013",
    appId: "1:909578481013:web:541567a62b2c71f019773c",
    measurementId: "G-46EQJBZQ3T"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener y mostrar los topics y subtemas en una tabla
export async function cargarTopics() {
    const topicsTable = document.getElementById("topics-table");

    // Obtén los documentos de la colección "topics"
    const querySnapshot = await getDocs(collection(db, "topics"));

    // Mapea los documentos para generar filas de tabla con enlaces
    const rows = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const subtopics = Array.isArray(data.subtopics) ? data.subtopics.join(", ") : data.subtopics;
        const sessionId = doc.id; // ID único del documento

        // Cada fila tiene un enlace que redirige a sesion.html con el ID de la sesión en la URL
        return `
            <tr class="border-b">
                <td class="px-4 py-2">${data.sesion}</td>
                <td class="px-4 py-2">${data.topic}</td>
                <td class="px-4 py-2">${subtopics}</td>
                <td class="px-4 py-2 text-center">
                    <button 
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onclick="redirectToSession('${sessionId}')">
                        
                        Ver sesión
                    </button>
                </td>
            </tr>
        `;

    }).join("");

    // Generar encabezados y contenido de la tabla
    const tableContent = `
        <thead>
            <tr>
                <th class="px-4 py-2 text-left">Sesión</th>
                <th class="px-4 py-2 text-left">Tópico</th>
                <th class="px-4 py-2 text-left">Subtópicos</th>
                <th class="px-4 py-2 text-center">Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    `;

    // Insertar la tabla en el contenedor
    topicsTable.innerHTML = tableContent;
    console.log(sessionId)

}

// Función para redirigir a la página sesion.html
window.redirectToSession = function (sessionId) {
    // Redirige a sesion.html con el ID de la sesión como parámetro en la URL
    window.location.href = `sesion.html?sessionId=${sessionId}`;
};
