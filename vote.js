// Elemento del DOM para la nueva pantalla
const allJokesContainer = document.getElementById("all-jokes-container");
const allJokesList = document.getElementById("all-jokes-list");

// Función para obtener y mostrar los chistes de otros usuarios
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

// Llama a getAllJokes en el flujo de tu aplicación
// Por ejemplo, puedes llamarlo después de que el usuario inicie sesión o cuando se haga clic en un botón
loginButton.addEventListener("click", async () => {
    await loginWithGoogle();
    await getAllJokes(); // Cargar chistes de otros usuarios al iniciar sesión
});

// También puedes agregar un botón en tu HTML para cargar los chistes de otros usuarios
