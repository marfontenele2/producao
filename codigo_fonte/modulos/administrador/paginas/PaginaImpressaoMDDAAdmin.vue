<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão Consolidada: Relatório Semanal (MDDA)</h1>
      </header>
      <div class="card-filtros">
        <div class="campo">
          <label for="ano">Ano</label>
          <select id="ano" v-model="anoSelecionado" class="input-padrao">
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>
        <div class="campo">
          <label for="semana">Semana Epidemiológica</label>
          <select
            id="semana"
            v-model="semanaKeySelecionada"
            :disabled="!anoSelecionado"
            class="input-padrao"
          >
            <option :value="null" disabled>Selecione</option>
            <option v-for="semana in semanasDoAno" :key="semana.chave" :value="semana.chave">
              {{ semana.display }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Equipes</label>
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
                />
                <strong>(Marcar Todas)</strong></label
              >
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
          :disabled="!semanaKeySelecionada || equipesSelecionadas.length === 0 || buscando"
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
        <h3>MDDA - CONSOLIDADO POR EQUIPE</h3>
        <div class="info-cabecalho-grid">
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Semana Epidemiológica:</strong> {{ semanaInfo?.semana }}</span>
          <span
            ><strong>Ano Epidemiológico:</strong>
            {{ semanaInfo ? semanaInfo.chave.substring(0, 4) : '' }}</span
          >
        </div>
      </header>

      <main class="corpo-impressao">
        <h4 class="titulo-secao-impressao">Casos de Doença Diarreica Aguda por Equipe</h4>
        <table class="tabela-impressao tabela-mdda">
          <thead>
            <tr>
              <th rowspan="2">EQUIPE</th>
              <th colspan="6">FAIXA ETÁRIA (CASOS)</th>
              <th colspan="5">PLANO DE TRATAMENTO</th>
            </tr>
            <tr>
              <th>&lt;1</th>
              <th>1-4</th>
              <th>5-9</th>
              <th>10+</th>
              <th>Ing</th>
              <th>Total</th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>Ing</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipe in dadosRelatorio.resumoPorEquipe" :key="equipe.equipeId">
              <td>{{ equipe.equipeNome }}</td>
              <td>{{ equipe.casos.faixa_menor_1 }}</td>
              <td>{{ equipe.casos.faixa_1_a_4 }}</td>
              <td>{{ equipe.casos.faixa_5_a_9 }}</td>
              <td>{{ equipe.casos.faixa_10_mais }}</td>
              <td>{{ equipe.casos.faixa_ing }}</td>
              <td class="coluna-total">{{ equipe.casos.totalFaixaEtaria }}</td>
              <td>{{ equipe.casos.planoA }}</td>
              <td>{{ equipe.casos.planoB }}</td>
              <td>{{ equipe.casos.planoC }}</td>
              <td>{{ equipe.casos.plano_ing }}</td>
              <td class="coluna-total">{{ equipe.casos.totalPlanoTratamento }}</td>
            </tr>
          </tbody>
          <tfoot v-if="totaisConsolidados">
            <tr>
              <td>TOTAL GERAL</td>
              <td>{{ totaisConsolidados.faixa_menor_1 }}</td>
              <td>{{ totaisConsolidados.faixa_1_a_4 }}</td>
              <td>{{ totaisConsolidados.faixa_5_a_9 }}</td>
              <td>{{ totaisConsolidados.faixa_10_mais }}</td>
              <td>{{ totaisConsolidados.faixa_ing }}</td>
              <td class="coluna-total">{{ totaisConsolidados.totalFaixaEtaria }}</td>
              <td>{{ totaisConsolidados.planoA }}</td>
              <td>{{ totaisConsolidados.planoB }}</td>
              <td>{{ totaisConsolidados.planoC }}</td>
              <td>{{ totaisConsolidados.plano_ing }}</td>
              <td class="coluna-total">{{ totaisConsolidados.totalPlanoTratamento }}</td>
            </tr>
          </tfoot>
        </table>

        <div class="secao-obitos">
          <h4 class="titulo-secao-impressao">
            Óbitos por Doença Diarreica Aguda (Total Consolidado)
          </h4>
          <table class="tabela-impressao tabela-obitos">
            <thead>
              <tr>
                <th colspan="6">ÓBITOS POR FAIXA ETÁRIA</th>
              </tr>
              <tr>
                <th>&lt;1</th>
                <th>1-4</th>
                <th>5-9</th>
                <th>10+</th>
                <th>Ing</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ dadosRelatorio.totalObitos.faixa_menor_1 || 0 }}</td>
                <td>{{ dadosRelatorio.totalObitos.faixa_1_a_4 || 0 }}</td>
                <td>{{ dadosRelatorio.totalObitos.faixa_5_a_9 || 0 }}</td>
                <td>{{ dadosRelatorio.totalObitos.faixa_10_mais || 0 }}</td>
                <td>{{ dadosRelatorio.totalObitos.faixa_ing || 0 }}</td>
                <td class="coluna-total">
                  {{
                    (dadosRelatorio.totalObitos.faixa_menor_1 || 0) +
                    (dadosRelatorio.totalObitos.faixa_1_a_4 || 0) +
                    (dadosRelatorio.totalObitos.faixa_5_a_9 || 0) +
                    (dadosRelatorio.totalObitos.faixa_10_mais || 0) +
                    (dadosRelatorio.totalObitos.faixa_ing || 0)
                  }}
                </td>
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
import { ref, watch, onMounted, computed } from 'vue'
import { ServicoMDDA } from '@/modulos/enfermeiro/servicos/ServicoMDDA'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { FileSearch, Printer, ChevronDown } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'

const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)

const anoSelecionado = ref(new Date().getFullYear())
const anosDisponiveis = ref([])
const semanasDoAno = ref([])
const semanaKeySelecionada = ref(null)

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

