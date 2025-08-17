// ARQUIVO CORRIGIDO: src/services/boletimAdminService.js
import { db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const collectionName = "boletimLiberacoes";

export const boletimAdminService = {
  /**
   * Busca os dados de liberação de um mês/competência uma única vez.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<object|null>} - Os dados da liberação ou null.
   */
  async getLiberacao(competencia) {
    if (!competencia) return null;
    const docRef = doc(db, collectionName, competencia);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  /**
   * Salva ou atualiza os dados de liberação para uma competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {object} dadosLiberacao - Objeto contendo { testesLiberados }.
   */
  async salvarLiberacao(competencia, dadosLiberacao) {
    const docRef = doc(db, collectionName, competencia);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        testesLiberados: dadosLiberacao.testesLiberados,
        atualizadoEm: new Date(),
      });
    } else {
      await setDoc(docRef, {
        testesLiberados: dadosLiberacao.testesLiberados,
        atualizadoEm: new Date(),
      });
    }
  },
};
