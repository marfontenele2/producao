import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const NOME_COLECAO = 'producaoEducacaoPermanente'

const criarIdDocumento = (competencia, equipeId) => `${competencia}_${equipeId}`

export const servicoEducacaoPermanente = {
  /**
   * Busca a lista de registros de Educação Permanente para uma competência e equipe.
   * @returns {Promise<Array<object>>} A lista de registros ou um array vazio.
   */
  async buscarDados(competencia, equipeId) {
    if (!competencia || !equipeId) return [] // Garante que nunca retorne nulo
    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const docSnap = await getDoc(docRef)
    // [CORRIGIDO] Retorna a propriedade 'registros' ou um array vazio se não existir
    return docSnap.exists() ? docSnap.data().registros : []
  },

  /**
   * Salva a lista de registros de Educação Permanente.
   * @param {Array<object>} registros - O array com os dados das atividades.
   */
  async salvarDados(competencia, equipeId, usuarioId, registros) {
    if (!competencia || !equipeId || !usuarioId) {
      throw new Error('Parâmetros inválidos para salvar dados de Educação Permanente.')
    }
    const docRef = doc(db, NOME_COLECAO, criarIdDocumento(competencia, equipeId))
    const payload = {
      registros,
      metadata: {
        modificadoEm: serverTimestamp(),
        responsavelId: usuarioId,
        equipeId: equipeId,
        competencia: competencia,
      },
    }
    return setDoc(docRef, payload)
  },
}
