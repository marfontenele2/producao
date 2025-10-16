<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão Consolidada: Produção do ACS</h1>
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
                {{ equipe.nome }}
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
        <button class="botao" @click="imprimirPagina" :disabled="!dadosRelatorio">
          <Printer :size="18" /> Imprimir
        </button>
      </div>
    </div>
  </div>

  <div v-if="erroBusca" class="no-print pagina-container mensagem-feedback erro">
    {{ erroBusca }}
  </div>

  <div v-if="dadosRelatorio" id="area-impressao">
    <div class="pagina-a4 borda-impressao">
      <header class="cabecalho-impressao">
        <LogoCabecalhoImpressao />
        <h3>RELATÓRIO DE PRODUÇÃO CONSOLIDADA - ACS</h3>
        <div class="info-cabecalho-grid">
          <span><strong>Nº de Equipes:</strong> {{ equipesSelecionadas.length }}</span>
          <span><strong>Competência:</strong> {{ competenciaFormatada }}</span>
          <span><strong>Data de Emissão:</strong> {{ dataAtualFormatada }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <TabelaRelatorio titulo="👶 Puericultura" :itens="dadosPuericultura" />
        <TabelaRelatorio titulo="⚖️ Avaliação Antropométrica" :itens="dadosAntropometria" />
        <TabelaRelatorio titulo="🏡 Visitas Domiciliares do ACS" :itens="dadosVisitas" />
        <TabelaRelatorio titulo="💉 Situação Vacinal" :itens="dadosVacinas" />
        <TabelaRelatorio titulo="👶 Nascidos na Microárea" :itens="dadosNascidos" />
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
import { servicoDashboardACS } from '../servicos/servicoDashboardACS'
import { FileSearch, Printer, ChevronDown } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes_comuns/LogoCabecalhoImpressao.vue'
import TabelaRelatorio from '@/modulos/enfermeiro/componentes/TabelaRelatorio.vue'

const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)
const competencia = ref(new Date().toISOString().slice(0, 7))
const listaEquipes = ref([])
const equipesSelecionadas = ref([])
const isDropdownOpen = ref(false)

const todasEquipesSelecionadas = computed(
  () =>
    listaEquipes.value.length > 0 && equipesSelecionadas.value.length === listaEquipes.value.length,
)
const dropdownLabel = computed(() => {
  if (equipesSelecionadas.value.length === 0) return 'Selecione as equipes'
  if (equipesSelecionadas.value.length === 1) return '1 equipe selecionada'
  return `${equipesSelecionadas.value.length} equipes selecionadas`
})
const competenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-')
  return `${mes}/${ano}`
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
function imprimirPagina() {
  window.print()
}

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const dados = await servicoDashboardACS.buscarDadosConsolidadosACS(
      competencia.value,
      equipesSelecionadas.value,
    )
    if (!dados) {
      erroBusca.value = `Nenhuma produção de ACS encontrada para as equipes selecionadas na competência ${competenciaFormatada.value}.`
      return
    }
    dadosRelatorio.value = dados
  } catch (error) {
    console.error('Erro ao consolidar relatório ACS:', error)
    erroBusca.value = 'Ocorreu um erro ao buscar e consolidar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

// Mapeamento dos dados consolidados para o componente TabelaRelatorio
const dadosPuericultura = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.puericultura
  return [
    { item: 'Crianças Acompanhadas', valor: d.criancasAcompanhadas },
    { item: '1ª Consulta até 30 dias', valor: d.primeiraConsulta30dias },
    { item: 'Consultas no Mês', valor: d.consultasNoMes },
    { item: 'Consultas em Dia', valor: d.consultasEmDia },
  ]
})
const dadosAntropometria = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.avaliacaoAntropometrica
  return [
    { item: '1ª Verificação até 30 dias', valor: d.primeiraVerificacao30dias },
    { item: 'Verificações no Mês', valor: d.verificacoesNoMes },
    { item: 'Medições em Dia', valor: d.medicoesEmDia },
  ]
})
const dadosVisitas = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.visitasDomiciliares
  return [
    { item: '1ª Visita até 30 dias', valor: d.primeiraVisita30dias },
    { item: '2ª Visita Realizada', valor: d.segundaVisitaRealizada },
    { item: 'Visitas no Mês', valor: d.visitasNoMes },
  ]
})
const dadosVacinas = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.situacaoVacinal
  return [
    { item: 'Vacinação em Dia', valor: d.vacinacaoEmDia },
    { item: 'Vacinação Atrasada', valor: d.vacinacaoAtrasada },
    { item: 'Sem Informação', valor: d.semInformacao },
  ]
})
const dadosNascidos = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.nascidosNaMicroarea
  return [
    { item: 'Total de Nascidos', valor: d.total },
    { item: 'Com Cartão SUS', valor: d.comCartaoSus },
    { item: 'Sem Cartão SUS', valor: d.semCartaoSus },
    { item: 'Não Informado', valor: d.naoInformado },
  ]
})
</script>

<style scoped>
/* Estilos idênticos ao 'PaginaImpressaoSCNESAdmin.vue' para consistência visual */
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
  width: 300px;
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
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  text-align: left;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  padding-top: 1rem;
  flex: 1;
}
.rodape-impressao {
  display: flex;
  justify-content: flex-end;
  padding-top: 3rem;
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
