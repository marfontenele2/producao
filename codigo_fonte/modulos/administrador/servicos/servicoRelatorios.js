import { db } from '@/nucleo/configuracao/firebase'
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { servicoCompetencia } from './servicoCompetencia'
import { servicoTestes } from './servicoTestes'

// --- FUNÇÕES AUXILIARES PARA CÁLCULO ---
const paraCaixas = (totalUnidades, unidadesPorCaixa) => {
  if (!unidadesPorCaixa || unidadesPorCaixa <= 0) return 0
  return Math.ceil(totalUnidades / unidadesPorCaixa) // Arredonda para cima para consumo/ajustes
}

const paraCaixasSaldo = (totalUnidades, unidadesPorCaixa) => {
  if (!unidadesPorCaixa || unidadesPorCaixa <= 0) return 0
  return Math.floor(totalUnidades / unidadesPorCaixa) // Arredonda para baixo para saldo
}
// -----------------------------------------

export const servicoRelatorios = {
  /**
   * @JSDoc
   * Busca os dados brutos de múltiplas coleções para uma dada competência.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<object>} Objeto com os dados brutos.
   */
  async buscarDadosBrutos(competencia) {
    const [ano, mes] = competencia.split('-').map(Number)
    const inicioMes = Timestamp.fromDate(new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0)))
    const fimMes = Timestamp.fromDate(new Date(Date.UTC(ano, mes, 0, 23, 59, 59)))

    const qEntradas = query(
      collection(db, 'estoqueTestesRapidos'),
      where('criadoEm', '>=', inicioMes),
      where('criadoEm', '<=', fimMes),
    )
    const qMovimentacoes = query(
      collection(db, 'movimentacoesEstoque'),
      where('realizadoEm', '>=', inicioMes),
      where('realizadoEm', '<=', fimMes),
    )
    const qAjustes = query(
      collection(db, 'ajustesEstoque'),
      where('realizadoEm', '>=', inicioMes),
      where('realizadoEm', '<=', fimMes),
    )

    const [entradasDocs, movimentacoesDocs, ajustesDocs] = await Promise.all([
      getDocs(qEntradas),
      getDocs(qMovimentacoes),
      getDocs(qAjustes),
    ])

    return {
      entradas: entradasDocs.docs.map((doc) => doc.data()),
      movimentacoes: movimentacoesDocs.docs.map((doc) => doc.data()),
      ajustes: ajustesDocs.docs.map((doc) => doc.data()),
    }
  },

  /**
   * @JSDoc
   * Orquestra a busca e o processamento de dados para gerar o relatório consolidado.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @returns {Promise<Array<object>>} O array de dados processados para o relatório.
   */
  async gerarRelatorioConsolidado(competencia) {
    if (!competencia) throw new Error('A competência é obrigatória.')

    // 1. BUSCAR TODOS OS DADOS NECESSÁRIOS EM PARALELO
    const [ano, mes] = competencia.split('-').map(Number)
    const mesAnterior = new Date(ano, parseInt(mes, 10) - 2, 15)
    const competenciaAnterior = `${mesAnterior.getFullYear()}-${String(
      mesAnterior.getMonth() + 1,
    ).padStart(2, '0')}`

    const [dadosBrutos, catalogo, dadosCompetenciaAnterior] = await Promise.all([
      this.buscarDadosBrutos(competencia),
      servicoTestes.buscarTodos(),
      servicoCompetencia.buscarCompetenciaFechada(competenciaAnterior),
    ])

    const dadosProcessados = {}

    // 2. INICIALIZAR ESTRUTURA COM BASE NO CATÁLOGO
    catalogo.forEach((teste) => {
      teste.marcas.forEach((marca) => {
        if (!marca.quantidadePorCaixa || marca.quantidadePorCaixa <= 0) return // Ignora marcas sem cadastro correto

        const chave = `${teste.id}_${marca.id}`
        dadosProcessados[chave] = {
          chave,
          testeNome: teste.nome,
          marcaNome: marca.nome,
          quantidadePorCaixa: marca.quantidadePorCaixa,
          // Campos em UNIDADES para cálculo
          saldoInicialUnidades: 0,
          entradasRecebidoUnidades: 0,
          entradasAjusteUnidades: 0,
          saidasConsumidoUnidades: 0,
          saidasAjusteUnidades: 0,
        }
      })
    })

    // 3. PROCESSAR DADOS, SEMPRE EM UNIDADES
    // Saldo Inicial
    Object.keys(dadosProcessados).forEach((chave) => {
      const item = dadosProcessados[chave]
      const dadosSalvosAnterior = dadosCompetenciaAnterior?.dadosConsolidados.find(
        (d) => d.chave === chave,
      )
      if (dadosSalvosAnterior) {
        // Converte o saldo final em caixas do mês anterior para unidades
        item.saldoInicialUnidades =
          Number(dadosSalvosAnterior.saldoFinal || 0) * item.quantidadePorCaixa
      }
    })
    // Entradas
    dadosBrutos.entradas.forEach((lote) => {
      const chave = `${lote.testeId}_${lote.marcaId}`
      if (dadosProcessados[chave]) {
        dadosProcessados[chave].entradasRecebidoUnidades += Number(lote.quantidadeInicial || 0)
      }
    })
    // Saídas (Consumo)
    dadosBrutos.movimentacoes.forEach((mov) => {
      const chave = `${mov.testeId}_${mov.marcaId}`
      if (dadosProcessados[chave]) {
        dadosProcessados[chave].saidasConsumidoUnidades += Number(mov.quantidade || 0)
      }
    })
    // Ajustes
    dadosBrutos.ajustes.forEach((ajuste) => {
      const chave = `${ajuste.testeId}_${ajuste.marcaId}`
      if (dadosProcessados[chave]) {
        const diferenca = Number(ajuste.diferenca || 0)
        if (diferenca > 0) {
          dadosProcessados[chave].entradasAjusteUnidades += diferenca
        } else {
          dadosProcessados[chave].saidasAjusteUnidades += Math.abs(diferenca)
        }
      }
    })

    // 4. CALCULAR BALANÇO FINAL E CONVERTER PARA EXIBIÇÃO EM CAIXAS
    return Object.values(dadosProcessados).map((item) => {
      const totalEntradasUnidades = item.entradasRecebidoUnidades + item.entradasAjusteUnidades
      const totalSaidasUnidades = item.saidasConsumidoUnidades + item.saidasAjusteUnidades
      const saldoFinalUnidades =
        item.saldoInicialUnidades + totalEntradasUnidades - totalSaidasUnidades

      const dadosSalvosAnterior = dadosCompetenciaAnterior?.dadosConsolidados.find(
        (d) => d.chave === item.chave,
      )

      return {
        ...item,
        // Valores finais para exibição, convertidos para CAIXAS
        saldoInicial: Number(dadosSalvosAnterior?.saldoFinal || 0),
        saldoFinal: paraCaixasSaldo(saldoFinalUnidades, item.quantidadePorCaixa),
        entradas: {
          recebido: paraCaixas(item.entradasRecebidoUnidades, item.quantidadePorCaixa),
          ajuste: paraCaixas(item.entradasAjusteUnidades, item.quantidadePorCaixa),
        },
        saidas: {
          consumido: paraCaixas(item.saidasConsumidoUnidades, item.quantidadePorCaixa),
          ajuste: paraCaixas(item.saidasAjusteUnidades, item.quantidadePorCaixa),
        },
        ressuprimento: 'N/D', // Manter lógica de ressuprimento se houver
      }
    })
  },
}
