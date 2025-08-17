<template>
  <div class="list-container">
    <div v-if="carregando" class="state-message">
      Carregando profissionais...
    </div>
    <div v-else-if="listaProfissionais.length === 0" class="state-message">
      Nenhum profissional cadastrado para esta equipe nesta competência.
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>Cargo</th>
          <th>Registro</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prof in listaProfissionais" :key="prof.id">
          <td>{{ prof.nome }}</td>
          <td>{{ prof.cpf || "-" }}</td>
          <td>{{ prof.cargo }}</td>
          <td>{{ prof.registro || "-" }}</td>
          <td>
            <span :class="['status-badge', prof.status]">{{
              prof.status
            }}</span>
          </td>
          <td class="actions">
            <button
              @click="$emit('editar', prof)"
              :disabled="!edicaoHabilitada"
              class="btn-action btn-edit"
              title="Editar"
            >
              <Pencil :size="16" />
            </button>
            <button
              @click="$emit('excluir', prof.id)"
              :disabled="!edicaoHabilitada"
              class="btn-action btn-delete"
              title="Remover"
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

defineProps({
  listaProfissionais: { type: Array, required: true },
  carregando: { type: Boolean, default: true },
  edicaoHabilitada: { type: Boolean, default: true },
});

defineEmits(["editar", "excluir"]);
</script>

<style lang="scss" scoped>
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
  vertical-align: middle;
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
.btn-action:disabled {
  background-color: #ccc !important;
  transform: none;
  cursor: not-allowed;
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
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  &.Ativo {
    background-color: #28a745;
  }
  &.Férias {
    background-color: #17a2b8;
  }
  &.Inativo {
    background-color: #6c757d;
  }
}
</style>
