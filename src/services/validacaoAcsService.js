// 📄 ARQUIVO REFEITO: src/services/validacaoAcsService.js
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

const COLECAO_PRODUCAO_CONSOLIDADA = "producaoAcs";
const COLECAO_PRODUCAO_INDIVIDUAL = "producaoIndividualAcs";

export const validacaoAcsService = {
  /**
   * Busca o documento de produção CONSOLIDADO de uma equipe.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @returns {Promise<object|null>} - O documento consolidado ou null.
   */
  async buscarProducaoConsolidada(competencia, equipeId) {
    const documentoId = `${competencia}_${equipeId}`;
    const docRef = doc(db, COLECAO_PRODUCAO_CONSOLIDADA, documentoId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || !docSnap.data().consolidado) {
      return null; // Só retorna se foi consolidado pelo enfermeiro
    }
    return { id: docSnap.id, ...docSnap.data() };
  },

  /**
   * Busca os detalhes das produções individuais com base nos IDs.
   * @param {Array<string>} idsProducoes - Array com os IDs dos documentos individuais.
   * @returns {Promise<Array<object>>} - A lista de produções individuais detalhadas.
   */
  async buscarProducoesIndividuaisPorIds(idsProducoes) {
    if (!idsProducoes || idsProducoes.length === 0) return [];
    const q = query(
      collection(db, COLECAO_PRODUCAO_INDIVIDUAL),
      where("__name__", "in", idsProducoes)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Salva a validação (status e observação) de um ACS específico.
   * @param {string} documentoConsolidadoId - O ID do documento consolidado (AAAA-MM_equipeId).
   * @param {string} acsId - O ID do ACS que está sendo validado.
   * @param {object} dadosValidacao - Objeto com { status, observacoes, validadoPor }.
   */
  async salvarValidacaoAcs(documentoConsolidadoId, acsId, dadosValidacao) {
    const docRef = doc(
      db,
      COLECAO_PRODUCAO_CONSOLIDADA,
      documentoConsolidadoId
    );
    const campoValidacao = `validacoes.${acsId}`; // Usa notação de ponto para atualizar um campo aninhado no mapa

    await updateDoc(docRef, {
      [campoValidacao]: {
        ...dadosValidacao,
        validadoEm: serverTimestamp(),
      },
    });
  },
};
