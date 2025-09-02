import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const NOME_COLECAO = 'competenciasFechadas'

export const servicoCompetencia = {
  /**
   * @JSDoc
   * Salva o snapshot de uma competência como 'fechada'.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {object} dadosConsolidados - O objeto do relatório a ser salvo.
   * @param {string} adminId - O UID do administrador que fechou a competência.
   * @returns {Promise<void>}
   */
  async fecharCompetencia(competencia, dadosConsolidados, adminId) {
    const docRef = doc(db, NOME_COLECAO, competencia)
    const payload = {
      dadosConsolidados,
      fechadaEm: serverTimestamp(),
      fechadaPor: adminId,
    }
    return setDoc(docRef, payload)
  },

  /**
   * @JSDoc
   * Busca os dados de uma competência que já foi fechada.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<object|null>} Os dados da competência ou nulo.
   */
  async buscarCompetenciaFechada(competencia) {
    const docRef = doc(db, NOME_COLECAO, competencia)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },
}
