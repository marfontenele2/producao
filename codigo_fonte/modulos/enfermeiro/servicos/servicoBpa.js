import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const NOME_COLECAO = 'producaoBpa'

export const servicoBpa = {
  async buscarDados(competencia, equipeId) {
    if (!competencia || !equipeId) return []
    const docRef = doc(db, NOME_COLECAO, `${competencia}_${equipeId}`)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data().registros : []
  },
  async salvarDados(competencia, equipeId, usuarioId, registros) {
    if (!competencia || !equipeId || !usuarioId) throw new Error('Parâmetros inválidos.')

    const docRef = doc(db, NOME_COLECAO, `${competencia}_${equipeId}`)
    const docPayload = {
      registros,
      metadata: {
        modificadoEm: serverTimestamp(),
        responsavelId: usuarioId,
        equipeId: equipeId,
        competencia: competencia,
      },
    }
    return setDoc(docRef, docPayload, { merge: true })
  },
}
