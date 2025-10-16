import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const NOME_COLECAO = 'cronogramas'

/**
 * Gera o ID do documento de cronograma com base na competência e equipe.
 * @param {string} competencia - Formato 'AAAA-MM'
 * @param {string} equipeId
 * @returns {string} ID no formato 'AAAA-MM_equipeId'
 */
const gerarDocId = (competencia, equipeId) => `${competencia}_${equipeId}`

export const servicoCronograma = {
  /**
   * Busca o cronograma de uma equipe para uma competência específica.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @returns {Promise<Array<object>>} Uma promessa que resolve para a lista de eventos.
   */
  async buscarCronograma(competencia, equipeId) {
    if (!competencia || !equipeId) return []

    const docId = gerarDocId(competencia, equipeId)
    const docRef = doc(db, NOME_COLECAO, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data().eventos || []
    }

    return [] // Retorna um array vazio se não houver cronograma
  },

  /**
   * Salva (sobrescreve) a lista completa de eventos para uma competência e equipe.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @param {Array<object>} eventos - A lista completa de objetos de evento a ser salva.
   * @returns {Promise<void>}
   */
  async salvarCronograma(competencia, equipeId, eventos) {
    if (!competencia || !equipeId || !eventos) {
      throw new Error('Dados insuficientes para salvar o cronograma.')
    }

    const docId = gerarDocId(competencia, equipeId)
    const docRef = doc(db, NOME_COLECAO, docId)

    return setDoc(docRef, {
      competencia,
      equipeId,
      eventos: eventos,
      ultimaAtualizacao: new Date(),
    })
  },
}
