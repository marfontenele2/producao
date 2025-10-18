<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script setup>
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { startOfMonth, endOfMonth, addDays } from 'date-fns'

const props = defineProps({
  competencia: { type: String, required: true },
  eventos: { type: Array, default: () => [] },
})

const categorias = [
  { nome: 'Enfermeiro', letra: 'E', classeCss: 'cor-enf' },
  { nome: 'Médico', letra: 'M', classeCss: 'cor-med' },
  { nome: 'Técnico de Enfermagem', letra: 'T', classeCss: 'cor-tec' },
  { nome: 'Gerente', letra: 'G', classeCss: 'cor-ger' },
  { nome: 'Outros', letra: 'O', classeCss: 'cor-outros' },
]

function getEstiloParaCategoria(cargo) {
  const item = categorias.find((c) => c.nome === cargo)
  return item || { letra: 'O', classeCss: 'cor-outros' }
}

const eventosProcessados = computed(() => {
  const dias = {}
  for (const evento of props.eventos) {
    if (!dias[evento.data]) dias[evento.data] = []
    dias[evento.data].push(evento)
  }

  const calendarioFinal = []
  for (const data in dias) {
    const eventosDoDia = dias[data]
    eventosDoDia.sort((a, b) => (a.turno === 'Manhã' ? -1 : 1))

    const temManha = eventosDoDia.some((e) => e.turno === 'Manhã')
    const temTarde = eventosDoDia.some((e) => e.turno === 'Tarde')

    if (temManha && temTarde) {
      let ultimoIndexManha = -1
      eventosDoDia.forEach((e, i) => {
        if (e.turno === 'Manhã') ultimoIndexManha = i
      })

      if (ultimoIndexManha !== -1) {
        const separador = {
          id: `sep-${data}`,
          start: data,
          display: 'background',
          extendedProps: { isSeparator: true },
        }
        eventosDoDia.splice(ultimoIndexManha + 1, 0, separador)
      }
    }
    calendarioFinal.push(...eventosDoDia)
  }

  return calendarioFinal.map((e) => ({
    id: e.id,
    title: e.titulo,
    start: e.data,
    display: e.display,
    extendedProps: e.extendedProps || e,
  }))
})

const validRange = computed(() => {
  if (!props.competencia) return {}
  const dataCalendario = new Date(`${props.competencia}-15T12:00:00`)
  return {
    start: startOfMonth(dataCalendario),
    end: addDays(endOfMonth(dataCalendario), 1),
  }
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  initialDate: props.competencia,
  validRange: validRange.value,
  locale: 'pt-br',
  headerToolbar: false,
  events: eventosProcessados.value,
  height: 'auto',
  showNonCurrentDates: false,
  weekends: false,
  eventClassNames: (arg) => {
    if (arg.event.extendedProps.isSeparator) return []
    const estilo = getEstiloParaCategoria(arg.event.extendedProps.categoriaProfissional)
    return [estilo.classeCss]
  },
  eventContent: (arg) => {
    const props = arg.event.extendedProps
    if (props.isSeparator) {
      const el = document.createElement('div')
      el.className = 'separador-turno-impressao'
      return { domNodes: [el] }
    }

    const estilo = getEstiloParaCategoria(props.categoriaProfissional)
    const container = document.createElement('div')
    container.className = 'evento-customizado-impressao'
    container.innerHTML = `
      <span class="letra-categoria-evento ${estilo.classeCss}">${estilo.letra}</span>
      <div class="titulo-evento-impressao">
        <span class="turno-sigla-impressao">(${(props.turno || 'M').charAt(0)})</span>
        ${arg.event.title}
      </div>
    `
    return { domNodes: [container] }
  },
}))
</script>

<style>
/* Estilos Globais para Impressão do Calendário (não 'scoped') */

/* Cores Padrão */
.cor-enf {
  background-color: #3b82f6;
  border-color: #3b82f6 !important;
}
.cor-med {
  background-color: #16a34a;
  border-color: #16a34a !important;
}
.cor-tec {
  background-color: #f97316;
  border-color: #f97316 !important;
}
.cor-ger {
  background-color: #6d28d9;
  border-color: #6d28d9 !important;
}
.cor-outros {
  background-color: #64748b;
  border-color: #64748b !important;
}

/* Estrutura do Calendário */
.fc-daygrid-day-frame {
  min-height: 110px !important;
}
.fc-day-today {
  background: inherit !important;
}
.fc-daygrid-event {
  background-color: transparent !important;
  border-width: 1px !important;
  border-style: solid !important;
  padding: 1px 2px;
  margin-top: 1px !important;
  margin-bottom: 1px !important;
}

/* Conteúdo Customizado do Evento */
.separador-turno-impressao {
  height: 1px;
  border-top: 1px dashed #ccc;
  margin: 2px 0;
}
.evento-customizado-impressao {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 8pt;
  line-height: 1.2;
}
.letra-categoria-evento {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-weight: 700;
  color: white;
  font-size: 10px;
  flex-shrink: 0;
}
.titulo-evento-impressao {
  color: #000 !important;
  white-space: normal !important;
  word-wrap: break-word;
}
.turno-sigla-impressao {
  font-weight: 700;
}
</style>
