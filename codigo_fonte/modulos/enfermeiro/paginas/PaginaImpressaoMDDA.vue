<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Relatório Semanal (MDDA)</h1>
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
        <div class="campo">
          <label for="profissional">Nome do Profissional (para assinatura)</label>
          <input
            type="text"
            id="profissional"
            v-model="nomeProfissional"
            placeholder="Enfermeiro(a)..."
            class="input-padrao"
          />
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
        <div class="cabecalho-logo-titulo">
          <img src="/logo.png" alt="Logo Granja" class="logo-impressao" />
          <h3>MONITORIZAÇÃO DAS DOENÇAS DIARREICAS AGUDAS (MDDA)</h3>
        </div>
        <p><strong>SECRETARIA DA SAÚDE DO ESTADO DO CEARÁ</strong></p>
        <p>Coordenadoria de Políticas em Saúde / Célula de Informação em Saúde</p>
        <div class="info-cabecalho-grid">
          <span
            ><strong>Unidade Básica de Saúde:</strong>
            {{ storeUsuario.usuario?.nomeUbs || 'N/A' }}</span
          >
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Semana Epidemiológica:</strong> {{ semanaInfo?.semana }}</span>
          <span
            ><strong>Ano Epidemiológico:</strong>
            {{ semanaInfo ? semanaInfo.chave.substring(0, 4) : '' }}</span
          >
        </div>
      </header>

      <main class="corpo-impressao">
        <table class="tabela-impressao tabela-mdda">
          <thead>
            <tr>
              <th rowspan="2">MICROAREA</th>
              <th colspan="6">FAIXA ETÁRIA</th>
              <th colspan="5">PLANO DE TRATAMENTO</th>
              <th colspan="4">SURTOS</th>
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
              <th>Num</th>
              <th>Invest.</th>
              <th>Não</th>
              <th>Inform</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dadosRelatorio.microareas" :key="item.id">
              <td>{{ item.numero }}</td>
              <td>{{ item.faixa_menor_1 || 0 }}</td>
              <td>{{ item.faixa_1_a_4 || 0 }}</td>
              <td>{{ item.faixa_5_a_9 || 0 }}</td>
              <td>{{ item.faixa_10_mais || 0 }}</td>
              <td>{{ item.faixa_ing || 0 }}</td>
              <td class="coluna-total">
                {{
                  (item.faixa_menor_1 || 0) +
                  (item.faixa_1_a_4 || 0) +
                  (item.faixa_5_a_9 || 0) +
                  (item.faixa_10_mais || 0) +
                  (item.faixa_ing || 0)
                }}
              </td>
              <td>{{ item.planoA || 0 }}</td>
              <td>{{ item.planoB || 0 }}</td>
              <td>{{ item.planoC || 0 }}</td>
              <td>{{ item.plano_ing || 0 }}</td>
              <td class="coluna-total">
                {{
                  (item.planoA || 0) +
                  (item.planoB || 0) +
                  (item.planoC || 0) +
                  (item.plano_ing || 0)
                }}
              </td>
              <td>{{ item.surto_num || 0 }}</td>
              <td>{{ item.surto_invest || 0 }}</td>
              <td>{{ item.surto_nao || 0 }}</td>
              <td>{{ item.surto_inform || 0 }}</td>
            </tr>
          </tbody>
        </table>

        <div class="secao-obitos">
          <p>
            <strong>1) Ocorreu óbito por diarreia?</strong> ({{
              dadosRelatorio.obitos.ocorreu === 'sim' ? 'X' : ' '
            }}) SIM ({{ dadosRelatorio.obitos.ocorreu === 'nao' ? 'X' : ' ' }}) NÃO
          </p>
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
                <td>{{ dadosRelatorio.obitos.faixa_menor_1 || 0 }}</td>
                <td>{{ dadosRelatorio.obitos.faixa_1_a_4 || 0 }}</td>
                <td>{{ dadosRelatorio.obitos.faixa_5_a_9 || 0 }}</td>
                <td>{{ dadosRelatorio.obitos.faixa_10_mais || 0 }}</td>
                <td>{{ dadosRelatorio.obitos.faixa_ing || 0 }}</td>
                <td class="coluna-total">
                  {{
                    (dadosRelatorio.obitos.faixa_menor_1 || 0) +
                    (dadosRelatorio.obitos.faixa_1_a_4 || 0) +
                    (dadosRelatorio.obitos.faixa_5_a_9 || 0) +
                    (dadosRelatorio.obitos.faixa_10_mais || 0) +
                    (dadosRelatorio.obitos.faixa_ing || 0)
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer class="rodape-impressao">
        <div class="assinatura">
          <p class="linha-assinatura">___________________________________________________</p>
          <p>Responsável: {{ nomeProfissional || storeUsuario.usuario?.nome || 'N/A' }}</p>
        </div>
        <div class="data-emissao">
          <p>Data da Emissão: {{ new Date().toLocaleDateString('pt-BR') }}</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { ServicoMDDA } from '../servicos/ServicoMDDA'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)
const nomeProfissional = ref('')

const anoSelecionado = ref(new Date().getFullYear())
const anosDisponiveis = ref([])
const semanasDoAno = ref([])
const semanaKeySelecionada = ref(null)

const semanaInfo = computed(() => {
  if (!semanaKeySelecionada.value) return null
  const cal = semanaEpidemiologicaUtils.getCalendario(anoSelecionado.value)
  const sem = cal.find((s) => s.chave === semanaKeySelecionada.value)
  if (sem) {
    sem.ano = anoSelecionado.value
  }
  return sem
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
  nomeProfissional.value = storeUsuario.usuario?.nome || ''
})

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const equipeId = storeUsuario.usuario?.equipeId
    if (!equipeId) throw new Error('ID da equipe não encontrado.')

    const dados = await ServicoMDDA.carregarDados(semanaKeySelecionada.value, equipeId)

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
/* Estilos dos campos de filtro e botões */
.card-filtros {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
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
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
  min-width: 220px;
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
.cabecalho-impressao p {
  margin: 2px 0;
  font-size: 11pt;
}
.cabecalho-impressao h3 {
  margin-top: 1rem;
  font-size: 12pt;
}
.cabecalho-logo-titulo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}
.logo-impressao {
  height: 60px;
}
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  text-align: left;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  flex-grow: 1;
  padding-top: 1rem;
}
.tabela-impressao {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  margin-top: 1rem;
}
.tabela-impressao th,
.tabela-impressao td {
  border: 1px solid #333;
  padding: 3px;
  text-align: center;
}
.tabela-impressao th {
  background-color: #f2f2f2;
}
.tabela-mdda th:first-child,
.tabela-mdda td:first-child {
  text-align: left;
  padding-left: 5px;
}
.coluna-total {
  font-weight: bold;
  background-color: #f2f2f2;
}
.secao-obitos {
  margin-top: 2rem;
}
.secao-obitos p {
  font-size: 10pt;
}
.tabela-obitos {
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
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
  width: 100%;
}
.linha-assinatura {
  display: block;
  width: 70%;
  margin: 0 auto 5px auto;
}
.mensagem-feedback {
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  font-weight: 500;
  border-radius: 8px;
}
.erro {
  color: #b91c1c;
  background-color: #fee2e2;
}
.marca-dagua {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 10rem;
  color: rgba(255, 0, 0, 0.15);
  font-weight: bold;
  z-index: 1;
  pointer-events: none;
  text-transform: uppercase;
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
}
</style>
