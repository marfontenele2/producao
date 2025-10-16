import { db } from '@/nucleo/configuracao/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { servicoUbs } from '@/nucleo/servicos_comuns/servicoUbs'

export const servicoDashboards = {
  /**
   * Gera um relatório de consumo de testes agregado por UBS para o dashboard.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array<object>>} Dados de consumo agrupados por UBS.
   */
  async gerarConsumoTestesPorUBS(competencia) {
    if (!competencia) return []

    // 1. Busca todos os dados necessários em paralelo
    const [dadosDeProducao, catalogoDeTestes, todasAsEquipes, todasAsUbs] = await Promise.all([
      getDocs(query(collection(db, 'boletimDados'), where('competencia', '==', competencia))),
      servicoTestes.buscarTodos(),
      servicoEquipes.buscarTodas(),
      servicoUbs.buscarTodas(),
    ])

    // 2. Se não há produção, retorna a lista de UBS com valores zerados
    if (dadosDeProducao.empty) {
      return todasAsUbs.map((ubs) => ({
        id: ubs.id,
        nome: ubs.nome,
        totalRealizados: 0,
        totalReagentes: 0,
        totalPerdidos: 0,
        totalInvalidos: 0,
        detalhesPorTeste: [],
      }))
    }

    // 3. Cria mapas para buscas rápidas
    const mapaDeTestes = new Map(catalogoDeTestes.map((t) => [t.id, t]))
    const mapaDeEquipes = new Map(todasAsEquipes.map((e) => [e.id, e]))
    const mapaUbs = new Map()

    todasAsUbs.forEach((ubs) => {
      mapaUbs.set(ubs.id, {
        id: ubs.id,
        nome: ubs.nome,
        totalRealizados: 0,
        totalReagentes: 0,
        totalPerdidos: 0,
        totalInvalidos: 0,
        detalhesPorTeste: new Map(),
      })
    })

    // 4. Processa e agrega os dados de produção
    dadosDeProducao.forEach((doc) => {
      const dados = doc.data()
      const equipeInfo = mapaDeEquipes.get(dados.equipeId)
      if (!equipeInfo || !equipeInfo.ubsId) return

      const ubsReport = mapaUbs.get(equipeInfo.ubsId)
      if (!ubsReport) return

      for (const testeId in dados.testes) {
        const testeInfo = mapaDeTestes.get(testeId)
        if (!testeInfo) continue

        for (const marcaId in dados.testes[testeId]) {
          const producaoDaMarca = dados.testes[testeId][marcaId]
          const totalRealizados = producaoDaMarca.realizados
            ? Object.values(producaoDaMarca.realizados).reduce((soma, v) => soma + v, 0)
            : 0

          ubsReport.totalRealizados += totalRealizados
          ubsReport.totalReagentes += producaoDaMarca.reagentes || 0
          ubsReport.totalInvalidos += (producaoDaMarca.invalidos || []).reduce(
            (s, i) => s + i.quantidade,
            0,
          )
          ubsReport.totalPerdidos += (producaoDaMarca.perdas || []).reduce(
            (s, p) => s + p.quantidade,
            0,
          )

          const testeMap = ubsReport.detalhesPorTeste
          if (!testeMap.has(testeInfo.nome)) {
            testeMap.set(testeInfo.nome, { nome: testeInfo.nome, realizados: 0 })
          }
          testeMap.get(testeInfo.nome).realizados += totalRealizados
        }
      }
    })

    // 5. Formata o resultado final
    const resultado = Array.from(mapaUbs.values())
    resultado.forEach((ubs) => {
      ubs.detalhesPorTeste = Array.from(ubs.detalhesPorTeste.values())
    })

    return resultado
  },
}
