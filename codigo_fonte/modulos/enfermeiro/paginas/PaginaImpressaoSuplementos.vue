<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Relatório de Suplementos</h1>
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
        <h3>CONSOLIDADO MENSAL DO ACOMPANHAMENTO DO FORNECIMENTO DE SUPLEMENTOS</h3>
        <div class="info-cabecalho">
          <span>COMPETÊNCIA: {{ competenciaFormatada }}</span>
          <span>EQUIPE: {{ nomeEquipe }}</span>
          <span>DATA DA EMISSÃO: {{ dataAtualFormatada }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <h4 class="titulo-tabela">1- Crianças de 4 a 24 meses:</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>1ª Entrega</th>
              <th>2ª Entrega</th>
              <th>3ª Entrega</th>
              <th>4ª Entrega</th>
              <th>5ª Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.criancas.xaropeFerroso.entrega1 }}</td>
              <td>{{ dadosRelatorio.criancas.xaropeFerroso.entrega2 }}</td>
              <td>{{ dadosRelatorio.criancas.xaropeFerroso.entrega3 }}</td>
              <td>{{ dadosRelatorio.criancas.xaropeFerroso.entrega4 }}</td>
              <td>{{ dadosRelatorio.criancas.xaropeFerroso.entrega5 }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="titulo-tabela">2- Gestantes a partir da 20ª semana</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>1ª Entrega</th>
              <th>2ª Entrega</th>
              <th>3ª Entrega</th>
              <th>4ª Entrega</th>
              <th>5ª Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.gestantes.xaropeFerroso.entrega1 }}</td>
              <td>{{ dadosRelatorio.gestantes.xaropeFerroso.entrega2 }}</td>
              <td>{{ dadosRelatorio.gestantes.xaropeFerroso.entrega3 }}</td>
              <td>{{ dadosRelatorio.gestantes.xaropeFerroso.entrega4 }}</td>
              <td>{{ dadosRelatorio.gestantes.xaropeFerroso.entrega5 }}</td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.gestantes.comprimidoFerroso.entrega1 }}</td>
              <td>{{ dadosRelatorio.gestantes.comprimidoFerroso.entrega2 }}</td>
              <td>{{ dadosRelatorio.gestantes.comprimidoFerroso.entrega3 }}</td>
              <td>{{ dadosRelatorio.gestantes.comprimidoFerroso.entrega4 }}</td>
              <td>{{ dadosRelatorio.gestantes.comprimidoFerroso.entrega5 }}</td>
            </tr>
            <tr>
              <td>Comprimido de Ácido Fólico</td>
              <td>{{ dadosRelatorio.gestantes.acidoFolico.entrega1 }}</td>
              <td>{{ dadosRelatorio.gestantes.acidoFolico.entrega2 }}</td>
              <td>{{ dadosRelatorio.gestantes.acidoFolico.entrega3 }}</td>
              <td>{{ dadosRelatorio.gestantes.acidoFolico.entrega4 }}</td>
              <td>{{ dadosRelatorio.gestantes.acidoFolico.entrega5 }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="titulo-tabela">3- Mulheres até o 3º mês Pós-Parto e Pós-Aborto</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>1ª Entrega</th>
              <th>2ª Entrega</th>
              <th>3ª Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.posParto.xaropeFerroso.entrega1 }}</td>
              <td>{{ dadosRelatorio.posParto.xaropeFerroso.entrega2 }}</td>
              <td>{{ dadosRelatorio.posParto.xaropeFerroso.entrega3 }}</td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.posParto.comprimidoFerroso.entrega1 }}</td>
              <td>{{ dadosRelatorio.posParto.comprimidoFerroso.entrega2 }}</td>
              <td>{{ dadosRelatorio.posParto.comprimidoFerroso.entrega3 }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="titulo-tabela">Controle de Perdas</h4>
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>Vencimento</th>
              <th>Extravio</th>
              <th>Danificado</th>
              <th>Outros</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.perdas.xaropeFerroso.vencimento }}</td>
              <td>{{ dadosRelatorio.perdas.xaropeFerroso.extravio }}</td>
              <td>{{ dadosRelatorio.perdas.xaropeFerroso.danificado }}</td>
              <td>{{ dadosRelatorio.perdas.xaropeFerroso.outros }}</td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td>{{ dadosRelatorio.perdas.comprimidoFerroso.vencimento }}</td>
              <td>{{ dadosRelatorio.perdas.comprimidoFerroso.extravio }}</td>
              <td>{{ dadosRelatorio.perdas.comprimidoFerroso.danificado }}</td>
              <td>{{ dadosRelatorio.perdas.comprimidoFerroso.outros }}</td>
            </tr>
            <tr>
              <td>Comprimido de Ácido Fólico</td>
              <td>{{ dadosRelatorio.perdas.acidoFolico.vencimento }}</td>
              <td>{{ dadosRelatorio.perdas.acidoFolico.extravio }}</td>
              <td>{{ dadosRelatorio.perdas.acidoFolico.danificado }}</td>
              <td>{{ dadosRelatorio.perdas.acidoFolico.outros }}</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoSuplementos } from '@/modulos/enfermeiro/servicos/servicoSuplementos'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()

const competencia = ref('')
const buscando = ref(false)
const dadosRelatorio = ref(null)
const erroBusca = ref('')
const nomeEquipe = ref('N/A')

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
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoSuplementos.buscarDados(competencia.value, equipeId)

    if (dados && dados.metadata.criadoEm) {
      dadosRelatorio.value = dados
      const equipe = await servicoEquipes.buscarEquipePorId(equipeId)
      if (equipe) {
        nomeEquipe.value = equipe.nome
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
  font-weight: 500;
}
@media print {
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    min-height: auto;
  }
}
</style>
