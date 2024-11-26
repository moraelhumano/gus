
document.addEventListener("DOMContentLoaded", () => {
    const themeButton = document.getElementById("theme-toggle");
    const body = document.body;
   
    // Leer estado inicial desde localStorage
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        body.classList.add("bg-gray-900", "text-white");
        themeButton.textContent = "☀️"; // Sol para modo oscuro
    } else {
        themeButton.textContent = "🌙"; // Luna para modo claro
    }
   
    // Añadir evento de clic para alternar modo
    themeButton.addEventListener("click", () => {
        const isNowDarkMode = body.classList.toggle("bg-gray-900");
        body.classList.toggle("text-white");
   
        // Cambiar el texto del botón
        themeButton.textContent = isNowDarkMode ? "☀️" : "🌙";
   
        // Guardar estado en localStorage
        localStorage.setItem("darkMode", isNowDarkMode);
    });
   });
   
   // Manejo de notificaciones en primer plano
   onMessage(messaging, (payload) => {
   console.log('Notificación recibida en primer plano:', payload);
   // Personaliza el despliegue de la notificación
   const { title, body } = payload.notification;
   new Notification(title, { body });
   });
   
   
   