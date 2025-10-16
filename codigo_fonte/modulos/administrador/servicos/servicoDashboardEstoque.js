import { db } from '@/nucleo/configuracao/firebase'
import { collection, query, orderBy, where, getDocs, Timestamp } from 'firebase/firestore'
// ===================================================================
// == CORREÇÃO APLICADA AQUI
// ===================================================================
import { startOfDay, endOfDay, format, addDays } from 'date-fns'

const NOME_COLECAO_ESTOQUE = 'estoqueTestesRapidos'
const NOME_COLECAO_MOVIMENTACOES = 'movimentacoesEstoque'

const LIMITE_ESTOQUE_BAIXO = 50
const DIAS_ALERTA_VENCIMENTO = 60

export const servicoDashboardEstoque = {
  /**
   * Busca e processa todos os dados necessários para o dashboard de estoque.
   * @param {object} filtros - Objeto com { dataInicio, dataFim }.
   * @returns {Promise<object>} Um objeto contendo todos os dados para o dashboard.
   */
  async buscarDadosDashboard(filtros) {
    const { dataInicio, dataFim } = filtros

    const tsInicio = Timestamp.fromDate(startOfDay(new Date(dataInicio)))
    const tsFim = Timestamp.fromDate(endOfDay(new Date(dataFim)))

    const [estoqueSnapshot, movimentacoesSnapshot] = await Promise.all([
      getDocs(query(collection(db, NOME_COLECAO_ESTOQUE))),
      getDocs(
        query(
          collection(db, NOME_COLECAO_MOVIMENTACOES),
          where('realizadoEm', '>=', tsInicio),
          where('realizadoEm', '<=', tsFim),
          orderBy('realizadoEm', 'asc'),
        ),
      ),
    ])

    let totalEntradas = 0
    let totalSaidas = 0
    const consumoPorTeste = new Map()
    const fluxoDiario = new Map()

    movimentacoesSnapshot.forEach((doc) => {
      const mov = doc.data()
      if (mov.tipo === 'entrada') {
        totalEntradas += mov.quantidade
      }
      if (mov.tipo === 'saida') {
        totalSaidas += mov.quantidade
        const nomeTeste = mov.testeNome || 'Desconhecido'
        consumoPorTeste.set(nomeTeste, (consumoPorTeste.get(nomeTeste) || 0) + mov.quantidade)
      }

      const dia = format(mov.realizadoEm.toDate(), 'dd/MM')
      if (!fluxoDiario.has(dia)) {
        fluxoDiario.set(dia, { entradas: 0, saidas: 0 })
      }
      if (mov.tipo === 'entrada') fluxoDiario.get(dia).entradas += mov.quantidade
      if (mov.tipo === 'saida') fluxoDiario.get(dia).saidas += mov.quantidade
    })

    let lotesEstoqueBaixo = 0
    let lotesVencimentoProximo = 0
    const dataAlertaVencimento = addDays(new Date(), DIAS_ALERTA_VENCIMENTO)

    const estoqueAtual = estoqueSnapshot.docs.map((doc) => {
      const lote = { id: doc.id, ...doc.data() }
      if (lote.quantidadeAtual < LIMITE_ESTOQUE_BAIXO) lotesEstoqueBaixo++
      // Garante que a data de validade existe antes de comparar
      if (lote.dataValidade && new Date(lote.dataValidade) <= dataAlertaVencimento) {
        lotesVencimentoProximo++
      }
      return lote
    })

    return {
      kpis: {
        totalEntradas,
        totalSaidas,
        estoqueBaixo: lotesEstoqueBaixo,
        vencimentoProximo: lotesVencimentoProximo,
      },
      graficoConsumo: Array.from(consumoPorTeste.entries()).map(([nome, valor]) => ({
        nome,
        valor,
      })),
      graficoFluxo: Array.from(fluxoDiario.entries()).map(([dia, valores]) => ({
        dia,
        ...valores,
      })),
      tabelaEstoque: estoqueAtual,
    }
  },
}
