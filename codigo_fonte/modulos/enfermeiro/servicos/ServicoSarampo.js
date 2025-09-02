import { db } from '@/nucleo/configuracao/firebase'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const NOME_COLECAO = 'producaoSarampo'

export const ServicoSarampo = {
  /**
   * Salva os dados completos do formulário de Sarampo/Rubéola.
   * @param {string} semanaKey - A chave da semana (ex: '2025-36').
   * @param {string} equipeId - O ID da equipe do usuário.
   * @param {object} dadosFormulario - O objeto completo com o resumo e a lista de casos.
   * @param {string} usuarioId - O UID do usuário.
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
    // Usamos setDoc para garantir que o documento inteiro seja salvo, incluindo o resumo
    return setDoc(docRef, payload, { merge: true })
  },

  /**
   * Carrega os dados de Sarampo para uma equipe e semana.
   * @param {string} semanaKey - A chave da semana (ex: '2025-36').
   * @param {string} equipeId - O ID da equipe do usuário.
   * @returns {Promise<object|null>} O objeto completo com resumo e casos, ou nulo.
   */
  async carregarDados(semanaKey, equipeId) {
    const docId = `${semanaKey}_${equipeId}`
    const docRef = doc(db, NOME_COLECAO, docId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },

  /**
   * ADICIONADO: Calcula o total de casos notificados em semanas ANTERIORES no mesmo ano.
   * @param {number} ano - O ano para o cálculo.
   * @param {string} semanaKeyAtual - A semana atual, para buscar apenas registros anteriores.
   * @param {string} equipeId - O ID da equipe.
   * @returns {Promise<{acumuladoSarampo: number, acumuladoRubeola: number}>}
   */
  async calcularAcumuladosAnteriores(ano, semanaKeyAtual, equipeId) {
    const q = query(
      collection(db, NOME_COLECAO),
      where('equipeId', '==', equipeId),
      where('semanaKey', '>=', `${ano}-W01`),
      where('semanaKey', '<', semanaKeyAtual),
    )

    const querySnapshot = await getDocs(q)
    let acumuladoSarampo = 0
    let acumuladoRubeola = 0

    querySnapshot.forEach((doc) => {
      const dados = doc.data()
      if (dados.resumo) {
        acumuladoSarampo += dados.resumo.notificadosSarampoSemana || 0
        acumuladoRubeola += dados.resumo.notificadosRubeolaSemana || 0
      }
    })

    return { acumuladoSarampo, acumuladoRubeola }
  },
}
