// 📄 ARQUIVO GERADO: src/services/suplementosService.js
import { db } from "@/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

const COLLECTION_NAME = "producaoSuplementos";

export const suplementosService = {
  /**
   * Monitora os dados de um formulário de suplementos em tempo real.
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   * @param {function} callback - Função para receber os dados ou um estado inicial vazio.
   * @returns {function} - Função para parar de ouvir (unsubscribe).
   */
  monitorarDados(documentoId, callback) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        // Retorna uma estrutura vazia e bem definida se o documento não existir
        callback({
          criancas: { xaropeSulfatoFerroso: {} },
          gestantes: {
            xaropeSulfatoFerroso: {},
            comprimidoSulfatoFerroso: {},
            comprimidoAcidoFolico: {},
          },
          puerperas: {
            xaropeSulfatoFerroso: {},
            comprimidoSulfatoFerroso: {},
          },
          perdas: {
            xaropeSulfatoFerroso: {},
            comprimidoSulfatoFerroso: {},
            comprimidoAcidoFolico: {},
          },
          finalizado: false,
        });
      }
    });
  },

  /**
   * Salva os dados do formulário de suplementos.
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   * @param {object} dados - O objeto completo com os dados do formulário.
   * @param {string} equipeId - ID da equipe.
   * @param {string} ubsId - ID da UBS.
   */
  async salvarDados(documentoId, dados, equipeId, ubsId) {
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

  /**
   * Marca o formulário de uma competência como finalizado.
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   */
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
   * Busca os dados de uma competência específica uma única vez (para impressão).
   * @param {string} documentoId - ID no formato 'AAAA-MM_equipeId'.
   * @returns {Promise<object|null>}
   */
  async getDadosCompetencia(documentoId) {
    const docRef = doc(db, COLLECTION_NAME, documentoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
};
