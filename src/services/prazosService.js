// 📄 ARQUIVO: src/services/prazosService.js (Versão Final)
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const collectionName = "prazos";

export const prazosService = {
  /**
   * Salva ou atualiza os prazos de uma competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {object} prazosData - Objeto com os prazos dos módulos.
   */
  async salvarPrazosDoMes(competencia, prazosData) {
    const docRef = doc(db, collectionName, competencia);
    // Usamos setDoc com merge:false para substituir completamente os prazos do mês,
    // garantindo que módulos removidos não permaneçam no banco.
    await setDoc(docRef, prazosData);
  },

  /**
   * Monitora os prazos de uma competência em tempo real.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {function} callback - Função que será chamada com os dados.
   * @returns {function} - Função para parar de ouvir as atualizações.
   */
  monitorarPrazosDoMes(competencia, callback) {
    if (!competencia) {
      callback({});
      return () => {};
    }
    const docRef = doc(db, collectionName, competencia);
    return onSnapshot(docRef, (docSnapshot) => {
      callback(docSnapshot.exists() ? docSnapshot.data() : {});
    });
  },
};
