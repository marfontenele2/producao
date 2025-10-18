<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão Consolidada: Cronograma das Equipes</h1>
      </header>
      <div class="conteudo-card card-filtros">
        <div class="campo">
          <label for="competencia">Competência</label>
          <input type="month" id="competencia" v-model="competencia" class="input-padrao" />
        </div>

        <div class="campo">
          <label>Equipes</label>
          <div class="dropdown-multiselect">
            <button @click="toggleDropdown" class="input-padrao dropdown-botao">
              <span>{{ dropdownLabel }}</span>
              <ChevronDown :size="16" :class="{ 'dropdown-aberto': isDropdownOpen }" />
            </button>
            <div v-if="isDropdownOpen" class="dropdown-painel">
              <label>
                <input
                  type="checkbox"
                  @change="toggleTodasEquipes"
                  :checked="todasEquipesSelecionadas"
                />
                <strong>(Marcar Todas)</strong>
              </label>
              <label v-for="equipe in listaEquipes" :key="equipe.id">
                <input type="checkbox" :value="equipe.id" v-model="equipesSelecionadas" />
                {{ equipe.nome }} ({{ equipe.nomeUbs }})
              </label>
            </div>
          </div>
        </div>

        <button
          class="botao botao-primario"
          @click="gerarRelatorio"
          :disabled="!competencia || equipesSelecionadas.length === 0 || buscando"
        >
          <FileSearch :size="18" /> {{ buscando ? 'Buscando...' : 'Gerar Relatório' }}
        </button>
        <button
          class="botao"
          @click="imprimirPagina"
          :disabled="!dadosRelatorio || dadosRelatorio.length === 0"
        >
          <Printer :size="18" /> Imprimir
        </button>
      </div>
    </div>
  </div>

  <div v-if="erroBusca" class="no-print pagina-container mensagem-feedback erro">
    {{ erroBusca }}
  </div>

  <div v-if="dadosRelatorio && dadosRelatorio.length > 0" id="area-impressao">
    <div class="pagina-a4 borda-impressao">
      <header class="cabecalho-impressao">
        <LogoCabecalhoImpressao />
        <h3>RELATÓRIO CONSOLIDADO DE CRONOGRAMAS DE EQUIPES</h3>
        <div class="info-cabecalho-grid-cronograma">
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Mês de Referência:</strong> {{ competenciaFormatada }}</span>
          <span><strong>Data de Emissão:</strong> {{ dataAtualFormatada }}</span>
        </div>
      </header>

      <div class="legenda-icones">
        <strong>Legenda:</strong>
        <div v-for="categoria in categorias" :key="categoria.nome" class="legenda-item">
          <span class="letra-categoria-legenda" :class="categoria.classeCss">{{
            categoria.letra
          }}</span>
          <span>{{ categoria.nome }}</span>
        </div>
      </div>

      <main class="corpo-impressao">
        <div v-for="equipeData in dadosRelatorio" :key="equipeData.equipeId" class="secao-equipe">
          <h4 class="titulo-secao-impressao">Equipe: {{ equipeData.equipeNome }}</h4>
          <CalendarioImpressao :competencia="competenciaCalendario" :eventos="equipeData.eventos" />
        </div>
      </main>

      <footer class="rodape-impressao">
        <div class="assinatura">
          <p class="linha-assinatura">_________________________________________</p>
          <p>Responsável pela Consolidação</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { servicoCronograma } from '@/modulos/enfermeiro/servicos/servicoCronograma'
import { addMonths, format } from 'date-fns'
import { FileSearch, Printer, ChevronDown } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'
import CalendarioImpressao from '../componentes/CalendarioImpressao.vue'

const competencia = ref(new Date().toISOString().slice(0, 7))
const listaEquipes = ref([])
const equipesSelecionadas = ref([])
const isDropdownOpen = ref(false)
const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)

// ===================================================================
// == 💥 ESTRUTURA DE DADOS DA LEGENDA CORRIGIDA
// ===================================================================
const categorias = [
  { nome: 'Enfermeiro', letra: 'E', classeCss: 'cor-enf' },
  { nome: 'Médico', letra: 'M', classeCss: 'cor-med' },
  { nome: 'Técnico de Enfermagem', letra: 'T', classeCss: 'cor-tec' },
  { nome: 'Gerente', letra: 'G', classeCss: 'cor-ger' },
  { nome: 'Outros', letra: 'O', classeCss: 'cor-outros' },
]

