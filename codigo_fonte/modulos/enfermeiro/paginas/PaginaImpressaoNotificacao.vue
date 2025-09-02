<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Notificação Semanal</h1>
      </header>
      <div class="card-filtros">
        <div class="campo">
          <label for="ano">Selecione o Ano</label>
          <select id="ano" v-model="anoSelecionado" class="input-padrao">
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>
        <div class="campo">
          <label for="semana">Selecione a Semana Epidemiológica</label>
          <select
            id="semana"
            v-model="semanaKeySelecionada"
            :disabled="!anoSelecionado"
            class="input-padrao"
          >
            <option :value="null" disabled>Selecione uma semana</option>
            <option v-for="semana in semanasDoAno" :key="semana.chave" :value="semana.chave">
              {{ semana.display }}
            </option>
          </select>
        </div>
        <button
          class="botao botao-primario"
          @click="gerarRelatorio"
          :disabled="!semanaKeySelecionada || buscando"
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
        <h3>NOTIFICAÇÃO SEMANAL DE DOENÇAS</h3>
        <div class="info-cabecalho-grid">
          <span><strong>UBS:</strong> {{ storeUsuario.usuario?.nomeUbs || 'N/A' }}</span>
          <span><strong>Equipe:</strong> {{ storeUsuario.usuario?.nomeEquipe || 'N/A' }}</span>
          <span><strong>Semana:</strong> {{ semanaInfo?.semana }}</span>
          <span><strong>Ano:</strong> {{ anoSelecionado }}</span>
        </div>
      </header>
      <main class="corpo-impressao">
        <div class="item-relatorio">
          <span>Houve notificação de Tétano Neonatal?</span>
          <strong>{{ dadosRelatorio.tetanoNeonatal ? 'SIM' : 'NÃO' }}</strong>
        </div>
        <div class="item-relatorio">
          <span>Houve notificação de Paralisia Flácida Aguda?</span>
          <strong>{{ dadosRelatorio.paralisiaFlacida ? 'SIM' : 'NÃO' }}</strong>
        </div>
        <div class="item-relatorio">
          <span>Número de casos suspeitos de Sarampo notificados:</span>
          <strong>{{ dadosRelatorio.casosSuspeitosSarampo }}</strong>
        </div>

        <h4
          class="titulo-tabela"
          v-if="dadosRelatorio.casosParalisia && dadosRelatorio.casosParalisia.length > 0"
        >
          Casos de Paralisia Flácida Aguda Notificados
        </h4>
        <table
          v-if="dadosRelatorio.casosParalisia && dadosRelatorio.casosParalisia.length > 0"
          class="tabela-impressao"
        >
          <thead>
            <tr>
              <th>Nome do Paciente</th>
              <th>Data de Nascimento</th>
              <th>Data da Notificação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(caso, index) in dadosRelatorio.casosParalisia" :key="index">
              <td>{{ caso.nome }}</td>
              <td>
                {{ new Date(caso.dataNascimento + 'T00:00:00Z').toLocaleDateString('pt-BR') }}
              </td>
              <td>
                {{ new Date(caso.dataNotificacao + 'T00:00:00Z').toLocaleDateString('pt-BR') }}
              </td>
            </tr>
          </tbody>
        </table>
      </main>
      <footer class="rodape-impressao">
        <div class="assinatura">
          <p class="linha-assinatura">_________________________________________</p>
          <p>Responsável: {{ storeUsuario.usuario?.nome || 'N/A' }}</p>
        </div>
        <p>Data da Emissão: {{ new Date().toLocaleDateString('pt-BR') }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { ServicoNotificacaoSemanal } from '../servicos/ServicoNotificacaoSemanal'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'
import { FileSearch, Printer } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue' // IMPORTADO AQUI

const storeUsuario = useStoreUsuario()
const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)

const anoSelecionado = ref(new Date().getFullYear())
const anosDisponiveis = ref([])
const semanasDoAno = ref([])
const semanaKeySelecionada = ref(null)

const semanaInfo = computed(() => {
  if (!semanaKeySelecionada.value) return null
  return semanaEpidemiologicaUtils
    .getCalendario(anoSelecionado.value)
    .find((s) => s.chave === semanaKeySelecionada.value)
})

watch(anoSelecionado, (novoAno) => {
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(novoAno)
  semanaKeySelecionada.value = null
  dadosRelatorio.value = null
})

onMounted(() => {
  anosDisponiveis.value = semanaEpidemiologicaUtils.getAnosDisponiveis()
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(anoSelecionado.value)
  const semanaAtual = semanaEpidemiologicaUtils.getSemanaAtual()
  if (semanaAtual) {
    anoSelecionado.value = parseInt(semanaAtual.chave.substring(0, 4))
    semanaKeySelecionada.value = semanaAtual.chave
  }
})

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const equipeId = storeUsuario.usuario?.equipeId
    if (!equipeId) throw new Error('ID da equipe não encontrado.')
    const dados = await ServicoNotificacaoSemanal.carregarDados(
      semanaKeySelecionada.value,
      equipeId,
    )

    if (dados) {
      dadosRelatorio.value = dados
    } else {
      erroBusca.value =
        'Nenhuma produção (rascunho ou finalizada) encontrada para a equipe na semana selecionada.'
    }
  } catch (error) {
    console.error(error)
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}
</script>

<style scoped>
/* Estilos para o card de filtros */
.card-filtros {
  display: flex;
  align-items: flex-end; /* Alinha os itens na base */
  gap: 1rem; /* Espaçamento entre os campos/botões */
  flex-wrap: wrap; /* Permite quebrar linha em telas menores */
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.card-filtros .campo label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
  color: var(--cor-texto-principal);
}

.card-filtros .input-padrao {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
  min-width: 180px; /* Garante que os selects não fiquem muito pequenos */
  height: 38px; /* Altura padrão para inputs e selects */
  background-color: var(--cor-fundo-input);
  color: var(--cor-texto-principal);
}

.card-filtros .botao {
  height: 38px; /* Altura padrão para botões */
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estilos de impressão */
.pagina-a4 {
  background: white;
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
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
.cabecalho-impressao h3 {
  margin-top: 1rem;
  font-size: 14pt;
}
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  text-align: left;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  flex-grow: 1;
  padding-top: 2rem;
  font-size: 11pt;
}
.item-relatorio {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dotted #ccc;
}
.titulo-tabela {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  font-size: 12pt;
}
.tabela-impressao {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
}
.tabela-impressao th,
.tabela-impressao td {
  border: 1px solid #333;
  padding: 5px;
  text-align: left;
}
.rodape-impressao {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 3rem;
  font-size: 10pt;
}
.assinatura {
  text-align: center;
}
.linha-assinatura {
  margin-bottom: 5px;
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
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}
@media print {
  .no-print {
    display: none !important;
  }
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    border: none;
  }
  .marca-dagua {
    color: rgba(0, 0, 0, 0.1) !important;
  }
}
</style>
