<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão Consolidada: Controle de Sarampo</h1>
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
      <div v-if="!dadosRelatorio.finalizado" class="marca-dagua">RASCUNHO</div>
      <header class="cabecalho-impressao">
        <LogoCabecalhoImpressao />
        <h4>Plano de Erradicação do Sarampo e Controle de Rubéola - CONSOLIDADO</h4>
        <h3>
          Ficha de Atualização Semanal da Classificação dos Casos Notificados de Sarampo/Rubéola
        </h3>
        <div class="info-cabecalho-grid">
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Semana de Notificação:</strong> {{ semanaInfo?.semana }}</span>
          <span><strong>Ano:</strong> {{ anoSelecionado }}</span>
        </div>
      </header>
      <main class="corpo-impressao">
        <h4 class="titulo-secao-impressao">RESUMO CONSOLIDADO:</h4>
        <table class="tabela-impressao tabela-resumo">
          <thead>
            <tr>
              <th></th>
              <th>Sarampo</th>
              <th>Rubéola</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Número de casos notificados nesta semana</strong></td>
              <td>{{ dadosRelatorio.resumo.notificadosSarampoSemana }}</td>
              <td>{{ dadosRelatorio.resumo.notificadosRubeolaSemana }}</td>
            </tr>
            <tr>
              <td><strong>Número de Casos Acumulados até esta semana</strong></td>
              <td>{{ dadosRelatorio.resumo.acumuladosSarampo }}</td>
              <td>{{ dadosRelatorio.resumo.acumuladosRubeola }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="titulo-secao-impressao">CASOS NOTIFICADOS (CONSOLIDADO):</h4>
        <table class="tabela-impressao tabela-sarampo">
          <thead>
            <tr>
              <th>Equipe</th>
              <th>SINAN Nº</th>
              <th>Nome</th>
              <th>Idade</th>
              <th>Suspeito</th>
              <th>Data Not.</th>
              <th>Data Inves.</th>
              <th>Bloqueio</th>
              <th>Data Início Exantema</th>
              <th>Data Coleta Soro</th>
              <th>Data Envio LACEN</th>
              <th>Data Receb. LACEN</th>
              <th>Diag. Final</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!dadosRelatorio.casos || dadosRelatorio.casos.length === 0">
              <td colspan="13">
                Nenhum caso registrado para as equipes selecionadas nesta semana.
              </td>
            </tr>
            <tr v-for="(caso, index) in dadosRelatorio.casos" :key="index">
              <td>{{ caso.equipeNome }}</td>
              <td>{{ caso.sinan }}</td>
              <td>{{ caso.nome }}</td>
              <td>{{ caso.idade }}</td>
              <td>{{ formatarSuspeito(caso.suspeito) }}</td>
              <td>{{ formatarData(caso.dataNotificacao) }}</td>
              <td>{{ formatarData(caso.dataInvestigacao) }}</td>
              <td>{{ formatarBloqueio(caso.bloqueio) }}</td>
              <td>{{ formatarData(caso.dataInicioExantema) }}</td>
              <td>{{ formatarData(caso.dataColetaSoro) }}</td>
              <td>{{ formatarData(caso.dataEnvioLacen) }}</td>
              <td>{{ formatarData(caso.dataRecebLacen) }}</td>
              <td>{{ formatarDiagFinal(caso.diagFinal) }}</td>
            </tr>
          </tbody>
        </table>
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
import { ref, watch, computed, onMounted } from 'vue'
import { ServicoSarampo } from '@/modulos/enfermeiro/servicos/ServicoSarampo'
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
const semanaInfo = computed(() => {
  if (!semanaKeySelecionada.value) return null
  return semanaEpidemiologicaUtils
    .getCalendario(anoSelecionado.value)
    .find((s) => s.chave === semanaKeySelecionada.value)
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
      ServicoSarampo.carregarDados(semanaKeySelecionada.value, equipeId),
    )
    const resultados = await Promise.all(promessas)
    const relatoriosValidos = resultados.filter((r) => r)

    if (relatoriosValidos.length === 0) {
      erroBusca.value = 'Nenhuma produção encontrada para as equipes na semana selecionada.'
      return
    }

    const consolidado = {
      resumo: {
        notificadosSarampoSemana: 0,
        acumuladosSarampo: 0,
        notificadosRubeolaSemana: 0,
        acumuladosRubeola: 0,
      },
      casos: [],
      finalizado: relatoriosValidos.every((r) => r.finalizado),
    }

    relatoriosValidos.forEach((relatorio) => {
      if (relatorio.resumo) {
        for (const key in consolidado.resumo) {
          consolidado.resumo[key] += relatorio.resumo[key] || 0
        }
      }
      if (relatorio.casos) {
        const equipeInfo = listaEquipes.value.find((e) => e.id === relatorio.equipeId)
        relatorio.casos.forEach((caso) => {
          consolidado.casos.push({ ...caso, equipeNome: equipeInfo ? equipeInfo.nome : 'N/A' })
        })
      }
    })
    dadosRelatorio.value = consolidado
  } catch (error) {
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}
const formatarData = (data) =>
  data ? new Date(data + 'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A'
const formatarSuspeito = (val) =>
  ({ S: 'Sarampo', R: 'Rubéola', D: 'Dengue', OE: 'Outras' })[val] || 'N/A'
const formatarBloqueio = (val) =>
  ({ RE: 'Realizado', NR: 'Não Realizado', NI: 'Não Indicado' })[val] || 'N/A'
const formatarDiagFinal = (val) => ({ SR: 'Soro Reagente', SNR: 'Soro Não Reagente' })[val] || 'N/A'
</script>

<style scoped>
/* Importa os estilos centrais e define a orientação da página */
@import url('@/nucleo/estilos/estilosDeImpressaoAdmin.css');

@page {
  size: A4 landscape;
  margin: 1.5cm;
}

.pagina-a4 {
  width: 29.7cm;
  min-height: 21cm;
}
.tabela-sarampo td:nth-child(2) {
  text-align: left;
  width: 20%;
}
.tabela-resumo {
  font-size: 9pt;
  max-width: 500px;
}
.tabela-resumo td:first-child {
  text-align: left;
  font-weight: bold;
}
</style>
