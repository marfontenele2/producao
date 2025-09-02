<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Boletim de Testes Rápidos</h1>
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
          <FileSearch :size="18" />
          {{ buscando ? 'Buscando...' : 'Gerar Relatório' }}
        </button>
        <button class="botao" @click="imprimirPagina" :disabled="!dadosRelatorio">
          <Printer :size="18" />
          Imprimir
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
        <img src="/logo.png" alt="Logo Granja" class="logo-impressao" />
        <p><strong>ESTADO DO CEARÁ</strong></p>
        <p><strong>PREFEITURA MUNICIPAL DE GRANJA</strong></p>
        <p><strong>SECRETARIA MUNICIPAL DE SAÚDE</strong></p>
        <h3>BOLETIM DE PRODUÇÃO - TESTES RÁPIDOS</h3>
        <div class="info-cabecalho">
          <span>COMPETÊNCIA: {{ competenciaFormatada }}</span>
          <span>DATA DA EMISSÃO: {{ dataAtualFormatada }}</span>
        </div>
        <div class="info-cabecalho" style="margin-top: 8px">
          <span><strong>UBS:</strong> {{ storeUsuario.usuario?.nomeUbs || 'N/A' }}</span>
          <span><strong>EQUIPE:</strong> {{ storeUsuario.usuario?.nomeEquipe || 'N/A' }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <h4 class="titulo-tabela">1. Produção Consolidada</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Teste / Marca</th>
              <th>Pré-Natal</th>
              <th>Mobilização</th>
              <th>Treinamentos</th>
              <th>Rotina</th>
              <th>Total Realizados</th>
              <th>Reagentes</th>
              <th>Inválidos</th>
              <th>Perdidos</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="teste in dadosRelatorio.testesComMovimento" :key="teste.id">
              <tr class="linha-grupo">
                <td :colspan="9">{{ teste.nome }}</td>
              </tr>
              <tr v-for="marca in teste.marcas" :key="marca.id">
                <td class="coluna-aninhada">{{ marca.nome }}</td>
                <td>{{ marca.realizados.preNatal }}</td>
                <td>{{ marca.realizados.mobilizacao }}</td>
                <td>{{ marca.realizados.treinamentos }}</td>
                <td>{{ marca.realizados.rotina }}</td>
                <td class="coluna-total">{{ marca.totalRealizados }}</td>
                <td>{{ marca.reagentes }}</td>
                <td>{{ marca.totalInvalidos }}</td>
                <td>{{ marca.totalPerdidos }}</td>
              </tr>
            </template>
          </tbody>
        </table>

        <div v-if="dadosRelatorio.detalhesInvalidos.length > 0" class="page-break">
          <h4 class="titulo-tabela">2. Detalhamento de Testes Inválidos</h4>
          <table class="tabela-impressao tabela-detalhes">
            <thead>
              <tr>
                <th>Teste / Marca</th>
                <th>Lote</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in dadosRelatorio.detalhesInvalidos" :key="index">
                <td>{{ item.nomeTeste }} / {{ item.nomeMarca }}</td>
                <td>{{ item.lote || 'N/A' }}</td>
                <td>{{ item.quantidade }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="dadosRelatorio.detalhesPerdidos.length > 0" class="page-break">
          <h4 class="titulo-tabela">3. Detalhamento de Testes Perdidos</h4>
          <table class="tabela-impressao tabela-detalhes">
            <thead>
              <tr>
                <th>Teste / Marca</th>
                <th>Lote</th>
                <th>Quantidade</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in dadosRelatorio.detalhesPerdidos" :key="index">
                <td>{{ item.nomeTeste }} / {{ item.nomeMarca }}</td>
                <td>{{ item.lote || 'N/A' }}</td>
                <td>{{ item.quantidade }}</td>
                <td>{{ item.motivo || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoBoletim } from '@/modulos/enfermeiro/servicos/servicoBoletim'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario() // Store importada e pronta para uso no template
const competencia = ref('')
const dadosRelatorio = ref(null)
const buscando = ref(false)
const erroBusca = ref('')
const catalogoTestes = ref([])

const competenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-')
  const nomeMes = new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' })
  return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${ano}`
})

const dataAtualFormatada = computed(() => new Date().toLocaleDateString('pt-BR'))

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const [dadosBoletim, testes] = await Promise.all([
      servicoBoletim.buscarDados(competencia.value, storeUsuario.usuario.equipeId),
      servicoTestes.buscarTodos(),
    ])

    catalogoTestes.value = testes

    if (dadosBoletim && dadosBoletim.testes) {
      processarDados(dadosBoletim)
    } else {
      erroBusca.value = `Nenhuma produção encontrada para a equipe na competência ${competenciaFormatada.value}.`
    }
  } catch (error) {
    console.error(error)
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function processarDados(dadosBoletim) {
  const detalhesInvalidos = []
  const detalhesPerdidos = []

  const testesComMovimento = catalogoTestes.value
    .map((teste) => {
      const marcasComMovimento = teste.marcas
        .map((marca) => {
          const dadosMarca = dadosBoletim.testes?.[teste.id]?.[marca.id]
          if (!dadosMarca) return null

          const realizados = dadosMarca.realizados || {}
          const reagentes = dadosMarca.reagentes || 0
          const invalidos = dadosMarca.invalidos || []
          const perdidos = dadosMarca.perdidos || []

          const totalRealizados = Object.values(realizados).reduce((soma, v) => soma + (v || 0), 0)
          const totalInvalidos = invalidos.reduce((soma, item) => soma + (item.quantidade || 0), 0)
          const totalPerdidos = perdidos.reduce((soma, item) => soma + (item.quantidade || 0), 0)

          const totalMovimentacao = totalRealizados + reagentes + totalInvalidos + totalPerdidos
          if (totalMovimentacao === 0) return null

          invalidos.forEach((item) =>
            detalhesInvalidos.push({ ...item, nomeTeste: teste.nome, nomeMarca: marca.nome }),
          )
          perdidos.forEach((item) =>
            detalhesPerdidos.push({ ...item, nomeTeste: teste.nome, nomeMarca: marca.nome }),
          )

          return {
            id: marca.id,
            nome: marca.nome,
            realizados: {
              preNatal: realizados.preNatal || 0,
              mobilizacao: realizados.mobilizacao || 0,
              treinamentos: realizados.treinamentos || 0,
              rotina: realizados.rotina || 0,
            },
            reagentes: reagentes,
            totalRealizados,
            totalInvalidos,
            totalPerdidos,
          }
        })
        .filter(Boolean)

      if (marcasComMovimento.length === 0) return null
      return { id: teste.id, nome: teste.nome, marcas: marcasComMovimento }
    })
    .filter(Boolean)

  dadosRelatorio.value = { testesComMovimento, detalhesInvalidos, detalhesPerdidos }
}

function imprimirPagina() {
  window.print()
}
</script>

<style>
/* Estilos globais de impressão (mantidos) */
@page {
  size: A4 portrait;
  margin: 1.5cm;
}
@media print {
  body {
    background-color: #fff;
  }
  body * {
    visibility: hidden;
  }
  #area-impressao,
  #area-impressao * {
    visibility: visible;
  }
  #area-impressao {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>

<style scoped>
/* Estilos da página (mantidos) */
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
  box-sizing: border-box;
}
.borda-impressao {
  border: 1px solid #333;
}
.cabecalho-impressao {
  text-align: center;
  border-bottom: 1px solid #333;
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
.logo-impressao {
  height: 60px;
  margin-bottom: 1rem;
}
.info-cabecalho {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  flex-grow: 1;
  padding-top: 1rem;
}
.titulo-tabela {
  font-size: 11pt;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.tabela-impressao {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
}
.tabela-impressao th,
.tabela-impressao td {
  border: 1px solid #333;
  padding: 4px;
  text-align: center;
  vertical-align: middle;
}
.tabela-impressao td:first-child,
.tabela-impressao th:first-child {
  text-align: left;
}
.linha-grupo td {
  background-color: #e0e0e0;
  font-weight: bold;
}
.coluna-aninhada {
  padding-left: 15px !important;
}
.coluna-total {
  font-weight: bold;
  background-color: #f2f2f2;
}
.page-break {
  page-break-before: always;
}
@media print {
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    min-height: auto;
  }
}
</style>
