<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Relatório de Profissionais (SCNES)</h1>
      </header>
      <div class="conteudo-card card-filtros">
        <div class="campo">
          <label for="competencia">Competência</label>
          <input type="month" id="competencia" v-model="competencia" class="input-padrao" />
        </div>
        <div class="campo">
          <label for="equipe">Equipe</label>
          <select
            id="equipe"
            v-model="equipeIdSelecionada"
            class="input-padrao"
            :disabled="carregandoEquipes"
          >
            <option disabled value="">
              {{ carregandoEquipes ? 'Carregando...' : 'Selecione uma equipe' }}
            </option>
            <option v-for="equipe in listaEquipes" :key="equipe.id" :value="equipe.id">
              {{ equipe.nome }}
            </option>
          </select>
        </div>
        <button
          class="botao botao-primario"
          @click="gerarRelatorio"
          :disabled="!competencia || !equipeIdSelecionada || buscando"
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
      <header class="cabecalho-impressao">
        <LogoCabecalhoImpressao />
        <h3>RELATÓRIO DE PROFISSIONAIS (SCNES)</h3>
        <div class="info-cabecalho-grid">
          <span><strong>Município:</strong> GRANJA</span>
          <span><strong>Competência:</strong> {{ competenciaFormatada }}</span>
          <span><strong>Equipe:</strong> {{ dadosRelatorio.nomeEquipe }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <table class="tabela-impressao">
          <thead>
            <tr>
              <th>Nome Completo do Profissional</th>
              <th>CPF</th>
              <th>Data de Nasc.</th>
              <th>CNS</th>
              <th>Cargo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="dadosRelatorio.profissionais.length === 0">
              <td colspan="5" style="text-align: center">Nenhum profissional encontrado.</td>
            </tr>
            <tr v-for="prof in dadosRelatorio.profissionais" :key="prof.id">
              <td class="coluna-nome">{{ prof.nome }}</td>
              <td>{{ prof.cpf }}</td>
              <td>{{ formatarData(prof.dataNascimento) }}</td>
              <td>{{ prof.cns }}</td>
              <td>{{ prof.cargo }}</td>
            </tr>
          </tbody>
        </table>
      </main>

      <footer class="rodape-impressao">
        <div class="assinatura">
          <p class="linha-assinatura">_________________________________________</p>
          <p>Gerente Responsável</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
// CORRIGIDO: Importando a função 'carregarProfissionais' diretamente.
import { carregarProfissionais } from '@/modulos/gerente/servicos/ServicoSCNES'
import { FileSearch, Printer } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'

const storeUsuario = useStoreUsuario()
const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)

const competencia = ref('')
const equipeIdSelecionada = ref('')
const listaEquipes = ref([])
const carregandoEquipes = ref(true)

const competenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-')
  return `${mes}/${ano}`
})

onMounted(async () => {
  const ubsId = storeUsuario.usuario?.ubsId
  if (ubsId) {
    listaEquipes.value = await servicoEquipes.buscarEquipesPorUbs(ubsId)
  }
  carregandoEquipes.value = false
})

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    // CORRIGIDO: Chamando a função 'carregarProfissionais' diretamente.
    const profissionais = await carregarProfissionais(competencia.value, equipeIdSelecionada.value)

    if (profissionais && profissionais.length > 0) {
      const equipe = listaEquipes.value.find((e) => e.id === equipeIdSelecionada.value)
      dadosRelatorio.value = {
        profissionais: profissionais,
        nomeEquipe: equipe ? equipe.nome : 'N/D',
      }
    } else {
      erroBusca.value = `Nenhum profissional encontrado para a equipe na competência ${competenciaFormatada.value}.`
    }
  } catch (error) {
    console.error('Erro ao gerar relatório SCNES:', error)
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function formatarData(dataString) {
  if (!dataString) return 'N/D'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

function imprimirPagina() {
  window.print()
}
</script>

<style scoped>
/* Estilos fieis ao exemplo PaginaImpressaoMDDAAdmin.vue */
@page {
  size: A4 portrait;
  margin: 1.5cm;
}
.conteudo-card.card-filtros {
  padding: 1.5rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
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
  min-width: 220px;
  height: 42px;
}

.pagina-a4 {
  background: white;
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  position: relative;
  box-sizing: border-box;
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
  font-size: 12pt;
}
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  text-align: left;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  padding-top: 1rem;
}
.tabela-impressao {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
}
.tabela-impressao th,
.tabela-impressao td {
  border: 1px solid #333;
  padding: 4px 6px;
  text-align: center;
}
.tabela-impressao th {
  background-color: #f2f2f2;
}
.tabela-impressao td.coluna-nome {
  text-align: left;
  width: 40%;
}
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
.mensagem-feedback.erro {
  color: #b91c1c;
  background-color: #fee2e2;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
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
}
</style>
