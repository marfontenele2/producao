import { db } from '@/nucleo/configuracao/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Mapeia a chave do módulo para o nome da coleção no Firestore
const mapeamentoColecoes = {
  adolescente: 'producaoAdolescente',
  suplementos: 'producaoSuplementos',
  educacaoPermanente: 'producaoEducacaoPermanente',
  bpa: 'producaoBpa',
  gestantes: 'producaoGestantes',
  boletimTestesRapidos: 'boletimDados',
}

/**
 * Serviço para verificar a existência de produções salvas.
 */
export const servicoVerificacaoProducao = {
  /**
   * Verifica se uma produção mensal foi entregue.
   * @param {string} competencia - A competência no formato 'YYYY-MM'.
   * @param {string} equipeId - O ID da equipe.
   * @param {string} tipoProducao - A chave da produção (ex: 'adolescente', 'suplementos').
   * @returns {Promise<boolean>} Retorna true se a produção foi entregue, false caso contrário.
   */
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

      // Lógica especial: para gestantes e boletim, "entregue" significa "finalizado".
      // Para os outros, a simples existência do documento é suficiente.
      if (tipoProducao === 'gestantes' || tipoProducao === 'boletimTestesRapidos') {
        const dados = docSnap.data()
        // Acessa o campo 'finalizado' dentro do objeto 'registro' ou no topo do documento.
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
   * (Placeholder) Verifica se uma produção semanal foi entregue.
   * A lógica exata dependerá de como os dados semanais são armazenados.
   * @returns {Promise<boolean>}
   */
  async verificarEntregaSemanal(/* ...parametros da semana... */) {
    // TODO: Implementar a lógica de verificação para produções semanais
    return false
  },
}
