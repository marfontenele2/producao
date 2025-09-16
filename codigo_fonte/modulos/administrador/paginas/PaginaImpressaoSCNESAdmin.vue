<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão Consolidada: Relatório de Profissionais (SCNES)</h1>
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
        <h3>RELATÓRIO CONSOLIDADO DE PROFISSIONAIS (SCNES)</h3>
        <div class="info-cabecalho-grid">
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Competência:</strong> {{ competenciaFormatada }}</span>
          <span><strong>Data de Emissão:</strong> {{ dataAtualFormatada }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <div
          v-for="equipeData in dadosRelatorio.dadosPorEquipe"
          :key="equipeData.equipeId"
          class="secao-equipe"
        >
          <h4 class="titulo-secao-impressao">Equipe: {{ equipeData.equipeNome }}</h4>
          <table class="tabela-impressao">
            <thead>
              <tr>
                <th>Nome Completo do Profissional</th>
                <th>CPF</th>
                <th>Data de Nasc.</th>
                <th>CNS</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="equipeData.profissionais.length === 0">
                <td colspan="5" style="text-align: center">
                  Nenhum profissional encontrado para esta equipe.
                </td>
              </tr>
              <tr v-for="prof in equipeData.profissionais" :key="prof.cpf">
                <td class="coluna-nome">{{ prof.nome }}</td>
                <td>{{ prof.cpf }}</td>
                <td>{{ formatarData(prof.dataNascimento) }}</td>
                <td>{{ prof.cns }}</td>
                <td>{{ prof.cargo }}</td>
              </tr>
            </tbody>
          </table>
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
import { carregarProfissionais } from '@/modulos/gerente/servicos/ServicoSCNES'
import { FileSearch, Printer, ChevronDown } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'

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
function formatarData(dataString) {
  if (!dataString) return 'N/D'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const promessas = equipesSelecionadas.value.map((equipeId) =>
      carregarProfissionais(competencia.value, equipeId).then((profissionais) => ({
        equipeId,
        equipeNome: listaEquipes.value.find((e) => e.id === equipeId)?.nome || 'Desconhecida',
        profissionais,
      })),
    )
    const resultados = await Promise.all(promessas)
    const dadosPorEquipe = resultados.filter((r) => r.profissionais.length > 0)

    if (dadosPorEquipe.length === 0) {
      erroBusca.value = `Nenhuma produção SCNES encontrada para as equipes na competência ${competenciaFormatada.value}.`
      return
    }
    dadosRelatorio.value = { dadosPorEquipe }
  } catch (error) {
    console.error('Erro ao consolidar relatório SCNES:', error)
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
/* Estilos fieis ao exemplo PaginaImpressaoMDDAAdmin.vue */
@page {
  size: A4 portrait;
  margin: 1.5cm;
}
.conteudo-card.card-filtros,
.card-filtros {
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
  grid-template-columns: 2fr 1fr 1fr;
  text-align: left;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  padding-top: 1rem;
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
.tabela-impressao {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
}
.tabela-impressao th,
.tabela-impressao td {
  border: 1px solid #333;
  padding: 3px 5px;
  text-align: center;
}
.tabela-impressao th {
  background-color: #f2f2f2;
}
.tabela-impressao td.coluna-nome {
  text-align: left;
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
