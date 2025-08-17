<template>
  <div class="table-responsive">
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2">Nome do Paciente</th>
          <th rowspan="2">Data de Nascimento</th>
          <th rowspan="2">Idade</th>
          <th rowspan="2">Vacinação (Poliomielite)</th>
          <th rowspan="2">Notificação (SINAN)</th>
          <th colspan="2">Investigação</th>
          <th rowspan="2">Ações</th>
        </tr>
        <tr>
          <th>Data</th>
          <th>Concluída</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in casos" :key="index">
          <td><input type="text" v-model="item.nome" /></td>
          <td><input type="date" v-model="item.dataNascimento" /></td>
          <td>
            <input type="text" v-model="item.idade" style="width: 80px" />
          </td>
          <td>
            <select v-model="item.vacinacao">
              <option :value="null" disabled>Selecione</option>
              <option value="adequada">Adequada</option>
              <option value="inadequada">Inadequada</option>
              <option value="nao vacinado">Não Vacinado</option>
              <option value="ignorado">Ignorado</option>
            </select>
          </td>
          <td>
            <select v-model="item.notificacaoSinan">
              <option :value="null" disabled>Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </td>
          <td><input type="date" v-model="item.dataInvestigacao" /></td>
          <td>
            <select v-model="item.investigacaoConcluida">
              <option :value="null" disabled>Selecione</option>
              <option :value="true">Sim</option>
              <option :value="false">Não</option>
            </select>
          </td>
          <td>
            <button
              @click="$emit('remover', index)"
              class="remove-btn"
              title="Remover Caso"
            >
              <Trash2 :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="$emit('adicionar')" class="add-btn">
      <Plus :size="16" /> Adicionar Caso Suspeito
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Plus, Trash2 } from "lucide-vue-next";

const props = defineProps({ modelValue: { type: Array, required: true } });
const emit = defineEmits(["update:modelValue", "adicionar", "remover"]);

const casos = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<style scoped lang="scss">
.table-responsive {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.85rem;

  th,
  td {
    border: 1px solid #ddd;
    padding: 6px 8px;
    text-align: center;
    vertical-align: middle;
  }
  th {
    background-color: #f2f2f2;
  }
  input,
  select {
    width: 100%;
    min-width: 130px;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
}
.add-btn,
.remove-btn {
  background: none;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}
.add-btn {
  border-color: #007bff;
  color: #007bff;
  &:hover {
    background-color: #e7f3ff;
  }
}
.remove-btn {
  border: none;
  color: #dc3545;
  &:hover {
    background-color: #fbe6e8;
  }
}
</style>
