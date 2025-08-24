<template>
  <span :class="['status-pilula', classeStatus]">
    {{ textoStatus }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'Fechado', // Status padrão
  },
})

const statusMap = {
  Aberto: { texto: 'Aberto', classe: 'status-aberto' },
  Entregue: { texto: 'Entregue', classe: 'status-entregue' },
  Encerrado: { texto: 'Encerrado', classe: 'status-encerrado' },
  Fechado: { texto: 'Fechado', classe: 'status-fechado' },
}

const textoStatus = computed(() => (statusMap[props.status] || statusMap['Fechado']).texto)
const classeStatus = computed(() => (statusMap[props.status] || statusMap['Fechado']).classe)
</script>

<style scoped>
.status-pilula {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.status-aberto {
  background-color: #3b82f6; /* Azul */
}
.status-entregue {
  background-color: #16a34a; /* Verde */
}
.status-encerrado {
  background-color: #dc2626; /* Vermelho */
}
.status-fechado {
  background-color: #6b7280; /* Cinza */
}
</style>
