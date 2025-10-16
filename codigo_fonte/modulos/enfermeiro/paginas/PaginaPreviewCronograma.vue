<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho no-print">
      <h1>Pré-visualização do Cronograma</h1>
      <div class="botoes-acao-cabecalho" v-if="dados">
        <button class="botao botao-acao" @click="voltar">
          <ArrowLeft :size="18" /> Voltar para Filtros
        </button>
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
            <span><strong>Competência:</strong> {{ competenciaFormatada }}</span>
            <span><strong>Equipe:</strong> {{ dados.infoEquipe.nomeEquipe }}</span>
            <span><strong>UBS:</strong> {{ dados.infoEquipe.nomeUbs }}</span>
          </div>
        </header>

        <div class="legenda-icones">
          <strong>Legenda:</strong>
          <div v-for="categoria in categorias" :key="categoria.nome" class="legenda-item">
            <component :is="categoria.icone" :size="16" />
            <span>{{ categoria.nome }}</span>
          </div>
        </div>

        <main class="corpo-impressao">
          <FullCalendar :options="calendarOptions">
            <template #eventContent="{ event }">
              <component
                :is="getIconeParaCategoria(event.extendedProps.categoriaProfissional)"
                :size="14"
                class="icone-evento"
              />
              <div class="fc-event-title">
                {{ event.title }}
              </div>
            </template>
          </FullCalendar>
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
      <p>Dados de impressão não encontrados. Redirecionando para a página de filtros...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, h } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreImpressao } from '@/nucleo/stores/storeImpressao'
import LogoCabecalhoImpressao from '@/nucleo/componentes/LogoCabecalhoImpressao.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Printer, ArrowLeft, Stethoscope, HeartPulse, Syringe, User } from 'lucide-vue-next'

const storeImpressao = useStoreImpressao()
const router = useRouter()
const dados = ref(null)

const categorias = [
  { nome: 'Enfermeiro', icone: Stethoscope },
  { nome: 'Médico', icone: HeartPulse },
  { nome: 'Técnico de Enfermagem', icone: Syringe },
  { nome: 'Outros', icone: User },
]
function getIconeParaCategoria(categoria) {
  const item = categorias.find((c) => c.nome === categoria)
  return item ? item.icone : User
}

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  locale: 'pt-br',
  headerToolbar: { left: '', center: 'title', right: '' },
  events: [],
  height: 'auto',
  showNonCurrentDates: false,
  // A opção para mostrar apenas dias úteis foi mantida
  weekends: false,
  // A propriedade 'eventContent' foi removida daqui para corrigir o bug
})

const competenciaFormatada = computed(() => {
  if (!dados.value?.competencia) return ''
  const [ano, mes] = dados.value.competencia.split('-')
  return `${mes}/${ano}`
})

onMounted(() => {
  const dadosDoStore = storeImpressao.dadosParaImpressao
  if (!dadosDoStore || dadosDoStore.tipo !== 'cronograma') {
    router.push({ name: 'EnfermeiroImpressaoCronograma' })
    return
  }

  dados.value = dadosDoStore
  calendarOptions.initialDate = dados.value.competencia
  calendarOptions.events = dados.value.eventos.map((e) => ({
    id: e.id,
    title: e.titulo,
    start: e.data,
    extendedProps: e,
  }))
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
.legenda-icones {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  padding: 0.75rem 0;
  font-size: 9pt;
  border-bottom: 1px solid #ccc;
  margin-bottom: 1rem;
}
.legenda-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* As regras de CSS robustas para quebra de texto foram mantidas */
:deep(.fc-daygrid-day-frame) {
  min-height: 110px;
}
:deep(.fc-daygrid-event) {
  height: auto !important;
  white-space: normal !important;
}
:deep(.fc-event-title) {
  white-space: normal !important;
  word-wrap: break-word;
  overflow: visible;
  display: block;
}
/* Este seletor foi alterado para o que o slot gera */
:deep(.fc-event-main-frame) {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}
:deep(.icone-evento) {
  flex-shrink: 0;
  margin-top: 2px;
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
