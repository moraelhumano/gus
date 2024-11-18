// firestore.js
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const db = getFirestore();

export async function getJokes(userId) {
    try {
        const q = query(collection(db, "jokes"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
        console.error("Error al obtener los chistes:", error);
    }
}

export async function saveJoke(jokeData) {
    try {
        await addDoc(collection(db, "jokes"), jokeData);
    } catch (error) {
        console.error("Error al guardar el chiste:", error);
    }
}

export async function deleteJoke(jokeId) {
    try {
        await deleteDoc(doc(db, "jokes", jokeId));
    } catch (error) {
        console.error("Error al eliminar el chiste:", error);
    }
}
