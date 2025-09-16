import { db } from '@/nucleo/configuracao/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes' // Assumindo que este serviço busca as equipes

export const ServicoAcompanhamento = {
  /**
   * Busca o status de produção semanal (MDDA, Notificação, Sarampo) para todas as equipes
   * em uma semana epidemiológica específica.
   * @param {string} semanaKey - A chave da semana (ex: '2025-W36').
   * @returns {Promise<Array<object>>} Uma lista de equipes com seus respectivos status.
   */
  async buscarStatusProducaoSemanal(semanaKey) {
    if (!semanaKey) return []

    // 1. Buscar todas as equipes e os dados de produção em paralelo
    const [todasEquipes, docsMDDA, docsNotificacao, docsSarampo] = await Promise.all([
      servicoEquipes.buscarTodas(),
      getDocs(query(collection(db, 'producaoMDDA'), where('semanaKey', '==', semanaKey))),
      getDocs(
        query(collection(db, 'producaoNotificacaoSemanal'), where('semanaKey', '==', semanaKey)),
      ),
      getDocs(query(collection(db, 'producaoSarampo'), where('semanaKey', '==', semanaKey))),
    ])

    // 2. Criar um mapa para acesso rápido aos dados de produção
    const producaoEntregue = {
      mdda: new Set(docsMDDA.docs.map((doc) => doc.data().equipeId)),
      notificacaoSemanal: new Set(docsNotificacao.docs.map((doc) => doc.data().equipeId)),
      sarampo: new Set(docsSarampo.docs.map((doc) => doc.data().equipeId)),
    }

    // 3. Montar o resultado final
    const statusPorEquipe = todasEquipes.map((equipe) => {
      return {
        equipeId: equipe.id,
        equipeNome: equipe.nome,
        ubsNome: equipe.nomeUbs, // Supondo que o serviço de equipes anexe o nome da UBS
        statusModulos: {
          mdda: producaoEntregue.mdda.has(equipe.id) ? 'Entregue' : 'Pendente',
          notificacaoSemanal: producaoEntregue.notificacaoSemanal.has(equipe.id)
            ? 'Entregue'
            : 'Pendente',
          sarampo: producaoEntregue.sarampo.has(equipe.id) ? 'Entregue' : 'Pendente',
        },
      }
    })

    return statusPorEquipe.sort((a, b) => a.equipeNome.localeCompare(b.equipeNome))
  },
}
