import { servicoProducaoACS } from '@/modulos/acs/servicos/servicoProducaoACS'

/**
 * Função auxiliar recursiva para somar os valores de dois objetos.
 * @param {object} acumulador - O objeto que acumula os totais.
 * @param {object} atual - O objeto com os novos valores a serem somados.
 */
function somarValores(acumulador, atual) {
  for (const chave in atual) {
    if (typeof atual[chave] === 'number') {
      acumulador[chave] = (acumulador[chave] || 0) + atual[chave]
    } else if (typeof atual[chave] === 'object' && atual[chave] !== null) {
      if (!acumulador[chave]) {
        acumulador[chave] = {}
      }
      somarValores(acumulador[chave], atual[chave])
    }
  }
}

export const servicoDashboardACS = {
  /**
   * Busca os dados de produção de múltiplas equipes para uma competência
   * e retorna um único objeto com todos os valores numéricos somados.
   * @param {string} competencia - A competência no formato 'AAAA-MM'.
   * @param {Array<string>} listaEquipeIds - Um array com os IDs das equipes.
   * @returns {Promise<object|null>} Objeto com os dados consolidados ou null se nenhum dado for encontrado.
   */
  async buscarDadosConsolidadosACS(competencia, listaEquipeIds) {
    if (!competencia || !listaEquipeIds || listaEquipeIds.length === 0) {
      return null
    }

    const promessas = listaEquipeIds.map((equipeId) =>
      servicoProducaoACS.buscarProducao(competencia, equipeId),
    )

    const resultados = await Promise.all(promessas)
    const documentosValidos = resultados.filter((doc) => doc !== null)

    if (documentosValidos.length === 0) {
      return null // Nenhum dado encontrado para as equipes selecionadas
    }

    // Inicia o acumulador com a estrutura de um modelo vazio
    const totaisConsolidados = servicoProducaoACS.getModeloVazio()

    // Remove dados não-numéricos do modelo para não interferir na soma
    delete totaisConsolidados.competencia
    delete totaisConsolidados.equipeId
    delete totaisConsolidados.observacoes
    // ... e outros campos de texto/metadados

    // Itera sobre cada documento válido e soma seus valores no acumulador
    documentosValidos.forEach((documento) => {
      somarValores(totaisConsolidados, documento)
    })

    return totaisConsolidados
  },
}
