// 📄 ARQUIVO: src/services/ubsService.js (Versão Corrigida)
import { db } from "@/firebase"; // A importação de 'functions' foi removida em passos anteriores
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// ✅ CORREÇÃO: O nome da constante exportada estava incorreto.
// Estava como 'equipesService' por engano. Agora está 'ubsService'.
export const ubsService = {
  monitorarUbs(callback) {
    const q = query(collection(db, "ubs"), orderBy("nome"));
    return onSnapshot(q, (querySnapshot) => {
      const ubsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(ubsList);
    });
  },

  async adicionarUbs(ubsData) {
    await addDoc(collection(db, "ubs"), ubsData);
  },

  async atualizarUbs(ubsId, ubsData) {
    const ubsDocRef = doc(db, "ubs", ubsId);
    await updateDoc(ubsDocRef, ubsData);
  },

  async excluirUbs(ubsId) {
    const ubsDocRef = doc(db, "ubs", ubsId);
    await deleteDoc(ubsDocRef);
  },
};
