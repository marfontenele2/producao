// 📄 ARQUIVO: src/components/admin/UbsList.vue (Refatorado)
<template>
  <div class="list-container">
    <BaseSpinner v-if="carregando" text="Carregando UBS..." />

    <div v-else-if="listaUbs.length === 0" class="state-message">
      Nenhuma UBS cadastrada.
    </div>
    <table v-else class="ubs-table">
      <thead>
        <tr>
          <th>Nome da UBS</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ubs in listaUbs" :key="ubs.id">
          <td>{{ ubs.nome }}</td>
          <td class="actions">
            <button
              @click="$emit('editar', ubs)"
              class="btn-action btn-edit"
              title="Editar"
            >
              <Pencil :size="16" />
            </button>
            <button
              @click="$emit('excluir', ubs.id)"
              class="btn-action btn-delete"
              title="Excluir"
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
import { Pencil, Trash2 } from "lucide-vue-next";
// ✅ ADIÇÃO: Importa o novo componente de spinner
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

defineProps({
  listaUbs: {
    type: Array,
    required: true,
  },
  carregando: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["editar", "excluir"]);
</script>

<style lang="scss" scoped>
/* Estilos permanecem os mesmos */
.list-container {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.ubs-table {
  width: 100%;
  border-collapse: collapse;
}
.ubs-table th,
.ubs-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
.ubs-table th {
  background-color: #fafafa;
  font-weight: 600;
}
.ubs-table .actions {
  text-align: right;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.btn-action {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.btn-action:hover {
  transform: scale(1.1);
}
.btn-action.btn-edit {
  background-color: #ffc107;
  color: white;
}
.btn-action.btn-delete {
  background-color: #dc3545;
  color: white;
}
.state-message {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>
