<template>
  <div>
    <div class="no-print pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Acompanhamento de Gestantes</h1>
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
        <button class="botao" @click="imprimirPagina" :disabled="!relatorio">
          <Printer :size="18" /> Imprimir
        </button>
      </div>
    </div>

    <div v-if="erro" class="no-print pagina-container">
      <p style="text-align: center; color: var(--cor-erro)">{{ erro }}</p>
    </div>

    <div v-if="relatorio" id="area-impressao">
      <div class="pagina-a4-retrato">
        <header class="cabecalho-impressao">
          <img src="/logo.png" alt="Logo do Sistema" class="logo-impressao" />
          <div class="titulo-container">
            <h3>CONSOLIDADO MENSAL DE GESTANTES</h3>
            <div class="info-cabecalho">
              <span><strong>Competência:</strong> {{ competenciaFormatada }}</span>
              <span><strong>UBS:</strong> {{ storeUsuario.usuario?.nomeUbs }}</span>
              <span><strong>Equipe:</strong> {{ storeUsuario.usuario?.nomeEquipe }}</span>
            </div>
          </div>
        </header>
        <main class="conteudo-impressao">
          <table class="tabela-padrao">
            <thead>
              <tr>
                <th>Nível de Risco</th>
                <th>Total</th>
                <th>Branca</th>
                <th>Parda</th>
                <th>Preta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Risco Habitual</td>
                <td>{{ relatorio.riscoHabitual.total }}</td>
                <td>{{ relatorio.riscoHabitual.branca }}</td>
                <td>{{ relatorio.riscoHabitual.parda }}</td>
                <td>{{ relatorio.riscoHabitual.preta }}</td>
              </tr>
              <tr>
                <td>Risco Intermediário</td>
                <td>{{ relatorio.riscoIntermediario.total }}</td>
                <td>{{ relatorio.riscoIntermediario.branca }}</td>
                <td>{{ relatorio.riscoIntermediario.parda }}</td>
                <td>{{ relatorio.riscoIntermediario.preta }}</td>
              </tr>
              <tr>
                <td>Alto Risco</td>
                <td>{{ relatorio.altoRisco.total }}</td>
                <td>{{ relatorio.altoRisco.branca }}</td>
                <td>{{ relatorio.altoRisco.parda }}</td>
                <td>{{ relatorio.altoRisco.preta }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Total Geral</th>
                <th>{{ totalGeral.total }}</th>
                <th>{{ totalGeral.branca }}</th>
                <th>{{ totalGeral.parda }}</th>
                <th>{{ totalGeral.preta }}</th>
              </tr>
            </tfoot>
          </table>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoAcompanhamentoGestantes } from '@/modulos/enfermeiro/servicos/ServicoAcompanhamentoGestantes.js'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const competencia = ref('')
const buscando = ref(false)
const relatorio = ref(null)
const erro = ref('')

const competenciaFormatada = computed(() => {
  if (!competencia.value) return '--/----'
  const [ano, mes] = competencia.value.split('-')
  return `${mes}/${ano}`
})

const totalGeral = computed(() => {
  if (!relatorio.value) return { total: 0, branca: 0, parda: 0, preta: 0 }
  const { riscoHabitual, riscoIntermediario, altoRisco } = relatorio.value
  return {
    total: (riscoHabitual.total || 0) + (riscoIntermediario.total || 0) + (altoRisco.total || 0),
    branca:
      (riscoHabitual.branca || 0) + (riscoIntermediario.branca || 0) + (altoRisco.branca || 0),
    parda: (riscoHabitual.parda || 0) + (riscoIntermediario.parda || 0) + (altoRisco.parda || 0),
    preta: (riscoHabitual.preta || 0) + (riscoIntermediario.preta || 0) + (altoRisco.preta || 0),
  }
})

async function gerarRelatorio() {
  buscando.value = true
  relatorio.value = null
  erro.value = ''
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoAcompanhamentoGestantes.buscarDados(competencia.value, equipeId)
    if (dados) {
      relatorio.value = dados
    } else {
      erro.value =
        'Nenhum registro de acompanhamento de gestantes encontrado para a competência selecionada.'
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
  padding: 1.5cm;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
}

/* [ALTERADO] Estilo do cabeçalho para suportar logo e texto alinhados */
.cabecalho-impressao {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
}
.logo-impressao {
  height: 60px;
}
.titulo-container {
  flex-grow: 1;
}
.cabecalho-impressao h3 {
  margin: 0 0 0.5rem 0;
  text-align: center;
}
.info-cabecalho {
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
}

.tabela-padrao tfoot {
  font-weight: bold;
  border-top: 2px solid #334155;
}
</style>
