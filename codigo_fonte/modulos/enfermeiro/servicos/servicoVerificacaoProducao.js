import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc } from 'firebase/firestore'

const mapeamentoColecoes = {
  // Mensal
  adolescente: 'producaoAdolescente',
  suplementos: 'producaoSuplementos',
  educacaoPermanente: 'producaoEducacaoPermanente',
  bpa: 'producaoBpa',
  gestantes: 'producaoGestantes',
  boletimTestesRapidos: 'boletimDados',
  scnes: 'scnes',
  saudeMental: 'saudeMental',
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
      // Para a maioria dos módulos, o ID do documento é uma combinação da competência e da equipe
      let idDoDocumento = `${competencia}_${equipeId}`

      // Exceções: Saúde Mental usa apenas o ID da equipe como chave do documento
      if (tipoProducao === 'saudeMental') {
        idDoDocumento = equipeId
      }

      const docRef = doc(db, colecao, idDoDocumento)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return false
      }

      const dados = docSnap.data()

      // ===================================================================
      // === CORREÇÃO ESTÁ AQUI: Variáveis com nomes inválidos foram corrigidas
      // ===================================================================
      // Lógica específica para determinar se a produção foi "entregue"
      if (tipoProducao === 'scnes') {
        // A lógica de verificação do SCNES foi mantida, mas com nomes de variáveis corrigidos.
        const idDocumentoScnes = `${competencia}_${equipeId}`
        const docRefScnes = doc(db, colecao, idDocumentoScnes)
        const docSnapScnes = await getDoc(docRefScnes)
        if (!docSnapScnes.exists()) return false
        const dadosScnes = docSnapScnes.data()
        return dadosScnes.profissionais && dadosScnes.profissionais.length > 0
      }
      // ===================================================================

      if (tipoProducao === 'saudeMental') {
        return (
          dados.acompanhamentos &&
          dados.acompanhamentos[competencia] &&
          Object.keys(dados.acompanhamentos[competencia]).length > 0
        )
      }

      if (tipoProducao === 'gestantes' || tipoProducao === 'boletimTestesRapidos') {
        const registro = dados.registro || dados
        return registro?.finalizado === true
      }

      return docSnap.exists()
    } catch (error) {
      console.error(`Erro ao verificar entrega para ${tipoProducao}:`, error)
      return false
    }
  },

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
      return docSnap.exists()
    } catch (error) {
      console.error(`Erro ao verificar entrega semanal para ${tipoProducao}:`, error)
      return false
    }
  },
}
