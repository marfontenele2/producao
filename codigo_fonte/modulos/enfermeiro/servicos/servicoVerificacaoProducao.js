import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc } from 'firebase/firestore'

// MODIFICADO: Mapeamento agora inclui coleções mensais e semanais
const mapeamentoColecoes = {
  // Mensal
  adolescente: 'producaoAdolescente',
  suplementos: 'producaoSuplementos',
  educacaoPermanente: 'producaoEducacaoPermanente',
  bpa: 'producaoBpa',
  gestantes: 'producaoGestantes',
  boletimTestesRapidos: 'boletimDados',
  // Semanal
  mdda: 'producaoMDDA',
  notificacaoSemanal: 'producaoNotificacaoSemanal',
  sarampo: 'producaoSarampo',
}

export const servicoVerificacaoProducao = {
  async verificarEntregaMensal(competencia, equipeId, tipoProducao) {
    const colecao = mapeamentoColecoes[tipoProducao]
    if (!colecao || !competencia || !equipeId) {
      return false
    }
    try {
      const docId = `${competencia}_${equipeId}`
      const docRef = doc(db, colecao, docId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return false
      }
      if (tipoProducao === 'gestantes' || tipoProducao === 'boletimTestesRapidos') {
        const dados = docSnap.data()
        const registro = dados.registro || dados
        return registro?.finalizado === true
      }
      return docSnap.exists()
    } catch (error) {
      console.error(`Erro ao verificar entrega para ${tipoProducao}:`, error)
      return false
    }
  },

  // ===================================================================
  // === FUNÇÃO IMPLEMENTADA ===
  // ===================================================================
  /**
   * Verifica se uma produção semanal foi entregue.
   * @param {string} semanaKey - A chave da semana (ex: '2025-36').
   * @param {string} equipeId - O ID da equipe.
   * @param {string} tipoProducao - A chave da produção (ex: 'mdda').
   * @returns {Promise<boolean>} Retorna true se a produção foi entregue.
   */
  async verificarEntregaSemanal(semanaKey, equipeId, tipoProducao) {
    const colecao = mapeamentoColecoes[tipoProducao]
    if (!colecao || !semanaKey || !equipeId) {
      return false
    }
    try {
      const docId = `${semanaKey}_${equipeId}`
      const docRef = doc(db, colecao, docId)
      const docSnap = await getDoc(docRef)
      // Para os módulos semanais, a simples existência do documento confirma a entrega.
      return docSnap.exists()
    } catch (error) {
      console.error(`Erro ao verificar entrega semanal para ${tipoProducao}:`, error)
      return false
    }
  },
}
