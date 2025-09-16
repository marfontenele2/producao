<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão Consolidada: Notificação Semanal</h1>
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
        <h3>NOTIFICAÇÃO SEMANAL DE DOENÇAS - CONSOLIDADO</h3>
        <div class="info-cabecalho-grid">
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Semana:</strong> {{ semanaInfo?.semana }}</span>
          <span><strong>Ano:</strong> {{ anoSelecionado }}</span>
        </div>
      </header>
      <main class="corpo-impressao">
        <h4 class="titulo-secao-impressao">Notificações</h4>
        <div class="secao-notificacoes">
          <div class="item-notificacao">
            <span class="label">Houve notificação de Tétano Neonatal?</span>
            <span class="valor"
              >{{ dadosRelatorio.tetanoNeonatal.sim }} SIM /
              {{ dadosRelatorio.tetanoNeonatal.nao }} NÃO</span
            >
          </div>
          <div class="item-notificacao">
            <span class="label">Houve notificação de Paralisia Flácida Aguda?</span>
            <span class="valor"
              >{{ dadosRelatorio.paralisiaFlacida.sim }} SIM /
              {{ dadosRelatorio.paralisiaFlacida.nao }} NÃO</span
            >
          </div>
          <div class="item-notificacao">
            <span class="label">Total de casos suspeitos de Sarampo notificados:</span>
            <span class="valor">{{ dadosRelatorio.casosSuspeitosSarampo }}</span>
          </div>
        </div>

        <h4 class="titulo-secao-impressao" v-if="dadosRelatorio.casosParalisia.length > 0">
          Casos de Paralisia Flácida Aguda Notificados (Consolidado)
        </h4>
        <table v-if="dadosRelatorio.casosParalisia.length > 0" class="tabela-impressao">
          <thead>
            <tr>
              <th>Equipe</th>
              <th>Nome do Paciente</th>
              <th>Data de Nascimento</th>
              <th>Data da Notificação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(caso, index) in dadosRelatorio.casosParalisia" :key="index">
              <td>{{ caso.equipeNome }}</td>
              <td>{{ caso.nome }}</td>
              <td>{{ formatarData(caso.dataNascimento) }}</td>
              <td>{{ formatarData(caso.dataNotificacao) }}</td>
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
import { ServicoNotificacaoSemanal } from '@/modulos/enfermeiro/servicos/ServicoNotificacaoSemanal'
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
      ServicoNotificacaoSemanal.carregarDados(semanaKeySelecionada.value, equipeId),
    )
    const resultados = await Promise.all(promessas)
    const relatoriosValidos = resultados.filter((r) => r)

    if (relatoriosValidos.length === 0) {
      erroBusca.value = 'Nenhuma produção encontrada para as equipes na semana selecionada.'
      return
    }

    const consolidado = {
      tetanoNeonatal: { sim: 0, nao: 0 },
      paralisiaFlacida: { sim: 0, nao: 0 },
      casosSuspeitosSarampo: 0,
      casosParalisia: [],
      finalizado: relatoriosValidos.every((r) => r.finalizado),
    }

    relatoriosValidos.forEach((relatorio) => {
      relatorio.tetanoNeonatal ? consolidado.tetanoNeonatal.sim++ : consolidado.tetanoNeonatal.nao++
      relatorio.paralisiaFlacida
        ? consolidado.paralisiaFlacida.sim++
        : consolidado.paralisiaFlacida.nao++
      consolidado.casosSuspeitosSarampo += relatorio.casosSuspeitosSarampo || 0

      if (relatorio.casosParalisia) {
        const equipeInfo = listaEquipes.value.find((e) => e.id === relatorio.equipeId)
        relatorio.casosParalisia.forEach((caso) => {
          consolidado.casosParalisia.push({
            ...caso,
            equipeNome: equipeInfo ? equipeInfo.nome : 'N/A',
          })
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
</script>

<style scoped>
/* Importa os estilos centrais e define a orientação da página */
@import url('@/nucleo/estilos/estilosDeImpressaoAdmin.css');

@page {
  size: A4 portrait;
  margin: 1.5cm;
}

.pagina-a4 {
  width: 21cm;
  min-height: 29.7cm;
}
.info-cabecalho-grid {
  grid-template-columns: 1fr 1fr 1fr;
}
.secao-notificacoes {
  margin-bottom: 1.5rem;
}
.item-notificacao {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px dashed #eee;
  font-size: 10pt;
}
.tabela-impressao {
  font-size: 9pt;
}
</style>
