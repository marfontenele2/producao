import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const NOME_COLECAO = 'producaoGestantes'

/**
 * Cria um ID de documento único baseado na competência e na equipe.
 * @param {string} competencia - A competência no formato 'AAAA-MM'.
 * @param {string} equipeId - O ID da equipe.
 * @returns {string} O ID do documento.
 */
const criarIdDocumento = (competencia, equipeId) => `${competencia}_${equipeId}`

export const servicoAcompanhamentoGestantes = {
  /**
   * Busca os dados consolidados de gestantes para uma competência e equipe.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @returns {Promise<object|null>} Os dados do registro ou null se não existir.
   */
  async buscarDados(competencia, equipeId) {
    if (!competencia || !equipeId) return null
    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data().registro : null
  },

  /**
   * Salva os dados do formulário de acompanhamento de gestantes.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @param {string} usuarioId - O ID do usuário responsável.
   * @param {object} registro - O objeto com os dados do formulário (incluindo o status 'finalizado').
   * @returns {Promise<void>}
   */
  async salvarDados(competencia, equipeId, usuarioId, registro) {
    if (!competencia || !equipeId || !usuarioId || !registro) {
      throw new Error('Parâmetros inválidos para salvar dados de gestantes.')
    }

    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const payload = {
      registro,
      metadata: {
        modificadoEm: serverTimestamp(),
        responsavelId: usuarioId,
        equipeId: equipeId,
        competencia: competencia,
      },
    }
    // Usamos { merge: true } para não sobrescrever os metadados ao salvar um rascunho
    return setDoc(docRef, payload, { merge: true })
  },
}
