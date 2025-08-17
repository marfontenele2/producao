<template>
  <div class="table-responsive">
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2">SINAN Nº</th>
          <th rowspan="2">Nome</th>
          <th rowspan="2">Idade</th>
          <th rowspan="2">Suspeito</th>
          <th rowspan="2">Data Not.</th>
          <th rowspan="2">Data Inves.</th>
          <th colspan="2">Bloqueio</th>
          <th rowspan="2">Data Exant.</th>
          <th rowspan="2">Data Soro</th>
          <th rowspan="2">Diagnóstico Final</th>
          <th rowspan="2">Ações</th>
        </tr>
        <tr>
          <th>Status</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in casos" :key="index">
          <td><input type="text" v-model="item.sinan" /></td>
          <td><input type="text" v-model="item.nome" /></td>
          <td>
            <input type="text" v-model="item.idade" style="width: 60px" />
          </td>
          <td>
            <select v-model="item.suspeito">
              <option :value="null" disabled>Selecione</option>
              <option value="S">Sarampo</option>
              <option value="R">Rubéola</option>
              <option value="D">Dengue</option>
              <option value="O">Outras Exan.</option>
            </select>
          </td>
          <td><input type="date" v-model="item.dataNotificacao" /></td>
          <td><input type="date" v-model="item.dataInvestigacao" /></td>
          <td>
            <select v-model="item.bloqueioStatus">
              <option :value="null" disabled>Selecione</option>
              <option value="RE">Realizado</option>
              <option value="NR">Não Realizado</option>
              <option value="NI">Não Indicado</option>
            </select>
          </td>
          <td><input type="date" v-model="item.dataBloqueio" /></td>
          <td><input type="date" v-model="item.dataExantema" /></td>
          <td><input type="date" v-model="item.dataSoro" /></td>
          <td>
            <select v-model="item.diagnosticoFinal">
              <option :value="null" disabled>Selecione</option>
              <option value="S">Sarampo</option>
              <option value="R">Rubéola</option>
              <option value="D">Dengue</option>
              <option value="O">Outras Exan.</option>
              <option value="SR">Soro Reagente</option>
              <option value="SNR">Soro Não Reagente</option>
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
    padding: 6px;
    text-align: center;
    vertical-align: middle;
  }
  th {
    background-color: #f2f2f2;
  }
  input,
  select {
    width: 100%;
    min-width: 120px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  input[type="date"] {
    min-width: 130px;
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
