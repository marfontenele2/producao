<template>
  <div>
    <div class="no-print pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Educação Permanente</h1>
      </header>
      <div class="card-filtros">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label>
          <input type="month" id="competencia" v-model="competencia" />
        </div>
        <button
          class="botao botao-primario"
          @click="gerarRelatorio"
          :disabled="!competencia || buscando"
        >
          <FileSearch :size="18" /> {{ buscando ? 'Buscando...' : 'Gerar Relatório' }}
        </button>
        <button
          class="botao"
          @click="imprimirPagina"
          :disabled="!relatorio || relatorio.length === 0"
        >
          <Printer :size="18" /> Imprimir
        </button>
      </div>
    </div>

    <div v-if="erro" class="no-print pagina-container">
      <p style="text-align: center; color: var(--cor-erro)">{{ erro }}</p>
    </div>

    <div v-if="relatorio" id="area-impressao">
      <div v-for="(atividade, index) in relatorio" :key="atividade.id" class="pagina-a4-retrato">
        <header class="cabecalho-impressao">
          <img src="/logo.png" alt="Logo" class="logo-impressao" />
          <div class="titulo-impressao">
            <h2>ATENÇÃO PRIMÁRIA</h2>
            <h1>EDUCAÇÃO PERMANENTE – VISA SAÚDE</h1>
          </div>
          <div class="pagina-info">Página {{ index + 1 }} de {{ relatorio.length }}</div>
        </header>
        <main class="conteudo-impressao">
          <div class="grid-impressao">
            <div class="campo-impressao span-6"><strong>UBS:</strong> {{ atividade.ubs }}</div>
            <div class="campo-impressao span-6"><strong>LOCAL:</strong> {{ atividade.local }}</div>
            <div class="campo-impressao span-4">
              <strong>DATA:</strong> {{ formatarData(atividade.data) }}
            </div>
            <div class="campo-impressao span-2">
              <strong>HORÁRIO:</strong> {{ atividade.horario || 'N/D' }}
            </div>
            <div class="campo-impressao span-6">
              <strong>PALESTRANTE(S):</strong> {{ atividade.palestrante }}
            </div>
            <div class="campo-impressao span-12">
              <strong>PÚBLICO ALVO:</strong> {{ atividade.publicoAlvo }}
            </div>
          </div>
          <div class="secao-impressao">
            <h3>TEMAS</h3>
            <p>{{ atividade.temas }}</p>
          </div>
          <div class="secao-impressao">
            <h3>OBJETIVOS</h3>
            <p>{{ atividade.objetivos }}</p>
          </div>
          <div class="secao-impressao">
            <h3>CONTEÚDO</h3>
            <p>{{ atividade.conteudo }}</p>
          </div>
        </main>
        <footer class="rodape-impressao">
          <p>Rua Pessoa Anta, 730 - Centro - CEP: 62.430-000</p>
          <p>Fone: (88) 3624-1164 GRANJA-CE-BRASIL</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoEducacaoPermanente } from '@/modulos/enfermeiro/servicos/ServicoEducacaoPermanente.js'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const competencia = ref('')
const buscando = ref(false)
const relatorio = ref(null)
const erro = ref('')

function formatarData(dataString) {
  if (!dataString) return '--/--/----'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

async function gerarRelatorio() {
  buscando.value = true
  relatorio.value = null
  erro.value = ''
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoEducacaoPermanente.buscarDados(competencia.value, equipeId)
    if (dados && dados.length > 0) {
      relatorio.value = dados
    } else {
      erro.value =
        'Nenhum registro de Educação Permanente encontrado para a competência selecionada.'
    }
  } catch (e) {
    console.error(e)
    erro.value = 'Ocorreu uma falha ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}
</script>

<style scoped>
@media print {
  @page {
    size: portrait;
    margin: 1.5cm;
  }
  body {
    background-color: #fff;
  }
}
.pagina-a4-retrato {
  background: white;
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  font-family: Arial, sans-serif;
  font-size: 11pt;
  box-sizing: border-box;
  /* [NOVO] Estilos para paginação */
  page-break-after: always;
  page-break-inside: avoid;
}
.pagina-a4-retrato:last-child {
  page-break-after: auto; /* Evita uma página em branco no final */
}

.cabecalho-impressao {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 2px solid black;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  position: relative; /* Para posicionar o contador de página */
}
.logo-impressao {
  height: 70px;
}
.titulo-impressao {
  text-align: center;
  flex-grow: 1;
}
.titulo-impressao h1 {
  margin: 0;
  font-size: 1.2rem;
}
.titulo-impressao h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: normal;
}
.pagina-info {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 10pt;
  font-weight: bold;
}

.grid-impressao {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1.5rem;
}
.campo-impressao {
  line-height: 1.5;
}
.campo-impressao strong {
  margin-right: 8px;
}
.span-2 {
  grid-column: span 2;
}
.span-4 {
  grid-column: span 4;
}
.span-6 {
  grid-column: span 6;
}
.span-12 {
  grid-column: span 12;
}
.secao-impressao {
  margin-bottom: 1.5rem;
}
.secao-impressao h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #eee;
}
.secao-impressao p {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  text-align: justify;
}
.rodape-impressao {
  text-align: center;
  font-size: 9pt;
  color: #555;
  border-top: 1px solid #ccc;
  padding-top: 1rem;
  margin-top: 2rem;
}
.rodape-impressao p {
  margin: 2px 0;
}
</style>
