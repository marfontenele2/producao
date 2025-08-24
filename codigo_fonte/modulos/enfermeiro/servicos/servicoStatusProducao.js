import { servicoPrazos } from '@/modulos/administrador/servicos/servicoPrazos'
import { servicoPrazosSemanais } from '@/modulos/administrador/servicos/servicoPrazosSemanais'

let cachePrazosMensais = null
let cachePrazosSemanais = null
let competenciaCache = null

/**
 * @typedef {'Aberto' | 'Entregue' | 'Encerrado' | 'Fechado'} StatusProducao
 */

const mapaModulos = {
  mdda: { tipo: 'semanal' },
  notificacaoSemanal: { tipo: 'semanal' },
  sarampo: { tipo: 'semanal' },
  suplementos: { tipo: 'mensal' },
  educacaoPermanente: { tipo: 'mensal' },
  adolescente: { tipo: 'mensal' },
  gestantes: { tipo: 'mensal' },
  boletimTestesRapidos: { tipo: 'mensal' },
  scnes: { tipo: 'mensal' },
  saudeMental: { tipo: 'mensal' },
  producaoAcs: { tipo: 'mensal' },
  cronograma: { tipo: 'mensal' },
}

/**
 * Converte uma string 'AAAA-MM-DD' para um objeto Date de forma segura, imune a fuso horário.
 * @param {string} dateString
 * @returns {Date|null}
 */
function parseDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') return null
  const parts = dateString.split('-')
  if (parts.length !== 3) return null
  // new Date(ano, mês_indexado_em_zero, dia)
  return new Date(parts[0], parts[1] - 1, parts[2])
}

export const servicoStatusProducao = {
  async obterTodosStatusProducao() {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Zera a hora para comparar apenas as datas

    const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

    if (competenciaAtual !== competenciaCache) {
      cachePrazosMensais = null
      cachePrazosSemanais = null
      competenciaCache = competenciaAtual
    }

    if (cachePrazosMensais === null) {
      cachePrazosMensais = await this.buscarPrazosDoMes(competenciaAtual)
    }
    if (cachePrazosSemanais === null) {
      cachePrazosSemanais = await this.buscarPrazosSemanais()
    }

    const statusFinais = {}
    for (const nomeModulo in mapaModulos) {
      statusFinais[nomeModulo] = this.calcularStatusPorPrazo(nomeModulo, hoje)
    }
    return statusFinais
  },

  calcularStatusPorPrazo(nomeModulo, hoje) {
    const definicaoModulo = mapaModulos[nomeModulo]
    if (!definicaoModulo) return 'Fechado'

    const prazos = definicaoModulo.tipo === 'semanal' ? cachePrazosSemanais : cachePrazosMensais
    const configPrazo = prazos ? prazos[nomeModulo] : null

    if (definicaoModulo.tipo === 'mensal') {
      const inicio = parseDateString(configPrazo?.abertura)
      const fim = parseDateString(configPrazo?.fechamento)

      if (!inicio || !fim) return 'Fechado'

      if (hoje < inicio) return 'Fechado'
      if (hoje > fim) return 'Encerrado'
      return 'Aberto'
    }

    if (definicaoModulo.tipo === 'semanal') {
      if (
        !configPrazo ||
        configPrazo.abertura === undefined ||
        configPrazo.fechamento === undefined
      ) {
        return 'Fechado'
      }
      const diaDaSemana = hoje.getDay() // Domingo = 0
      const diaAbertura = parseInt(configPrazo.abertura, 10)
      const diaFechamento = parseInt(configPrazo.fechamento, 10)

      if (diaDaSemana >= diaAbertura && diaDaSemana <= diaFechamento) {
        return 'Aberto'
      }
      return 'Encerrado'
    }

    return 'Fechado'
  },

  buscarPrazosDoMes(competencia) {
    return new Promise((resolve) => {
      const unsub = servicoPrazos.monitorarPrazosDoMes(competencia, (dados) => {
        unsub()
        resolve(dados)
      })
    })
  },

  buscarPrazosSemanais() {
    return new Promise((resolve) => {
      const unsub = servicoPrazosSemanais.monitorarPrazos((dados) => {
        unsub()
        resolve(dados)
      })
    })
  },
}
