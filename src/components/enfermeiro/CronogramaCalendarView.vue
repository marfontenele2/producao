// ARQUIVO GERADO: src/components/enfermeiro/CronogramaCalendarView.vue
<template>
  <div class="calendar-view">
    <div class="header">
      <div v-for="dia in diasDaSemana" :key="dia" class="dia-semana">
        {{ dia }}
      </div>
    </div>
    <div class="grid">
      <div v-for="(semana, index) in semanas" :key="index" class="semana">
        <div
          v-for="(dia, diaIndex) in semana"
          :key="diaIndex"
          class="dia"
          :class="{ 'fora-mes': !dia }"
        >
          <div v-if="dia" class="numero-dia">{{ dia.dia }}</div>
          <div v-if="dia" class="eventos">
            <div
              v-for="evento in getEventosDoDia(dia.data)"
              :key="evento.id"
              class="evento"
            >
              {{ evento.atividade }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gerarCalendario } from "@/utils/calendarUtils.js";

const props = defineProps({
  eventos: { type: Array, required: true },
  competencia: { type: String, required: true }, // Formato 'AAAA-MM'
});

const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const [ano, mes] = props.competencia.split("-").map(Number);
const semanas = computed(() => gerarCalendario(mes, ano));

const getEventosDoDia = (data) => {
  return props.eventos.filter((evento) => {
    const dataEvento = new Date(evento.data.seconds * 1000);
    return dataEvento.toDateString() === data.toDateString();
  });
};
</script>

<style lang="scss" scoped>
.calendar-view {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}
.header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  font-weight: bold;
}
.dia-semana {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}
.grid {
  display: flex;
  flex-direction: column;
}
.semana {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  &:not(:last-child) {
    border-bottom: 1px solid #dee2e6;
  }
}
.dia {
  min-height: 120px;
  padding: 8px;
  border-left: 1px solid #e9ecef;
  &:first-child {
    border-left: none;
  }
}
.fora-mes {
  background-color: #f8f9fa;
}
.numero-dia {
  font-weight: 500;
  margin-bottom: 4px;
}
.evento {
  font-size: 0.8rem;
  padding: 2px 4px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
