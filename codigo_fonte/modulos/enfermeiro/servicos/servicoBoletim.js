import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const NOME_COLECAO = 'boletimDados'

const criarIdDocumento = (competencia, equipeId) => `${competencia}_${equipeId}`

export const servicoBoletim = {
  /**
   * Busca os dados do boletim para uma competência e equipe.
   * @returns {Promise<object|null>}
   */
  async buscarDados(competencia, equipeId) {
    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },

  /**
   * Salva os dados do boletim.
   * @param {object} dadosBoletim - O objeto completo com os dados do boletim.
   */
  async salvarDados(competencia, equipeId, ubsId, usuarioId, dadosBoletim) {
    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const payload = {
      ...dadosBoletim,
      competencia,
      equipeId,
      ubsId,
      responsavelId: usuarioId,
      modificadoEm: serverTimestamp(),
    }
    return setDoc(docRef, payload, { merge: true })
  },
}
