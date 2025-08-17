<template>
  <div class="list-container">
    <div v-if="carregando" class="state-message">Carregando equipes...</div>
    <div v-else-if="listaEquipes.length === 0" class="state-message">
      Nenhuma equipe cadastrada.
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Nome da Equipe</th>
          <th>UBS Associada</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipe in listaEquipes" :key="equipe.id">
          <td>{{ equipe.nome }}</td>
          <td>{{ getUbsNome(equipe.ubsId) }}</td>
          <td class="actions">
            <button
              @click="$emit('editar', equipe)"
              class="btn-action btn-edit"
              title="Editar"
            >
              <Pencil :size="16" />
            </button>
            <button
              @click="$emit('excluir', equipe.id)"
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

const props = defineProps({
  listaEquipes: { type: Array, required: true },
  listaUbs: { type: Array, required: true },
  carregando: { type: Boolean, default: true },
});

defineEmits(["editar", "excluir"]);

const getUbsNome = (ubsId) => {
  const ubs = props.listaUbs.find((u) => u.id === ubsId);
  return ubs ? ubs.nome : "UBS não encontrada";
};
</script>

<style lang="scss" scoped>
/* Estilos idênticos ao UbsList para consistência */
.list-container {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table td,
.data-table th {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
.data-table th {
  background-color: #fafafa;
  font-weight: 600;
}
.data-table .actions {
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
  color: #fff;
}
.btn-action.btn-delete {
  background-color: #dc3545;
  color: #fff;
}
.state-message {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>
