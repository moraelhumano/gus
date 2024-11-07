// firestore.js
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { currentUser } from "./auth.js";

export const db = getFirestore();

export async function saveJoke(jokeData) {
    try {
        await addDoc(collection(db, "jokes"), jokeData);
    } catch (error) {
        console.error("Error al guardar el chiste:", error);
    }
}

export async function getJokes() {
    try {
        const q = query(collection(db, "jokes"), where("userId", "==", currentUser.uid));
        return await getDocs(q);
    } catch (error) {
        console.error("Error al obtener los chistes:", error);
    }
}

export async function deleteJoke(jokeId) {
    try {
        await deleteDoc(doc(db, "jokes", jokeId));
    } catch (error) {
        console.error("Error al eliminar el chiste:", error);
    }
}
