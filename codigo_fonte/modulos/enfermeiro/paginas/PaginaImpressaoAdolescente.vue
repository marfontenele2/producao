<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Relatório do Adolescente</h1>
      </header>
      <div class="card-filtros">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label>
          <input type="month" id="competencia" v-model="competencia" />
        </div>
        <div class="campo">
          <label for="assinante">Nome do Profissional (para assinatura)</label>
          <input
            type="text"
            id="assinante"
            v-model="nomeAssinante"
            placeholder="Digite o nome completo"
          />
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
        <h3>RELATÓRIO MENSAL DO ATENDIMENTO AO ADOLESCENTE NA ATENÇÃO PRIMÁRIA</h3>
        <div class="info-cabecalho">
          <span>COMPETÊNCIA: {{ competenciaFormatada }}</span>
          <span>DATA DA EMISSÃO: {{ dataAtualFormatada }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <h4 class="titulo-tabela">1. Atendimento por Motivo da Consulta</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Atendimento</th>
              <th>10-14 M</th>
              <th>10-14 F</th>
              <th>15-19 M</th>
              <th>15-19 F</th>
              <th>Cons. Médica</th>
              <th>Cons. Enferm.</th>
              <th>Cons. Outros</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dadosRelatorio.atendimentos" :key="item.nome">
              <td>{{ item.nome }}</td>
              <td>{{ item.faixa10a14Masc || 0 }}</td>
              <td>{{ item.faixa10a14Fem || 0 }}</td>
              <td>{{ item.faixa15a19Masc || 0 }}</td>
              <td>{{ item.faixa15a19Fem || 0 }}</td>
              <td>{{ item.consMedica || 0 }}</td>
              <td>{{ item.consEnfermagem || 0 }}</td>
              <td>{{ item.consOutros || 0 }}</td>
              <td>{{ calcularTotalAtendimento(item) }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="titulo-tabela">2. Métodos Contraceptivos</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Métodos</th>
              <th>10-14 M</th>
              <th>10-14 F</th>
              <th>15-19 M</th>
              <th>15-19 F</th>
              <th>TOTAL</th>
              <th>ESTOQUE ATUAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dadosRelatorio.metodos" :key="item.nome">
              <td>{{ item.nome }}</td>
              <td>{{ item.faixa10a14Masc || 0 }}</td>
              <td>{{ item.faixa10a14Fem || 0 }}</td>
              <td>{{ item.faixa15a19Masc || 0 }}</td>
              <td>{{ item.faixa15a19Fem || 0 }}</td>
              <td>{{ calcularTotalMetodos(item) }}</td>
              <td>{{ item.estoqueAtual || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </main>

      <footer class="area-assinatura">
        <div class="linha-assinatura">
          <p>{{ nomeAssinante || '____________________________________' }}</p>
          <p>Enfermeiro(a) da Equipe {{ nomeEquipe }}</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoProducaoAdolescente } from '@/modulos/enfermeiro/servicos/servicoProducaoAdolescente'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const competencia = ref('')
const nomeAssinante = ref(storeUsuario.usuario?.nome || '')
const nomeEquipe = ref('N/A')
const dadosRelatorio = ref(null)
const buscando = ref(false)
const erroBusca = ref('')

const competenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-')
  const nomeMes = new Date(ano, mes - 1).toLocaleString('pt-BR', { month: 'long' })
  return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${ano}`
})

const dataAtualFormatada = computed(() => new Date().toLocaleDateString('pt-BR'))

const calcularTotalAtendimento = (item) =>
  (item.faixa10a14Masc || 0) +
  (item.faixa10a14Fem || 0) +
  (item.faixa15a19Masc || 0) +
  (item.faixa15a19Fem || 0)

const calcularTotalMetodos = (item) =>
  (item.faixa10a14Masc || 0) +
  (item.faixa10a14Fem || 0) +
  (item.faixa15a19Masc || 0) +
  (item.faixa15a19Fem || 0)

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const dados = await servicoProducaoAdolescente.buscarProducaoPorCompetencia(
      competencia.value,
      storeUsuario.usuario.equipeId,
    )

    if (dados) {
      dadosRelatorio.value = dados
      const equipe = await servicoEquipes.buscarEquipePorId(storeUsuario.usuario.equipeId)
      if (equipe) {
        nomeEquipe.value = equipe.nome
      } else {
        nomeEquipe.value = 'Equipe não encontrada'
      }
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

function imprimirPagina() {
  window.print()
}
</script>

<style>
/* Estilos globais de impressão */
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
/* Estilos da página de impressão */
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
}
.tabela-impressao td:first-child {
  text-align: left;
}
.area-assinatura {
  text-align: center;
  padding-top: 4rem;
  font-size: 10pt;
}
.linha-assinatura p {
  margin-top: 0.5rem;
}
@media print {
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    min-height: auto;
  }
}
</style>
