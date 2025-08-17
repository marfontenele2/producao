// 📄 ARQUIVO: src/services/usuariosService.js (Corrigido)
import { db, functions } from "@/firebase"; // ✅ 'auth' foi removido desta linha
import { httpsCallable } from "firebase/functions";
import {
  doc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const userManager = httpsCallable(functions, "userManager");

export const usuariosService = {
  async criarNovoUsuario(userData) {
    return await userManager({ action: "createUser", payload: userData });
  },

  async updateUsuario(uid, userData) {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, userData);
  },

  async excluirUsuario(uid) {
    return await userManager({ action: "deleteUser", payload: { uid } });
  },

  monitorarUsuarios(callback) {
    const q = query(collection(db, "users"), orderBy("nome"));
    return onSnapshot(q, (querySnapshot) => {
      const usuarios = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(usuarios);
    });
  },
};
