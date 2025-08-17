// 📄 ARQUIVO: src/components/gerente/PacienteList.vue
<template>
  <div class="table-container">
    <table class="paciente-table">
      <thead>
        <tr>
          <th>Nome do Paciente</th>
          <th>CNS</th>
          <th>Acomp. na UBS</th>
          <th>Acomp. no CAPS</th>
          <th>Recebe Medicação</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="paciente in pacientes" :key="paciente.id">
          <td>
            <div class="paciente-info">
              <span class="nome">{{ paciente.nome }}</span>
              <span class="mae">Mãe: {{ paciente.nomeMae }}</span>
            </div>
          </td>
          <td>{{ paciente.cns }}</td>
          <td>
            <input
              type="checkbox"
              :checked="acompanhamentos[paciente.id]?.acompUBS"
              @change="
                updateAcompanhamento(
                  paciente.id,
                  'acompUBS',
                  $event.target.checked
                )
              "
            />
          </td>
          <td>
            <input
              type="checkbox"
              :checked="acompanhamentos[paciente.id]?.acompCAPS"
              @change="
                updateAcompanhamento(
                  paciente.id,
                  'acompCAPS',
                  $event.target.checked
                )
              "
            />
          </td>
          <td>
            <input
              type="checkbox"
              :checked="acompanhamentos[paciente.id]?.recebeMedicacao"
              @change="
                updateAcompanhamento(
                  paciente.id,
                  'recebeMedicacao',
                  $event.target.checked
                )
              "
            />
          </td>
          <td class="actions">
            <button
              @click="$emit('edit', paciente)"
              class="btn-action btn-edit"
              title="Editar Dados do Paciente"
            >
              <Pencil :size="16" />
            </button>
            <button
              @click="$emit('delete', paciente.id)"
              class="btn-action btn-delete"
              title="Remover Paciente da Lista"
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
  pacientes: { type: Array, required: true },
  acompanhamentos: { type: Object, required: true },
});

const emit = defineEmits(["update:acompanhamento", "edit", "delete"]);

const updateAcompanhamento = (pacienteId, campo, valor) => {
  emit("update:acompanhamento", { pacienteId, campo, valor });
};
</script>

<style lang="scss" scoped>
.paciente-table {
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
  }
  th {
    background-color: #fafafa;
    font-weight: 600;
  }
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}
.paciente-info {
  display: flex;
  flex-direction: column;
  .nome {
    font-weight: 500;
  }
  .mae {
    font-size: 0.8rem;
    color: #666;
  }
}
.actions {
  text-align: right;
  display: flex;
  gap: 10px;
}
.btn-action {
  /* Estilos dos botões de ação (editar/excluir) */
}
</style>
