import { db } from '@/nucleo/configuracao/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

const NOME_COLECAO = 'producaoMDDA'

export const ServicoMDDA = {
  /**
   * Salva os dados do formulário MDDA para uma equipe e semana específicas.
   * @param {string} semanaKey - A chave da semana (ex: '2025-36').
   * @param {string} equipeId - O ID da equipe do usuário.
   * @param {object} dadosFormulario - O objeto contendo os dados do formulário a serem salvos.
   * @param {string} usuarioId - O UID do usuário que está salvando.
   * @returns {Promise<void>}
   */
  async salvarDados(semanaKey, equipeId, dadosFormulario, usuarioId) {
    const docId = `${semanaKey}_${equipeId}`
    const docRef = doc(db, NOME_COLECAO, docId)
    const payload = {
      ...dadosFormulario,
      semanaKey,
      equipeId,
      salvoPor: usuarioId,
      salvoEm: serverTimestamp(),
    }
    return setDoc(docRef, payload, { merge: true })
  },

  /**
   * Carrega os dados do MDDA para uma equipe e semana específicas.
   * @param {string} semanaKey - A chave da semana (ex: '2025-36').
   * @param {string} equipeId - O ID da equipe do usuário.
   * @returns {Promise<object|null>} Os dados salvos ou nulo se não houver.
   */
  async carregarDados(semanaKey, equipeId) {
    const docId = `${semanaKey}_${equipeId}`
    const docRef = doc(db, NOME_COLECAO, docId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },
}
