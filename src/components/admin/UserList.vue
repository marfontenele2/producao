<template>
  <div class="list-container">
    <div v-if="carregando" class="state-message">Carregando usuários...</div>
    <div v-else-if="listaUsuarios.length === 0" class="state-message">
      Nenhum usuário cadastrado.
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Perfil</th>
          <th>UBS</th>
          <th>Equipe</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in listaUsuarios" :key="usuario.id">
          <td>{{ usuario.nome }}</td>
          <td>{{ usuario.email }}</td>
          <td>
            <span :class="['role-badge', usuario.role]">{{
              usuario.role
            }}</span>
          </td>
          <td>{{ getUbsNome(usuario.ubsId) }}</td>
          <td>{{ getEquipeNome(usuario.equipeId) }}</td>
          <td class="actions">
            <button
              @click="$emit('editar', usuario)"
              class="btn-action btn-edit"
              title="Editar"
            >
              <Pencil :size="16" />
            </button>
            <button
              @click="$emit('excluir', usuario.id)"
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
  listaUsuarios: { type: Array, required: true },
  listaUbs: { type: Array, required: true },
  listaEquipes: { type: Array, required: true },
  carregando: { type: Boolean, default: true },
});

defineEmits(["editar", "excluir"]);

const getUbsNome = (ubsId) => {
  if (!ubsId) return "N/A";
  const ubs = props.listaUbs.find((u) => u.id === ubsId);
  return ubs ? ubs.nome : "Inválida";
};

const getEquipeNome = (equipeId) => {
  if (!equipeId) return "Nenhuma";
  const equipe = props.listaEquipes.find((e) => e.id === equipeId);
  return equipe ? equipe.nome : "Inválida";
};
</script>

<style lang="scss" scoped>
/* Estilos consistentes com as outras listas */
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
.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;

  &.Administrador {
    background-color: #dc3545;
  }
  &.Gerente {
    background-color: #007bff;
  }
  &.Enfermeiro {
    background-color: #28a745;
  }
}
</style>
