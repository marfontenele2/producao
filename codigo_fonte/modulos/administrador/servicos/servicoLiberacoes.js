import { db } from '@/nucleo/configuracao/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

const NOME_COLECAO = 'boletimLiberacoes'

/**
 * Serviço para gerenciar quais testes/marcas estão liberados para cada competência.
 */
export const servicoLiberacoes = {
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
    return setDoc(docRef, {
      ...dadosLiberacao,
      atualizadoEm: new Date(),
    })
  },
}
