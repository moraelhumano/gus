// pwa.js
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.getElementById("installButton");
    installButton.style.display = "block";
    installButton.addEventListener("click", () => {
        installButton.style.display = "none";
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            deferredPrompt = null;
        });
    });
});
