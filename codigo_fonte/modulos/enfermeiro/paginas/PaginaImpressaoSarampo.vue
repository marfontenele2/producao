<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Controle de Sarampo/Rubéola</h1>
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
        <h4>Plano de Erradicação do Sarampo e Controle de Rubéola</h4>
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
        <h4 class="titulo-secao-impressao">
          DADOS COMPLEMENTARES DOS CASOS NOTIFICADOS NA SEMANA:
        </h4>
        <table class="tabela-impressao tabela-sarampo">
          <thead>
            <tr>
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
              <td colspan="12">Nenhum caso registrado nesta semana.</td>
            </tr>
            <tr v-for="(caso, index) in dadosRelatorio.casos" :key="index">
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

        <div class="resumo-impressao">
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
                <td>{{ dadosRelatorio.resumo?.notificadosSarampoSemana || 0 }}</td>
                <td>{{ dadosRelatorio.resumo?.notificadosRubeolaSemana || 0 }}</td>
              </tr>
              <tr>
                <td><strong>Número de Casos Acumulados até esta semana</strong></td>
                <td>{{ dadosRelatorio.resumo?.acumuladosSarampo || 0 }}</td>
                <td>{{ dadosRelatorio.resumo?.acumuladosRubeola || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer class="rodape-impressao">
        <div class="assinatura">
          <p class="linha-assinatura">_________________________________________</p>
          <p>Responsável pela Notificação: {{ storeUsuario.usuario?.nome || 'N/A' }}</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { ServicoSarampo } from '../servicos/ServicoSarampo'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'
import { FileSearch, Printer } from 'lucide-vue-next'
// MODIFICADO: Import do componente de logo
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'

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
    const dados = await ServicoSarampo.carregarDados(semanaKeySelecionada.value, equipeId)

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

const formatarData = (data) =>
  data ? new Date(data + 'T00:00:00Z').toLocaleDateString('pt-BR') : 'N/A'
const formatarSuspeito = (val) =>
  ({ S: 'Sarampo', R: 'Rubéola', D: 'Dengue', OE: 'Outras' })[val] || 'N/A'
const formatarBloqueio = (val) =>
  ({ RE: 'Realizado', NR: 'Não Realizado', NI: 'Não Indicado' })[val] || 'N/A'
const formatarDiagFinal = (val) => ({ SR: 'Soro Reagente', SNR: 'Soro Não Reagente' })[val] || 'N/A'
</script>

<style scoped>
/* A MUDANÇA ESTÁ AQUI */
@page {
  size: A4 landscape;
  margin: 1.5cm;
}
/* Estilos dos filtros permanecem os mesmos */
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
  min-width: 250px;
}

/* MODIFICADO: Removido 'display: flex' para o rodapé fluir naturalmente */
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
.cabecalho-impressao h3 {
  margin-top: 0.5rem;
  font-size: 11pt;
}
.cabecalho-impressao h4 {
  margin-top: 1rem;
  font-size: 10pt;
  font-weight: normal;
}
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  text-align: left;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
}

/* MODIFICADO: Removido 'flex-grow: 1' */
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
  font-size: 7pt;
}
.tabela-impressao th,
.tabela-impressao td {
  border: 1px solid #333;
  padding: 2px 4px;
  text-align: center;
}
.tabela-impressao th {
  background-color: #f2f2f2;
}
.tabela-sarampo td:nth-child(2) {
  text-align: left;
  width: 20%;
}
.resumo-impressao {
  margin-top: 2rem;
}
.tabela-resumo {
  font-size: 9pt;
  max-width: 500px;
}
.tabela-resumo td:first-child {
  text-align: left;
  font-weight: bold;
}

/* MODIFICADO: Adicionado 'margin-top: auto' para empurrar para o final somente se houver espaço */
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
  } /* Garante um espaçamento mínimo na impressão */
}
</style>
