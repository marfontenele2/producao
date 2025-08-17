<template>
  <div class="lista-validacao">
    <table>
      <thead>
        <tr>
          <th>Equipe</th>
          <th>Data de Consolidação</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producao in producoes" :key="producao.id">
          <td>{{ getEquipeNome(producao.equipeId) }}</td>
          <td>{{ formatarData(producao.consolidadoEm) }}</td>
          <td>
            <span v-if="producao.validado" class="status-validado"
              >Validado</span
            >
            <span v-else class="status-pendente">Pendente</span>
          </td>
          <td>
            <button
              @click="$emit('validar', producao)"
              :disabled="producao.validado"
              class="btn-validar"
            >
              Analisar e Validar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  producoes: { type: Array, required: true },
  equipes: { type: Array, required: true },
});

defineEmits(["validar"]);

const equipesMap = computed(
  () => new Map(props.equipes.map((e) => [e.id, e.nome]))
);
const getEquipeNome = (id) =>
  equipesMap.value.get(id) || "Equipe não encontrada";

function formatarData(timestamp) {
  if (!timestamp || !timestamp.toDate) return "N/D";
  return timestamp.toDate().toLocaleDateString("pt-BR");
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: center;
}
th {
  background-color: #f8f9fa;
}
td:first-child {
  text-align: left;
}
.status-validado {
  color: #28a745;
  font-weight: bold;
}
.status-pendente {
  color: #fd7e14;
  font-weight: bold;
}
.btn-validar {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.btn-validar:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}
</style>
