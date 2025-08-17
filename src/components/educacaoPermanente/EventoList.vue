<template>
  <div class="evento-list">
    <div v-if="!eventos || eventos.length === 0" class="empty-state">
      Nenhum evento cadastrado para esta competência.
    </div>
    <table v-else>
      <thead>
        <tr>
          <th>Data</th>
          <th>Tema</th>
          <th>Palestrante</th>
          <th>Público-Alvo</th>
          <th v-if="!disabled">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="evento in eventos" :key="evento.id">
          <td>{{ formatarData(evento.data) }}</td>
          <td>{{ evento.tema }}</td>
          <td>{{ evento.palestrante }}</td>
          <td>{{ evento.publicoAlvo }}</td>
          <td v-if="!disabled">
            <button @click="$emit('editar', evento)" class="btn-icon">
              <Pencil :size="16" />
            </button>
            <button
              @click="$emit('excluir', evento.id)"
              class="btn-icon btn-danger"
            >
              <Trash2 :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { Pencil, Trash2 } from "lucide-vue-next";

defineProps({
  eventos: { type: Array, required: true },
  disabled: { type: Boolean, default: false },
});

defineEmits(["editar", "excluir"]);

const formatarData = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp.seconds * 1000).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
};
</script>

<style scoped>
.evento-list {
  margin-top: 1.5rem;
}
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
}
th {
  background-color: #f8f9fa;
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 8px;
}
.btn-icon:hover {
  opacity: 0.7;
}
.btn-danger {
  color: #dc3545;
}
</style>