const todasEquipesSelecionadas = computed(
  () =>
    listaEquipes.value.length > 0 && equipesSelecionadas.value.length === listaEquipes.value.length,
)
const dropdownLabel = computed(() => {
  if (equipesSelecionadas.value.length === 0) return 'Selecione as equipes'
  if (equipesSelecionadas.value.length === 1) return '1 equipe selecionada'
  return `${equipesSelecionadas.value.length} equipes selecionadas`
})

const competenciaCalendario = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-').map(Number)
  const dataProximoMes = addMonths(new Date(ano, mes - 1, 1), 1)
  return format(dataProximoMes, 'yyyy-MM')
})

const competenciaFormatada = computed(() => {
  if (!competenciaCalendario.value) return ''
  const [ano, mes] = competenciaCalendario.value.split('-')
  const data = new Date(ano, parseInt(mes) - 1, 15)
  const nomeMes = data.toLocaleString('pt-BR', { month: 'long' })
  return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${ano}`
})
const dataAtualFormatada = computed(() => new Date().toLocaleDateString('pt-BR'))

onMounted(async () => {
  listaEquipes.value = await servicoEquipes.buscarTodas()
})

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}
function toggleTodasEquipes(event) {
  equipesSelecionadas.value = event.target.checked ? listaEquipes.value.map((e) => e.id) : []
}

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const promessas = equipesSelecionadas.value.map((equipeId) =>
      servicoCronograma.buscarCronograma(competencia.value, equipeId).then((eventos) => ({
        equipeId,
        equipeNome: listaEquipes.value.find((e) => e.id === equipeId)?.nome || 'Desconhecida',
        eventos: eventos || [],
      })),
    )
    const resultados = await Promise.all(promessas)
    const relatorioFinal = resultados.filter((r) => r.eventos.length > 0)

    if (relatorioFinal.length === 0) {
      erroBusca.value = `Nenhum cronograma com eventos registrados foi encontrado para as equipes selecionadas na competência de busca (${competencia.value}).`
      return
    }
    dadosRelatorio.value = relatorioFinal
  } catch (error) {
    console.error('Erro ao consolidar relatório de cronogramas:', error)
    erroBusca.value = 'Ocorreu um erro ao buscar e consolidar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}
</script>

<style scoped>
@page {
  size: A4 portrait;
  margin: 1.5cm;
}
.conteudo-card.card-filtros {
  padding: 1.5rem;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.campo {
  display: flex;
  flex-direction: column;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}
.input-padrao {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
  min-width: 220px;
  height: 42px;
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
}
.dropdown-botao svg {
  transition: transform 0.2s;
}
.dropdown-botao .dropdown-aberto {
  transform: rotate(180deg);
}
.dropdown-painel {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
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
}
.dropdown-painel label:hover {
  background-color: #f8fafc;
}
.pagina-a4 {
  background: white;
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.borda-impressao {
  border: 1px solid #333;
}
.cabecalho-impressao {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
}
.cabecalho-impressao h3 {
  margin-top: 1rem;
  font-size: 12pt;
}
.info-cabecalho-grid-cronograma {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  text-align: left;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  padding-top: 1rem;
  flex-grow: 1;
}
.secao-equipe {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
}
.titulo-secao-impressao {
  font-size: 10pt;
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: bold;
  background-color: #f2f2f2;
  padding: 4px;
  border: 1px solid #333;
}
.rodape-impressao {
  display: flex;
  justify-content: flex-end;
  padding-top: 2rem;
  font-size: 10pt;
  margin-top: auto;
}
.assinatura {
  text-align: center;
  width: 60%;
}
.linha-assinatura {
  margin-bottom: 2px;
}
.mensagem-feedback.erro {
  color: #b91c1c;
  background-color: #fee2e2;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

/* =================================================================== */
/* == 💥 ESTILOS ADICIONADOS PARA A NOVA LEGENDA */
/* =================================================================== */
.legenda-icones {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.75rem 0;
  font-size: 8pt;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
}
.legenda-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.letra-categoria-legenda {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 11px;
  color: white;
}
.cor-enf {
  background-color: #3b82f6;
}
.cor-med {
  background-color: #16a34a;
}
.cor-tec {
  background-color: #f97316;
}
.cor-ger {
  background-color: #6d28d9;
}
.cor-outros {
  background-color: #64748b;
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background-color: #fff;
  }
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    border: none;
  }
}
</style>
