// codigo_fonte/modulos/administrador/servicos/servicoLiberacoes.js

import { db } from '@/nucleo/configuracao/firebase'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore' // Adicionado getDoc

const NOME_COLECAO = 'boletimLiberacoes'

/**
 * Serviço para gerenciar quais testes/marcas estão liberados para cada competência.
 */
export const servicoLiberacoes = {
  /**
   * @JSDoc_NOVO
   * Busca os dados de liberação de uma competência específica uma única vez.
   * Ideal para telas de formulário onde não precisamos de atualizações em tempo real.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<object>} Os dados de liberação encontrados ou um objeto padrão.
   */
  async buscarLiberacoes(competencia) {
    if (!competencia) {
      return { testesLiberados: {} }
    }
    const docRef = doc(db, NOME_COLECAO, competencia)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : { testesLiberados: {} }
  },

  /**
   * Monitora as liberações de uma competência específica em tempo real.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {function(object): void} callback - Função que recebe os dados de liberação.
   * @returns {import("firebase/firestore").Unsubscribe}
   */
  monitorarLiberacoes(competencia, callback) {
    if (!competencia) {
      callback({ testesLiberados: {} })
      return () => {}
    }
    const docRef = doc(db, NOME_COLECAO, competencia)
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : { testesLiberados: {} })
    })
  },

  /**
   * Salva a configuração de testes liberados para uma competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {object} dadosLiberacao - O objeto com os testes e marcas liberados.
   * @returns {Promise<void>}
   */
  salvarLiberacoes(competencia, dadosLiberacao) {
    const docRef = doc(db, NOME_COLECAO, competencia)
    // Usamos merge: true para garantir que não sobrescrevemos campos não relacionados
    return setDoc(docRef, dadosLiberacao, { merge: true })
  },
}
