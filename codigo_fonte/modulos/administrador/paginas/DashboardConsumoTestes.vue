<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Dashboard de Consumo de Testes Rápidos</h1>
    </header>

    <div class="conteudo-card filtros-dashboard">
      <div class="campo">
        <label for="competencia">Competência</label>
        <input
          id="competencia"
          type="month"
          v-model="competencia"
          class="input-padrao"
          @change="buscarDadosDashboard"
        />
      </div>
      <div class="campo">
        <label for="filtro-ubs">Filtrar por Unidade de Saúde</label>
        <select
          id="filtro-ubs"
          v-model="ubsSelecionadaId"
          class="input-padrao"
          @change="atualizarDashboard"
        >
          <option value="todas">Todas as Unidades</option>
          <option v-for="ubs in listaUbs" :key="ubs.id" :value="ubs.id">{{ ubs.nome }}</option>
        </select>
      </div>
    </div>

    <div v-if="carregando" class="carregando-container">
      <LoaderCircle :size="32" class="animate-spin" />
      <span>Buscando e processando dados...</span>
    </div>

    <div v-else-if="dadosDashboard" class="grid-dashboard">
      <div class="kpi-card">
        <span class="kpi-titulo">Total Realizados</span>
        <span class="kpi-valor">{{ kpi.totalRealizados }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-titulo">Total Reagentes</span>
        <span class="kpi-valor">{{ kpi.totalReagentes }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-titulo">Total Perdidos</span>
        <span class="kpi-valor">{{ kpi.totalPerdidos }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-titulo">Total Inválidos</span>
        <span class="kpi-valor">{{ kpi.totalInvalidos }}</span>
      </div>

      <div class="conteudo-card chart-card">
        <h3>Consumo por Tipo de Teste</h3>
        <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
        <div v-else class="aviso-sem-dados">Nenhum teste realizado para a seleção atual.</div>
      </div>

      <div class="conteudo-card table-card">
        <h3>Dados por Unidade</h3>
        <div class="tabela-container">
          <table class="tabela-padrao">
            <thead>
              <tr>
                <th>Unidade de Saúde</th>
                <th>Realizados</th>
                <th>Reagentes</th>
                <th>Perdidos</th>
                <th>Inválidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="dadosTabela.length === 0">
                <td colspan="5">Nenhum dado encontrado.</td>
              </tr>
              <tr v-for="ubs in dadosTabela" :key="ubs.id">
                <td>{{ ubs.nome }}</td>
                <td>{{ ubs.totalRealizados }}</td>
                <td>{{ ubs.totalReagentes }}</td>
                <td>{{ ubs.totalPerdidos }}</td>
                <td>{{ ubs.totalInvalidos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { servicoDashboards } from '../servicos/servicoDashboards' // <-- Usando o novo serviço
import { servicoUbs } from '@/nucleo/servicos_comuns/servicoUbs'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { LoaderCircle } from 'lucide-vue-next'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const carregando = ref(true)
const competencia = ref(new Date().toISOString().slice(0, 7))
const listaUbs = ref([])
const ubsSelecionadaId = ref('todas')
const dadosDashboard = ref(null) // Armazena o resultado completo da busca

const kpi = ref({ totalRealizados: 0, totalReagentes: 0, totalPerdidos: 0, totalInvalidos: 0 })
const chartData = ref({ labels: [], datasets: [] })
const dadosTabela = ref([])

const chartOptions = { responsive: true, maintainAspectRatio: false }

async function buscarDadosDashboard() {
  carregando.value = true
  dadosDashboard.value = await servicoDashboards.gerarConsumoTestesPorUBS(competencia.value)
  atualizarDashboard()
  carregando.value = false
}

function atualizarDashboard() {
  if (!dadosDashboard.value) return

  const dadosFiltrados =
    ubsSelecionadaId.value === 'todas'
      ? dadosDashboard.value
      : dadosDashboard.value.filter((d) => d.id === ubsSelecionadaId.value)

  dadosTabela.value = dadosFiltrados

  kpi.value = dadosFiltrados.reduce(
    (acc, ubs) => {
      acc.totalRealizados += ubs.totalRealizados
      acc.totalReagentes += ubs.totalReagentes
      acc.totalPerdidos += ubs.totalPerdidos
      acc.totalInvalidos += ubs.totalInvalidos
      return acc
    },
    { totalRealizados: 0, totalReagentes: 0, totalPerdidos: 0, totalInvalidos: 0 },
  )

  const consumoPorTeste = new Map()
  dadosFiltrados.forEach((ubs) => {
    ubs.detalhesPorTeste.forEach((teste) => {
      if (!consumoPorTeste.has(teste.nome)) {
        consumoPorTeste.set(teste.nome, 0)
      }
      consumoPorTeste.set(teste.nome, consumoPorTeste.get(teste.nome) + teste.realizados)
    })
  })

  chartData.value = {
    labels: Array.from(consumoPorTeste.keys()),
    datasets: [
      {
        label: 'Testes Realizados',
        backgroundColor: '#3b82f6',
        data: Array.from(consumoPorTeste.values()),
      },
    ],
  }
}

onMounted(async () => {
  listaUbs.value = await servicoUbs.buscarTodas()
  await buscarDadosDashboard()
})
</script>

<style scoped>
.filtros-dashboard {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
}
.input-padrao {
  height: 42px;
  min-width: 240px;
}
.carregando-container {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
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
.chart-card {
  grid-column: 1 / 5;
  height: 400px;
  padding-bottom: 2rem;
}
.table-card {
  grid-column: 1 / 5;
}
.aviso-sem-dados {
  text-align: center;
  padding: 2rem;
}
.tabela-container {
  overflow-x: auto;
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
</style>
