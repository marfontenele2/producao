import { db } from '@/nucleo/configuracao/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'

export const servicoRelatoriosBoletim = {
  async gerarRelatorioBase(competencia) {
    if (!competencia) return []

    const [dadosDeProducao, catalogoDeTestes, todasAsEquipes] = await Promise.all([
      getDocs(query(collection(db, 'boletimDados'), where('competencia', '==', competencia))),
      servicoTestes.buscarTodos(),
      servicoEquipes.buscarTodas(),
    ])

    if (dadosDeProducao.empty) return []

    const mapaDeTestes = new Map(catalogoDeTestes.map((t) => [t.id, t]))
    const mapaDeEquipes = new Map(todasAsEquipes.map((e) => [e.id, e]))
    const relatorioBase = []

    dadosDeProducao.forEach((doc) => {
      const dados = doc.data()
      const equipeInfo = mapaDeEquipes.get(dados.equipeId)
      if (!equipeInfo) return

      for (const testeId in dados.testes) {
        const testeInfo = mapaDeTestes.get(testeId)
        if (!testeInfo) continue

        for (const marcaId in dados.testes[testeId]) {
          const marcaInfo = testeInfo.marcas.find((m) => m.id === marcaId)
          if (!marcaInfo) continue

          const producaoDaMarca = dados.testes[testeId][marcaId]

          const totalInvalidos = producaoDaMarca.invalidos
            ? producaoDaMarca.invalidos.reduce((soma, item) => soma + item.quantidade, 0)
            : 0
          const totalPerdidos = producaoDaMarca.perdas
            ? producaoDaMarca.perdas.reduce((soma, item) => soma + item.quantidade, 0)
            : 0
          const realizadosDetalhado = producaoDaMarca.realizados || {}

          relatorioBase.push({
            id: `${doc.id}-${testeId}-${marcaId}`,
            ubsNome: equipeInfo.nomeUbs || 'N/A',
            equipeNome: equipeInfo.nome || 'N/A',
            testeNome: testeInfo.nome,
            marcaNome: marcaInfo.nome,
            // AQUI ESTÁ A ESTRUTURA CORRETA: 'realizados' é um objeto detalhado
            realizados: {
              mobilizacao: realizadosDetalhado.mobilizacao || 0,
              preNatal: realizadosDetalhado.preNatal || 0,
              rotina: realizadosDetalhado.rotina || 0,
              treinamentos: realizadosDetalhado.treinamentos || 0,
            },
            reagentes: producaoDaMarca.reagentes || 0,
            invalidos: totalInvalidos,
            perdidos: totalPerdidos,
            detalhesInvalidos: (producaoDaMarca.invalidos || []).map((d) => ({
              ...d,
              ubsNome: equipeInfo.nomeUbs,
              equipeNome: equipeInfo.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
            })),
            detalhesPerdas: (producaoDaMarca.perdas || []).map((d) => ({
              ...d,
              ubsNome: equipeInfo.nomeUbs,
              equipeNome: equipeInfo.nome,
              testeNome: testeInfo.nome,
              marcaNome: marcaInfo.nome,
            })),
          })
        }
      }
    })
    return relatorioBase
  },
}
