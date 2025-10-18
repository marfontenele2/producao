<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho no-print">
      <h1>Pré-visualização do Cronograma</h1>
      <div class="botoes-acao-cabecalho" v-if="dados">
        <button class="botao botao-acao" @click="voltar"><ArrowLeft :size="18" /> Voltar</button>
        <button class="botao botao-primario" @click="imprimirPagina">
          <Printer :size="18" /> Imprimir
        </button>
      </div>
    </header>

    <div v-if="dados" id="area-impressao">
      <div class="pagina-a4 borda-impressao">
        <header class="cabecalho-impressao">
          <LogoCabecalhoImpressao />
          <h3>CRONOGRAMA MENSAL DE ATIVIDADES DA EQUIPE</h3>
          <div class="info-cabecalho-grid">
            <span><strong>Município:</strong> GRANJA</span>
            <span><strong>Mês de Referência:</strong> {{ competenciaFormatada }}</span>
            <span><strong>Equipe:</strong> {{ dados.infoEquipe.nomeEquipe }}</span>
            <span><strong>UBS:</strong> {{ dados.infoEquipe.nomeUbs }}</span>
          </div>
        </header>

        <div class="legenda-icones">
          <strong>Legenda:</strong>
          <div v-for="categoria in categorias" :key="categoria.nome" class="legenda-item">
            <span class="letra-categoria-legenda" :class="categoria.classeCss">{{
              categoria.letra
            }}</span>
            <span>{{ categoria.nome }}</span>
          </div>
        </div>

        <main class="corpo-impressao">
          <CalendarioImpressaoBase
            :eventos="dados.eventos"
            :competencia="dados.competenciaCalendario"
          />
        </main>

        <footer class="rodape-impressao">
          <div class="assinatura">
            <p class="linha-assinatura">_________________________________________</p>
            <p>{{ dados.nomeAssinante }}</p>
            <p>Enfermeiro(a) Responsável</p>
          </div>
        </footer>
      </div>
    </div>
    <div v-else class="conteudo-card">
      <p>Dados de impressão não encontrados. Redirecionando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreImpressao } from '@/nucleo/stores/storeImpressao'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'
import CalendarioImpressaoBase from '@/nucleo/componentes/impressao/CalendarioImpressaoBase.vue' // <-- 🚀 NOVO IMPORT
import { Printer, ArrowLeft } from 'lucide-vue-next'

const storeImpressao = useStoreImpressao()
const router = useRouter()
const dados = ref(null)

// Apenas a legenda precisa disto agora
const categorias = [
  { nome: 'Enfermeiro', letra: 'E', classeCss: 'cor-enf' },
  { nome: 'Médico', letra: 'M', classeCss: 'cor-med' },
  { nome: 'Técnico de Enfermagem', letra: 'T', classeCss: 'cor-tec' },
  { nome: 'Gerente', letra: 'G', classeCss: 'cor-ger' },
  { nome: 'Outros', letra: 'O', classeCss: 'cor-outros' },
]

const competenciaFormatada = computed(() => {
  if (!dados.value?.competenciaCalendario) return ''
  const [ano, mes] = dados.value.competenciaCalendario.split('-')
  const data = new Date(ano, parseInt(mes) - 1, 15)
  const nomeMes = data.toLocaleString('pt-BR', { month: 'long' })
  return `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${ano}`
})

onMounted(() => {
  const dadosDoStore = storeImpressao.dadosParaImpressao
  if (!dadosDoStore || dadosDoStore.tipo !== 'cronograma') {
    router.push({ name: 'EnfermeiroImpressaoCronograma' })
    return
  }
  dados.value = dadosDoStore
  storeImpressao.limparDados()
})

function imprimirPagina() {
  window.print()
}
function voltar() {
  router.back()
}
</script>

<style scoped>
/* Estilos da Página (Layout) */
.botoes-acao-cabecalho {
  display: flex;
  gap: 1rem;
}
@page {
  size: A4 portrait;
  margin: 1.5cm;
}
.pagina-a4 {
  background: white;
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 0 auto 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  display: flex;
  flex-direction: column;
}
.borda-impressao {
  border: 1px solid #333;
}
.cabecalho-impressao {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
}
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
  text-align: left;
}
.corpo-impressao {
  flex-grow: 1;
}
.rodape-impressao {
  display: flex;
  justify-content: flex-end;
  padding-top: 2rem;
  font-size: 10pt;
  margin-top: auto;
}
.assinatura {
  text-align: center;
  width: 60%;
}
.assinatura p {
  margin: 2px 0;
}

/* Estilos da Legenda (Permanecem aqui) */
.legenda-icones {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 0;
  font-size: 8pt;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
}
.legenda-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.letra-categoria-legenda {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  color: white;
  width: 16px;
  height: 16px;
  font-size: 11px;
}

/* Cores (usadas pela legenda e pelo componente filho) */
.cor-enf {
  background-color: #3b82f6;
}
.cor-med {
  background-color: #16a34a;
}
.cor-tec {
  background-color: #f97316;
}
.cor-ger {
  background-color: #6d28d9;
}
.cor-outros {
  background-color: #64748b;
}

@media print {
  .no-print {
    display: none !important;
  }
  .pagina-container {
    padding: 0 !important;
  }
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    border: none;
  }
}
</style>
