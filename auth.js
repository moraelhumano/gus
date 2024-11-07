// auth.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

export const auth = getAuth();
export let currentUser = null;

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        window.location.href = "game.html";
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
}

auth.onAuthStateChanged((user) => {
    currentUser = user;
});
