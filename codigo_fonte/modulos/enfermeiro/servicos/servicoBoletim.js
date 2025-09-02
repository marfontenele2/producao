import { db } from '@/nucleo/configuracao/firebase'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const NOME_COLECAO = 'boletimDados'

const criarIdDocumento = (competencia, equipeId) => `${competencia}_${equipeId}`

export const servicoBoletim = {
  async buscarDados(competencia, equipeId) {
    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },

  /**
   * @JSDoc
   * [NOVA FUNÇÃO] Busca todos os boletins de uma determinada competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array<object>>} Uma lista com os dados dos boletins.
   */
  async buscarTodosOsBoletinsDaCompetencia(competencia) {
    const q = query(collection(db, NOME_COLECAO), where('competencia', '==', competencia))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return []
    }
    return querySnapshot.docs.map((doc) => doc.data())
  },

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
