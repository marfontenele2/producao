<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Dashboard de Controle de Estoque</h1>
    </header>

    <div class="conteudo-card filtros-dashboard">
      <div class="campo">
        <label for="filtro-periodo">Período de Análise</label>
        <select
          id="filtro-periodo"
          v-model="periodoSelecionado"
          @change="atualizarDatas"
          class="input-padrao"
        >
          <option value="30d">Últimos 30 dias</option>
          <option value="mesAtual">Este Mês</option>
          <option value="mesPassado">Mês Passado</option>
          <option value="custom">Período Customizado</option>
        </select>
      </div>
      <div v-if="periodoSelecionado === 'custom'" class="campo">
        <label for="data-inicio">Data Início</label>
        <input id="data-inicio" type="date" v-model="dataInicio" class="input-padrao" />
      </div>
      <div v-if="periodoSelecionado === 'custom'" class="campo">
        <label for="data-fim">Data Fim</label>
        <input id="data-fim" type="date" v-model="dataFim" class="input-padrao" />
      </div>
      <button class="botao botao-primario" @click="buscarDadosDashboard" :disabled="carregando">
        <RefreshCw :size="18" :class="{ 'animate-spin': carregando }" />
        Atualizar Painel
      </button>
    </div>

    <div v-if="carregando" class="carregando-container">
      <LoaderCircle :size="32" class="animate-spin" />
      <span>Buscando e processando dados...</span>
    </div>

    <div v-else-if="dadosDashboard" class="grid-dashboard">
      <div class="kpi-card">
        <span class="kpi-titulo">Entradas no Período</span>
        <span class="kpi-valor">{{ dadosDashboard.kpis.totalEntradas }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-titulo">Saídas no Período</span>
        <span class="kpi-valor">{{ dadosDashboard.kpis.totalSaidas }}</span>
      </div>
      <div class="kpi-card" :class="{ 'alerta-amarelo': dadosDashboard.kpis.estoqueBaixo > 0 }">
        <span class="kpi-titulo">Lotes com Estoque Baixo</span>
        <span class="kpi-valor">{{ dadosDashboard.kpis.estoqueBaixo }}</span>
      </div>
      <div
        class="kpi-card"
        :class="{ 'alerta-vermelho': dadosDashboard.kpis.vencimentoProximo > 0 }"
      >
        <span class="kpi-titulo">Lotes Próximos do Vencimento</span>
        <span class="kpi-valor">{{ dadosDashboard.kpis.vencimentoProximo }}</span>
      </div>

      <div class="conteudo-card chart-card">
        <h3>Saídas por Tipo de Teste (no período)</h3>
        <Doughnut
          v-if="donutChartData.labels.length"
          :data="donutChartData"
          :options="chartOptions"
        />
        <div v-else class="aviso-sem-dados">Nenhuma saída registrada no período.</div>
      </div>
      <div class="conteudo-card chart-card">
        <h3>Linha do Tempo: Entradas vs. Saídas</h3>
        <Line v-if="lineChartData.labels.length" :data="lineChartData" :options="chartOptions" />
        <div v-else class="aviso-sem-dados">Nenhuma movimentação registrada no período.</div>
      </div>

      <div class="conteudo-card table-card">
        <h3>Estoque Atual Completo</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { servicoDashboardEstoque } from '../servicos/servicoDashboardEstoque'
import { Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { LoaderCircle, RefreshCw } from 'lucide-vue-next'
import { format, subDays, startOfMonth, endOfMonth, startOfToday, endOfToday } from 'date-fns'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
)

const carregando = ref(true)
const periodoSelecionado = ref('30d')
const dataInicio = ref('')
const dataFim = ref('')
const dadosDashboard = ref(null)

const chartOptions = { responsive: true, maintainAspectRatio: false }

function atualizarDatas() {
  const hoje = new Date()
  if (periodoSelecionado.value === '30d') {
    dataInicio.value = format(subDays(hoje, 29), 'yyyy-MM-dd')
    dataFim.value = format(hoje, 'yyyy-MM-dd')
  } else if (periodoSelecionado.value === 'mesAtual') {
    dataInicio.value = format(startOfMonth(hoje), 'yyyy-MM-dd')
    dataFim.value = format(endOfMonth(hoje), 'yyyy-MM-dd')
  } else if (periodoSelecionado.value === 'mesPassado') {
    const mesPassado = subDays(startOfMonth(hoje), 1)
    dataInicio.value = format(startOfMonth(mesPassado), 'yyyy-MM-dd')
    dataFim.value = format(endOfMonth(mesPassado), 'yyyy-MM-dd')
  }
}

async function buscarDadosDashboard() {
  carregando.value = true
  dadosDashboard.value = await servicoDashboardEstoque.buscarDadosDashboard({
    dataInicio: dataInicio.value,
    dataFim: dataFim.value,
  })
  carregando.value = false
}

const donutChartData = computed(() => {
  if (!dadosDashboard.value?.graficoConsumo) return { labels: [], datasets: [] }
  const labels = dadosDashboard.value.graficoConsumo.map((item) => item.nome)
  const data = dadosDashboard.value.graficoConsumo.map((item) => item.valor)
  return {
    labels,
    datasets: [
      {
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26A69A', '#AB47BC'],
        data,
      },
    ],
  }
})

const lineChartData = computed(() => {
  if (!dadosDashboard.value?.graficoFluxo) return { labels: [], datasets: [] }
  const labels = dadosDashboard.value.graficoFluxo.map((item) => item.dia)
  const entradas = dadosDashboard.value.graficoFluxo.map((item) => item.entradas)
  const saidas = dadosDashboard.value.graficoFluxo.map((item) => item.saidas)
  return {
    labels,
    datasets: [
      { label: 'Entradas', backgroundColor: '#66BB6A', borderColor: '#66BB6A', data: entradas },
      { label: 'Saídas', backgroundColor: '#EF5350', borderColor: '#EF5350', data: saidas },
    ],
  }
})

onMounted(() => {
  atualizarDatas()
  buscarDadosDashboard()
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
  min-width: 200px;
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
  border-left: 5px solid #ccc;
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
.alerta-amarelo {
  border-color: #f59e0b;
}
.alerta-vermelho {
  border-color: #ef4444;
}
.chart-card {
  grid-column: span 2;
  height: 400px;
}
.table-card {
  grid-column: 1 / 5;
}
.aviso-sem-dados {
  text-align: center;
  padding: 2rem;
  color: #64748b;
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
