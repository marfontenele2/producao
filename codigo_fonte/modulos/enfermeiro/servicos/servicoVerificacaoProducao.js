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
  cronograma: 'cronogramas', // <-- ADICIONADO CRONOGRAMA
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
      let idDoDocumento = `${competencia}_${equipeId}`

      if (tipoProducao === 'saudeMental') {
        idDoDocumento = equipeId
      }

      const docRef = doc(db, colecao, idDoDocumento)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return false
      }

      const dados = docSnap.data()

      // <-- NOVA LÓGICA PARA CRONOGRAMA ADICIONADA AQUI
      if (tipoProducao === 'cronograma') {
        return dados.eventos && dados.eventos.length > 0
      }

      if (tipoProducao === 'scnes') {
        const dadosScnes = docSnap.data()
        return dadosScnes.profissionais && dadosScnes.profissionais.length > 0
      }

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
