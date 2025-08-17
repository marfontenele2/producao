// 📄 ARQUIVO: src/services/equipesService.js (Versão Corrigida)
import { db } from "@/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  getDocs, // <-- Importação necessária
} from "firebase/firestore";

export const equipesService = {
  monitorarEquipes(callback) {
    const q = query(collection(db, "equipes"), orderBy("nome"));
    return onSnapshot(q, (querySnapshot) => {
      const equipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(equipes);
    });
  },

  async adicionarEquipe(equipeData) {
    await addDoc(collection(db, "equipes"), equipeData);
  },

  async atualizarEquipe(equipeId, equipeData) {
    const equipeDocRef = doc(db, "equipes", equipeId);
    await updateDoc(equipeDocRef, equipeData);
  },

  async excluirEquipe(equipeId) {
    const equipeDocRef = doc(db, "equipes", equipeId);
    await deleteDoc(equipeDocRef);
  },

  /**
   * ✅ FUNÇÃO ADICIONADA DE VOLTA
   * Busca todas as equipes associadas a uma UBS uma única vez.
   * @param {string} ubsId - O ID da UBS.
   * @returns {Promise<Array<object>>} - A lista de equipes.
   */
  async getEquipesByUbs(ubsId) {
    if (!ubsId) return [];
    try {
      const q = query(
        collection(db, "equipes"),
        where("ubsId", "==", ubsId),
        orderBy("nome")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar equipes por UBS:", error);
      return [];
    }
  },
};
