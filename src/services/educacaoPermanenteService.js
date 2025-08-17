// 📄 ARQUIVO ATUALIZADO: src/services/educacaoPermanenteService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "producaoEducacaoPermanente";

export const educacaoPermanenteService = {
  monitorarEducacaoPermanente(documentoId, callback) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    return onSnapshot(docRef, (docSnap) => {
      callback(
        docSnap.exists() ? docSnap.data() : { eventos: [], finalizado: false }
      );
    });
  },

  async salvarEducacaoPermanente(documentoId, dados, equipeId, ubsId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    const competencia = documentoId.split("_")[0];
    await setDoc(
      docRef,
      {
        ...dados,
        competencia,
        equipeId,
        ubsId,
        atualizadoEm: new Date(),
      },
      { merge: true }
    );
  },

  async finalizarCompetencia(documentoId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    await setDoc(
      docRef,
      {
        finalizado: true,
        finalizadoEm: new Date(),
      },
      { merge: true }
    );
  },

  /**
   * ✅ FUNÇÃO ADICIONADA: Busca os dados de uma competência específica uma única vez.
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   * @returns {Promise<object|null>}
   */
  async getDadosCompetencia(documentoId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
};
