// ui.js
export function displayUserInfo(currentUser) {
    const userInfo = document.createElement("div");
    userInfo.innerHTML = `
        <img src="${currentUser.photoURL}" alt="Foto de perfil" />
        <button id="logout-button">Cerrar Sesión</button>
    `;
    document.getElementById("user-info-container").appendChild(userInfo);
}

export function updatePointsDisplay(pointsDisplay, points) {
    pointsDisplay.innerText = `Puntos Totales: ${points}`;
}
