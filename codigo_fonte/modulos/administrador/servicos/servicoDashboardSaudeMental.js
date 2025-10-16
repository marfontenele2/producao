import { db } from '@/nucleo/configuracao/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { differenceInYears, addMonths, format } from 'date-fns'

let listaEquipesGlobal = []

export const servicoDashboardSaudeMental = {
  _setListaEquipes(equipes) {
    listaEquipesGlobal = equipes
  },

  async _buscarDadosCompletosSaudeMental() {
    const snapshot = await getDocs(collection(db, 'saudeMental'))
    // Cria um mapa para acesso rápido: { equipeId => dados }
    const mapaDados = new Map()
    snapshot.docs.forEach((doc) => {
      mapaDados.set(doc.id, doc.data())
    })
    return mapaDados
  },

  async gerarDadosDashboard(competencia) {
    // Garante que a lista de equipes está disponível
    if (listaEquipesGlobal.length === 0) {
      console.error('Lista de equipes não foi definida no serviço de dashboard.')
      return { pacientes: [], resumoPorEquipe: [], agendaDasEquipes: [] }
    }

    const mapaDadosSaudeMental = await this._buscarDadosCompletosSaudeMental()
    const pacientesProcessados = []
    const hoje = new Date()
    const resumoPorEquipe = []
    const agendaDasEquipes = []

    const [ano, mes] = competencia.split('-').map(Number)
    const dataProximoMes = addMonths(new Date(ano, mes - 1, 15), 1)
    const proximaCompetencia = format(dataProximoMes, 'yyyy-MM')

    // ===================================================================
    // == LÓGICA CORRIGIDA: Itera sobre a lista oficial de equipes
    // ===================================================================
    for (const equipe of listaEquipesGlobal) {
      const dadosEquipe = mapaDadosSaudeMental.get(equipe.id) || {
        pacientes: [],
        acompanhamentos: {},
        agendaSaudeMental: {},
      }
      const acompanhamentosDaCompetencia = dadosEquipe.acompanhamentos?.[competencia] || {}
      const todosOsPacientesDaEquipe = dadosEquipe.pacientes || []

      // Inicializa o resumo para esta equipe, garantindo que todas as chaves existam
      const resumo = {
        equipeId: equipe.id,
        equipeNome: equipe.nome,
        totalPacientes: todosOsPacientesDaEquipe.length,
        contagemUBS: 0,
        contagemCAPS: 0,
        contagemAmbos: 0,
        contagemRedePrivada: 0,
        contagemSemAcompanhamento: 0,
        contagemOutros: 0,
      }

      todosOsPacientesDaEquipe.forEach((paciente) => {
        const localAcompanhamento =
          acompanhamentosDaCompetencia[paciente.id] || 'Sem Acompanhamento'

        pacientesProcessados.push({
          ...paciente,
          equipeId: equipe.id,
          localAcompanhamento,
          idade: paciente.dataNascimento
            ? differenceInYears(hoje, new Date(paciente.dataNascimento))
            : null,
        })

        // Contabiliza o status do acompanhamento no mês
        if (localAcompanhamento === 'UBS') resumo.contagemUBS++
        else if (localAcompanhamento === 'CAPS') resumo.contagemCAPS++
        else if (localAcompanhamento === 'Ambos') resumo.contagemAmbos++
        else if (localAcompanhamento === 'Rede Privada') resumo.contagemRedePrivada++
        else if (localAcompanhamento === 'Outros') resumo.contagemOutros++
        else resumo.contagemSemAcompanhamento++
      })

      resumoPorEquipe.push(resumo)

      const agendamento = dadosEquipe.agendaSaudeMental?.[proximaCompetencia] || null
      agendaDasEquipes.push({
        equipeId: equipe.id,
        equipeNome: equipe.nome,
        agendamento,
      })
    }

    return {
      pacientes: pacientesProcessados,
      resumoPorEquipe: resumoPorEquipe,
      agendaDasEquipes: agendaDasEquipes,
    }
  },
}
