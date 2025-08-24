import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Cria um objeto de dados inicial para o formulário de suplementos.
 * @returns {object} O objeto de dados zerado.
 */
const criarModeloDeDadosInicial = () => ({
  criancas: {
    xaropeFerroso: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
  },
  gestantes: {
    xaropeFerroso: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
    comprimidoFerroso: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
    acidoFolico: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
  },
  posParto: {
    xaropeFerroso: { entrega1: 0, entrega2: 0, entrega3: 0 },
    comprimidoFerroso: { entrega1: 0, entrega2: 0, entrega3: 0 },
  },
  perdas: {
    xaropeFerroso: { vencimento: 0, extravio: 0, danificado: 0, outros: 0 },
    comprimidoFerroso: { vencimento: 0, extravio: 0, danificado: 0, outros: 0 },
    acidoFolico: { vencimento: 0, extravio: 0, danificado: 0, outros: 0 },
  },
  metadata: {
    criadoEm: null,
    modificadoEm: null,
    responsavelId: null,
  },
})

export const servicoSuplementos = {
  /**
   * Busca os dados de produção de suplementos para uma dada competência e equipe.
   * @param {string} competencia - A competência no formato 'YYYY-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @returns {Promise<object>} Os dados encontrados ou um modelo de dados inicial.
   */
  async buscarDados(competencia, equipeId) {
    if (!competencia || !equipeId) {
      throw new Error('Competência e ID da Equipe são obrigatórios.')
    }
    const docRef = doc(db, 'producaoSuplementos', `${competencia}_${equipeId}`)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return criarModeloDeDadosInicial()
    }
  },

  /**
   * Salva os dados de produção de suplementos.
   * @param {string} competencia - A competência no formato 'YYYY-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @param {string} usuarioId - O ID do usuário responsável.
   * @param {object} dados - O objeto com os dados do formulário.
   * @returns {Promise<void>}
   */
  async salvarDados(competencia, equipeId, usuarioId, dados) {
    if (!competencia || !equipeId || !usuarioId || !dados) {
      throw new Error('Todos os parâmetros são obrigatórios para salvar.')
    }
    const docRef = doc(db, 'producaoSuplementos', `${competencia}_${equipeId}`)
    const docSnap = await getDoc(docRef)

    const dadosParaSalvar = { ...dados }

    if (!docSnap.exists()) {
      dadosParaSalvar.metadata.criadoEm = serverTimestamp()
    }
    dadosParaSalvar.metadata.modificadoEm = serverTimestamp()
    dadosParaSalvar.metadata.responsavelId = usuarioId

    return setDoc(docRef, dadosParaSalvar, { merge: true })
  },
}
