// 📄 ARQUIVO GERADO: src/services/prazosSemanaisService.js
import { db } from "@/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const COLLECTION_NAME = "prazosSemanais";
const DOCUMENT_ID = "config"; // Usaremos um único documento para as configurações semanais

export const prazosSemanaisService = {
  /**
   * Monitora as configurações de prazos semanais.
   * @param {function} callback - Função que será chamada com os dados.
   * @returns {function} - Função para parar de ouvir as atualizações (unsubscribe).
   */
  monitorarPrazos(callback) {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : {});
    });
  },

  /**
   * Salva a configuração de prazos semanais.
   * @param {object} prazosData - Objeto contendo os prazos para os módulos semanais.
   * Ex: { mdda: { abertura: 1, fechamento: 3 }, ... }
   */
  async salvarPrazos(prazosData) {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    await setDoc(docRef, prazosData, { merge: true });
  },
};
