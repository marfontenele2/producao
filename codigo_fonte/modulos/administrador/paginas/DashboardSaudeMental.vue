<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Dashboard de Saúde Mental</h1>
    </header>

    <div class="conteudo-card filtros-dashboard">
      <div class="campo">
        <label for="competencia">Competência</label>
        <input
          id="competencia"
          type="month"
          v-model="competencia"
          class="input-padrao"
          @change="buscarDados"
        />
      </div>
      <div class="campo">
        <label>Filtrar Equipes</label>
        <div class="dropdown-multiselect">
          <button @click="toggleDropdown" class="input-padrao dropdown-botao">
            <span>{{ dropdownLabel }}</span>
            <ChevronDown :size="16" :class="{ 'dropdown-aberto': isDropdownOpen }" />
          </button>
          <div v-if="isDropdownOpen" class="dropdown-painel">
            <label
              ><input
                type="checkbox"
                @change="toggleTodasEquipes"
                :checked="todasEquipesSelecionadas"
              /><strong>(Marcar/Desmarcar Todas)</strong></label
            >
            <label v-for="equipe in listaEquipes" :key="equipe.id">
              <input type="checkbox" :value="equipe.id" v-model="equipesSelecionadas" />
              {{ equipe.nome }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="carregando-container">
      <LoaderCircle :size="32" class="animate-spin" />
      <span>Buscando e processando dados...</span>
    </div>

    <div v-else-if="dadosDashboard && dadosDashboard.pacientes.length > 0">
      <div class="abas-container">
        <button @click="abaAtiva = 'analise'" :class="{ 'aba-ativa': abaAtiva === 'analise' }">
          Análise de Pacientes
        </button>
        <button @click="abaAtiva = 'agenda'" :class="{ 'aba-ativa': abaAtiva === 'agenda' }">
          Agenda das Equipes
        </button>
      </div>

      <div v-show="abaAtiva === 'analise'">
        <div class="grid-kpi-6">
          <div class="kpi-card">
            <span class="kpi-titulo">Total de Pacientes</span
            ><span class="kpi-valor">{{ kpis.totalPacientes }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-titulo">Em UBS</span
            ><span class="kpi-valor">{{ kpis.distribuicaoLocal.UBS }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-titulo">No CAPS</span
            ><span class="kpi-valor">{{ kpis.distribuicaoLocal.CAPS }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-titulo">Em Ambos</span
            ><span class="kpi-valor">{{ kpis.distribuicaoLocal.Ambos }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-titulo">Rede Privada</span
            ><span class="kpi-valor">{{ kpis.distribuicaoLocal['Rede Privada'] }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-titulo">Sem Acompanhamento</span
            ><span class="kpi-valor">{{ kpis.distribuicaoLocal['Sem Acompanhamento'] }}</span>
          </div>
        </div>

        <h2 class="titulo-secao">Resumo por Equipe</h2>
        <div class="grid-resumo-equipes">
          <div
            v-for="equipe in dadosEquipesDetalhado"
            :key="equipe.equipeId"
            class="conteudo-card card-resumo-equipe"
          >
            <h4 class="nome-equipe-resumo">{{ equipe.equipeNome }}</h4>
            <div class="dados-equipe-resumo">
              <div>
                <span>Total de Pacientes:</span><strong>{{ equipe.totalPacientes }}</strong>
              </div>
              <div>
                <span>Na UBS:</span><strong>{{ equipe.contagemUBS }}</strong>
              </div>
              <div>
                <span>No CAPS:</span><strong>{{ equipe.contagemCAPS }}</strong>
              </div>
              <div>
                <span>Em Ambos:</span><strong>{{ equipe.contagemAmbos }}</strong>
              </div>
              <div>
                <span>Rede Privada:</span><strong>{{ equipe.contagemRedePrivada }}</strong>
              </div>
              <div>
                <span>Sem Acompanhamento:</span
                ><strong>{{ equipe.contagemSemAcompanhamento }}</strong>
              </div>
              <div>
                <span>Outros:</span><strong>{{ equipe.contagemOutros }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-graficos">
          <div class="conteudo-card">
            <h3>Pacientes por Local</h3>
            <table class="tabela-padrao tabela-dashboard">
              <thead>
                <tr>
                  <th>Local</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in graficoLocalData.labels" :key="item">
                  <td>{{ item }}</td>
                  <td>{{ kpis.distribuicaoLocal[item] || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="conteudo-card">
            <h3>Distribuição por Faixa Etária e Sexo</h3>
            <table class="tabela-padrao tabela-dashboard">
              <thead>
                <tr>
                  <th>Faixa Etária</th>
                  <th>Masculino</th>
                  <th>Feminino</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(faixa, index) in graficoFaixaEtariaSexoData.labels" :key="faixa">
                  <td>{{ faixa }}</td>
                  <td>{{ graficoFaixaEtariaSexoData.datasets[0].data[index] }}</td>
                  <td>{{ graficoFaixaEtariaSexoData.datasets[1].data[index] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-show="abaAtiva === 'agenda'">
        <h2 class="titulo-secao">Agenda para o Mês Seguinte ({{ proximaCompetenciaFormatada }})</h2>
        <div class="grid-agenda-equipes">
          <div
            v-for="equipe in agendaFiltrada"
            :key="equipe.equipeId"
            class="conteudo-card card-agenda"
            :class="{ 'status-pendente': !equipe.agendamento }"
          >
            <h4 class="nome-equipe-agenda">{{ equipe.equipeNome }}</h4>
            <div v-if="equipe.agendamento" class="dados-agenda">
              <div class="data-agendada">
                ✅ Agendado para: <strong>{{ formatarData(equipe.agendamento.data) }}</strong>
              </div>
              <div class="profissionais-agendados">
                <strong>Profissionais:</strong>
                <ul>
                  <li v-for="nome in equipe.agendamento.profissionaisNomes" :key="nome">
                    {{ nome }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-else class="dados-agenda-pendente">⚠️ Agendamento pendente</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="aviso-sem-dados">
      Nenhum dado de saúde mental encontrado para a competência selecionada.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { servicoDashboardSaudeMental } from '../servicos/servicoDashboardSaudeMental'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { LoaderCircle, ChevronDown } from 'lucide-vue-next'
import { format, addMonths } from 'date-fns'

const carregando = ref(true)
const competencia = ref(new Date().toISOString().slice(0, 7))
const dadosDashboard = ref({ pacientes: [], resumoPorEquipe: [], agendaDasEquipes: [] })
const abaAtiva = ref('analise')
const listaEquipes = ref([])
const equipesSelecionadas = ref([])
const isDropdownOpen = ref(false)

async function buscarDados() {
  carregando.value = true
  servicoDashboardSaudeMental._setListaEquipes(listaEquipes.value)
  const resultado = await servicoDashboardSaudeMental.gerarDadosDashboard(competencia.value)
  dadosDashboard.value = resultado || { pacientes: [], resumoPorEquipe: [], agendaDasEquipes: [] }
  carregando.value = false
}

const todasEquipesSelecionadas = computed(
  () =>
    listaEquipes.value.length > 0 && equipesSelecionadas.value.length === listaEquipes.value.length,
)
const dropdownLabel = computed(() => {
  if (equipesSelecionadas.value.length === 0) return 'Todas as equipes'
  if (equipesSelecionadas.value.length === 1) return '1 equipe selecionada'
  return `${equipesSelecionadas.value.length} equipes selecionadas`
})
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}
function toggleTodasEquipes(event) {
  equipesSelecionadas.value = event.target.checked ? listaEquipes.value.map((e) => e.id) : []
}
const formatarData = (data) => format(new Date(`${data}T12:00:00`), 'dd/MM/yyyy')

const proximaCompetenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-').map(Number)
  const dataProximoMes = addMonths(new Date(ano, mes - 1, 15), 1)
  return format(dataProximoMes, 'MM/yyyy')
})

const pacientesFiltrados = computed(() => {
  if (!dadosDashboard.value?.pacientes) return []
  if (equipesSelecionadas.value.length === 0) return dadosDashboard.value.pacientes
  return dadosDashboard.value.pacientes.filter((p) =>
    equipesSelecionadas.value.includes(p.equipeId),
  )
})

const agendaFiltrada = computed(() => {
  if (!dadosDashboard.value?.agendaDasEquipes) return []
  const agenda = dadosDashboard.value.agendaDasEquipes
  if (equipesSelecionadas.value.length === 0) return agenda
  return agenda.filter((a) => equipesSelecionadas.value.includes(a.equipeId))
})

const kpis = computed(() => {
  const contagemPorLocal = {
    UBS: 0,
    CAPS: 0,
    Ambos: 0,
    'Rede Privada': 0,
    'Sem Acompanhamento': 0,
    Outros: 0,
  }
  pacientesFiltrados.value.forEach((p) => {
    contagemPorLocal[p.localAcompanhamento] = (contagemPorLocal[p.localAcompanhamento] || 0) + 1
  })
  return { totalPacientes: pacientesFiltrados.value.length, distribuicaoLocal: contagemPorLocal }
})

const dadosEquipesDetalhado = computed(() => {
  if (!dadosDashboard.value?.resumoPorEquipe) return []
  const resumo = dadosDashboard.value.resumoPorEquipe
  const resumoFiltrado =
    equipesSelecionadas.value.length === 0
      ? resumo
      : resumo.filter((e) => equipesSelecionadas.value.includes(e.equipeId))

  // ===================================================================
  // == ALTERAÇÃO CIRÚRGICA: Ordenando por nome da equipe
  // ===================================================================
  return resumoFiltrado.sort((a, b) => a.equipeNome.localeCompare(b.equipeNome))
})

const graficoLocalData = computed(() => {
  const data = kpis.value.distribuicaoLocal
  return { labels: Object.keys(data) }
})

const graficoFaixaEtariaSexoData = computed(() => {
  const data = {
    labels: ['0-17', '18-35', '36-59', '60+'],
    datasets: [
      { label: 'Masculino', data: [0, 0, 0, 0] },
      { label: 'Feminino', data: [0, 0, 0, 0] },
    ],
  }
  if (!pacientesFiltrados.value) return data
  pacientesFiltrados.value.forEach((p) => {
    let faixaIndex = -1
    if (p.idade <= 17) faixaIndex = 0
    else if (p.idade <= 35) faixaIndex = 1
    else if (p.idade <= 59) faixaIndex = 2
    else if (p.idade >= 60) faixaIndex = 3
    if (faixaIndex > -1) {
      if (p.sexo === 'Masculino') data.datasets[0].data[faixaIndex]++
      if (p.sexo === 'Feminino') data.datasets[1].data[faixaIndex]++
    }
  })
  return data
})

onMounted(async () => {
  carregando.value = true
  listaEquipes.value = await servicoEquipes.buscarTodas()
  await buscarDados()
  carregando.value = false
})
</script>

<style scoped>
.filtros-dashboard {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}
.input-padrao {
  height: 42px;
  min-width: 240px;
}
.carregando-container,
.aviso-sem-dados {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #64748b;
}
.abas-container {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}
.abas-container button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  border-bottom: 2px solid transparent;
}
.abas-container button.aba-ativa {
  color: var(--cor-primaria);
  border-bottom-color: var(--cor-primaria);
}
.grid-kpi-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.kpi-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.kpi-titulo {
  font-size: 0.9rem;
  color: #64748b;
}
.kpi-valor {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}
.titulo-secao {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.grid-resumo-equipes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.card-resumo-equipe {
  padding: 1.5rem;
}
.nome-equipe-resumo {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}
.dados-equipe-resumo div {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}
.grid-graficos {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}
.tabela-dashboard {
  margin-top: 1rem;
}
.grid-agenda-equipes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.card-agenda {
  padding: 1.5rem;
  border-left: 5px solid #22c55e;
}
.card-agenda.status-pendente {
  border-color: #f59e0b;
}
.nome-equipe-agenda {
  margin-top: 0;
}
.dados-agenda .data-agendada {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.dados-agenda-pendente {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f59e0b;
}
.profissionais-agendados ul {
  padding-left: 1.2rem;
  margin: 0.5rem 0 0 0;
}
.animate-spin {
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.dropdown-multiselect {
  position: relative;
}
.dropdown-botao {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
  background-color: white;
  cursor: pointer;
}
.dropdown-botao svg {
  transition: transform 0.2s;
}
.dropdown-botao .dropdown-aberto {
  transform: rotate(180deg);
}
.dropdown-painel {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 300px;
  max-height: 250px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 0.5rem;
}
.dropdown-painel label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
}
.dropdown-painel label:hover {
  background-color: #f8fafc;
}
</style>
