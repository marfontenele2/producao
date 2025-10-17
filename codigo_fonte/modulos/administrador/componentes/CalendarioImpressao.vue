<template>
  <FullCalendar :options="opcoesCalendario">
    <template #eventContent="{ event }">
      <div class="evento-customizado-impressao">
        <span
          class="letra-categoria"
          :class="getEstiloParaCategoria(event.extendedProps.categoriaProfissional).classeCss"
        >
          {{ getEstiloParaCategoria(event.extendedProps.categoriaProfissional).letra }}
        </span>
        <span class="titulo-evento">{{ event.title }}</span>
      </div>
    </template>
  </FullCalendar>
</template>

<script setup>
import { computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const props = defineProps({
  /**
   * ✅ REGRA DE OURO: Esta deve ser a competência de EXIBIÇÃO do calendário (mês seguinte).
   * Ex: '2025-11'
   */
  competencia: {
    type: String,
    required: true,
  },
  eventos: {
    type: Array,
    required: true,
  },
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
  return item
    ? { letra: item.letra, classeCss: item.classeCss }
    : { letra: 'O', classeCss: 'cor-outros' }
}

const opcoesCalendario = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  initialDate: props.competencia,
  locale: 'pt-br',
  headerToolbar: false,
  footerToolbar: false,
  events: props.eventos.map((e) => ({
    id: e.id,
    title: e.titulo,
    start: e.data,
    extendedProps: e,
  })),
  height: 'auto',
  weekends: false,
  dayHeaderFormat: { weekday: 'short' },
}))
</script>

<style scoped>
:deep(.letra-categoria) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 10px;
  color: white;
  flex-shrink: 0;
  margin-top: 1px;
}
:deep(.cor-enf) {
  background-color: #3b82f6;
}
:deep(.cor-med) {
  background-color: #16a34a;
}
:deep(.cor-tec) {
  background-color: #f97316;
}
:deep(.cor-ger) {
  background-color: #6d28d9;
}
:deep(.cor-outros) {
  background-color: #64748b;
}

:deep(.evento-customizado-impressao) {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 7pt;
  line-height: 1.2;
}
:deep(.titulo-evento) {
  white-space: normal !important;
}
:deep(.fc-daygrid-event) {
  white-space: normal !important;
}
:deep(.fc-day-today) {
  background: inherit !important;
}
</style>
