// auth.js
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

const auth = getAuth();

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
    }
}

export async function logout() {
    await signOut(auth);
}

export function onAuthStateChanged(callback) {
    auth.onAuthStateChanged(callback);
}
