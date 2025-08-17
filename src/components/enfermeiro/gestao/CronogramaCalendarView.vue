// 📄 ARQUIVO: src/components/enfermeiro/CronogramaCalendarView.vue
<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div v-for="dia in diasDaSemana" :key="dia" class="header-cell">
        {{ dia }}
      </div>
    </div>
    <div class="calendar-grid">
      <div
        v-for="(semana, index) in semanas"
        :key="index"
        class="calendar-week"
      >
        <div
          v-for="(dia, idx) in semana"
          :key="idx"
          class="calendar-day"
          :class="{ 'is-today': isToday(dia?.data) }"
        >
          <div v-if="dia" class="day-number">{{ dia.dia }}</div>
          <div v-if="dia" class="events-container">
            <div
              v-for="evento in getEventosParaODia(dia.data)"
              :key="evento.id"
              class="event-item"
              @click="$emit('edit', evento)"
              :title="`Editar: ${evento.descricao}`"
            >
              {{ evento.descricao }}
              <span class="responsavel">({{ evento.responsavel }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gerarCalendario } from "@/utils/calendarUtils";

const props = defineProps({
  eventos: { type: Array, required: true },
  competencia: { type: String, required: true }, // formato AAAA-MM
});

defineEmits(["edit"]);

const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ano = computed(() => parseInt(props.competencia.split("-")[0]));
const mes = computed(() => parseInt(props.competencia.split("-")[1]));

const semanas = computed(() => gerarCalendario(mes.value, ano.value));

const getEventosParaODia = (data) => {
  if (!data) return [];
  const diaDaSemana = data.getDay();
  const dataString = data.toISOString().slice(0, 10);

  return props.eventos.filter((e) => {
    // Verifica se o evento é recorrente para este dia da semana
    if (e.recorrente && e.recorrencia?.dias.includes(diaDaSemana)) {
      return true;
    }
    // Verifica se é um evento único para esta data
    if (!e.recorrente && e.data === dataString) {
      return true;
    }
    return false;
  });
};

const isToday = (data) => {
  if (!data) return false;
  const hoje = new Date();
  return (
    data.getDate() === hoje.getDate() &&
    data.getMonth() === hoje.getMonth() &&
    data.getFullYear() === hoje.getFullYear()
  );
};
</script>

<style lang="scss" scoped>
.calendar-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background-color: #f7f9fc;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}
.header-cell {
  padding: 10px 5px;
}
.calendar-grid {
  display: flex;
  flex-direction: column;
}
.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
}
.calendar-day {
  min-height: 120px;
  padding: 8px;
  position: relative;
  &:not(:last-child) {
    border-right: 1px solid #e0e0e0;
  }
}
.day-number {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 8px;
}
.is-today .day-number {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.events-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.event-item {
  background-color: #e9f5ff;
  border-left: 3px solid #007bff;
  padding: 4px 8px;
  font-size: 0.75rem;
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: #d1e9ff;
  }
}
.responsavel {
  opacity: 0.7;
  margin-left: 4px;
}
</style>