// ADICIONADO: Propriedade computada para calcular o Total Geral
const totaisConsolidados = computed(() => {
  if (!dadosRelatorio.value || !dadosRelatorio.value.resumoPorEquipe) return null

  const totais = {
    faixa_menor_1: 0,
    faixa_1_a_4: 0,
    faixa_5_a_9: 0,
    faixa_10_mais: 0,
    faixa_ing: 0,
    planoA: 0,
    planoB: 0,
    planoC: 0,
    plano_ing: 0,
    totalFaixaEtaria: 0,
    totalPlanoTratamento: 0,
  }

  dadosRelatorio.value.resumoPorEquipe.forEach((equipe) => {
    for (const key in totais) {
      totais[key] += equipe.casos[key] || 0
    }
  })

  return totais
})

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function toggleTodasEquipes(event) {
  if (event.target.checked) {
    equipesSelecionadas.value = listaEquipes.value.map((e) => e.id)
  } else {
    equipesSelecionadas.value = []
  }
}

watch(anoSelecionado, (novoAno) => {
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(novoAno)
  semanaKeySelecionada.value = null
  dadosRelatorio.value = null
})

onMounted(async () => {
  anosDisponiveis.value = semanaEpidemiologicaUtils.getAnosDisponiveis()
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(anoSelecionado.value)
  const semanaAtual = semanaEpidemiologicaUtils.getSemanaAtual()
  if (semanaAtual) {
    anoSelecionado.value = parseInt(semanaAtual.chave.substring(0, 4))
    semanaKeySelecionada.value = semanaAtual.chave
  }

  listaEquipes.value = await servicoEquipes.buscarTodas()
})

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const promessas = equipesSelecionadas.value.map((equipeId) =>
      ServicoMDDA.carregarDados(semanaKeySelecionada.value, equipeId),
    )
    const resultados = await Promise.all(promessas)
    const relatoriosValidos = resultados.filter((r) => r)

    if (relatoriosValidos.length === 0) {
      erroBusca.value =
        'Nenhuma produção (rascunho ou finalizada) encontrada para as equipes na semana selecionada.'
      return
    }

    const resumoPorEquipe = []
    const totalObitos = {
      faixa_menor_1: 0,
      faixa_1_a_4: 0,
      faixa_5_a_9: 0,
      faixa_10_mais: 0,
      faixa_ing: 0,
    }

    relatoriosValidos.forEach((relatorio) => {
      const equipeInfo = listaEquipes.value.find((e) => e.id === relatorio.equipeId)

      const casosSomados = {
        faixa_menor_1: 0,
        faixa_1_a_4: 0,
        faixa_5_a_9: 0,
        faixa_10_mais: 0,
        faixa_ing: 0,
        planoA: 0,
        planoB: 0,
        planoC: 0,
        plano_ing: 0,
      }
      if (relatorio.microareas) {
        relatorio.microareas.forEach((ma) => {
          for (const key in casosSomados) {
            casosSomados[key] += ma[key] || 0
          }
        })
      }
      casosSomados.totalFaixaEtaria =
        casosSomados.faixa_menor_1 +
        casosSomados.faixa_1_a_4 +
        casosSomados.faixa_5_a_9 +
        casosSomados.faixa_10_mais +
        casosSomados.faixa_ing
      casosSomados.totalPlanoTratamento =
        casosSomados.planoA + casosSomados.planoB + casosSomados.planoC + casosSomados.plano_ing

      resumoPorEquipe.push({
        equipeId: relatorio.equipeId,
        equipeNome: equipeInfo ? equipeInfo.nome : 'Desconhecida',
        casos: casosSomados,
      })

      if (relatorio.obitos) {
        for (const key in totalObitos) {
          totalObitos[key] += relatorio.obitos[key] || 0
        }
      }
    })

    dadosRelatorio.value = { resumoPorEquipe, totalObitos }
  } catch (error) {
    console.error('Erro ao consolidar relatório:', error)
    erroBusca.value = 'Ocorreu um erro ao buscar e consolidar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}

const semanaInfo = computed(() => {
  if (!semanaKeySelecionada.value) return null
  return semanaEpidemiologicaUtils
    .getCalendario(anoSelecionado.value)
    .find((s) => s.chave === semanaKeySelecionada.value)
})
</script>

<style scoped>
/* A MUDANÇA ESTÁ AQUI */
@page {
  size: A4 landscape;
  margin: 1.5cm;
}
.card-filtros {
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
  width: 29.7cm;
  min-height: 21cm;
  padding: 1.5cm;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  position: relative;
}
.borda-impressao {
  border: 1px solid #333;
}
.cabecalho-impressao {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
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
.titulo-secao-impressao {
  font-size: 9pt;
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: bold;
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
.tabela-impressao tfoot td {
  font-weight: bold;
  background-color: #e2e8f0;
} /* Estilo para o rodapé da tabela */
.tabela-mdda td:first-child {
  text-align: left;
  font-weight: bold;
}
.coluna-total {
  font-weight: bold;
  background-color: #f2f2f2;
}
.secao-obitos {
  margin-top: 2rem;
}
.tabela-obitos {
  font-size: 9pt;
  max-width: 600px;
  margin: 1rem auto 0 auto;
}
.rodape-impressao {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
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
.marca-dagua {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 8rem;
  color: rgba(255, 0, 0, 0.15);
  font-weight: bold;
  z-index: 1;
  pointer-events: none;
}
.mensagem-feedback.erro {
  color: #b91c1c;
  background-color: #fee2e2;
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
  .marca-dagua {
    color: rgba(0, 0, 0, 0.1) !important;
  }
  .rodape-impressao {
    margin-top: 2rem;
  }
}
</style>
