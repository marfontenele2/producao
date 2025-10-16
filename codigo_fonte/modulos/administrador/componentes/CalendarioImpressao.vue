<template>
  <FullCalendar :options="opcoesCalendario">
    <template #eventContent="{ event }">
      <div class="evento-customizado-impressao">
        <span class="icone-wrapper">
          <component
            :is="getIconeParaCategoria(event.extendedProps.categoriaProfissional)"
            :size="12"
          />
        </span>
        <span class="titulo-evento">{{ event.title }}</span>
      </div>
    </template>
  </FullCalendar>
</template>

<script setup>
import { computed, reactive } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { Stethoscope, HeartPulse, Syringe, User } from 'lucide-vue-next'

const props = defineProps({
  competencia: {
    type: String,
    required: true,
  },
  eventos: {
    type: Array,
    required: true,
  },
})

function getIconeParaCategoria(categoria) {
  const mapa = { Enfermeiro: Stethoscope, Médico: HeartPulse, 'Técnico de Enfermagem': Syringe }
  return mapa[categoria] || User
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
/* Estilos do FullCalendar para Impressão - agora isolados neste componente */
:deep(.fc) {
  font-size: 8pt;
}
:deep(.fc-toolbar) {
  display: none;
}
:deep(.fc-daygrid-day-frame) {
  min-height: auto !important;
}
:deep(.evento-customizado-impressao) {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 7pt;
  line-height: 1.2;
}
:deep(.icone-wrapper) {
  margin-top: 1px;
  flex-shrink: 0;
}
:deep(.fc-daygrid-event) {
  white-space: normal !important;
  padding: 1px 2px;
}
:deep(.fc-day-today) {
  background: inherit !important;
}
</style>
