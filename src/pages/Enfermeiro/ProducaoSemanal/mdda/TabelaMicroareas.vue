<template>
  <div class="table-responsive">
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2">Microárea</th>
          <th colspan="6">Faixa Etária</th>
          <th colspan="3">Plano de Tratamento</th>
          <th colspan="3">Surtos</th>
        </tr>
        <tr>
          <th>&lt;1</th>
          <th>1-4</th>
          <th>5-9</th>
          <th>10+</th>
          <th>Ign</th>
          <th>Total</th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>Nº</th>
          <th>Invest.</th>
          <th>Ñ Inf.</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in microareas" :key="index">
          <td>
            <input
              type="text"
              v-model="item.nome"
              placeholder="Nome da Microárea"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="item.faixaEtaria['<1']"
              min="0"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="item.faixaEtaria['1-4']"
              min="0"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="item.faixaEtaria['5-9']"
              min="0"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="item.faixaEtaria['10+']"
              min="0"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="item.faixaEtaria.ign"
              min="0"
            />
          </td>
          <td class="total-cell">
            {{ calcularTotalFaixaEtaria(item.faixaEtaria) }}
          </td>
          <td><input type="number" v-model.number="item.plano.a" min="0" /></td>
          <td><input type="number" v-model.number="item.plano.b" min="0" /></td>
          <td><input type="number" v-model.number="item.plano.c" min="0" /></td>
          <td>
            <input type="number" v-model.number="item.surtos.num" min="0" />
          </td>
          <td>
            <input type="number" v-model.number="item.surtos.invest" min="0" />
          </td>
          <td>
            <input type="number" v-model.number="item.surtos.naoInf" min="0" />
          </td>
          <td>
            <button
              @click="$emit('remover', index)"
              class="remove-btn"
              title="Remover linha"
            >
              <Trash2 :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="$emit('adicionar')" class="add-btn">
      <Plus :size="16" /> Adicionar Microárea
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";
import { Plus, Trash2 } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "adicionar", "remover"]);

const microareas = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const calcularTotalFaixaEtaria = (faixa) => {
  return (
    (faixa["<1"] || 0) +
    (faixa["1-4"] || 0) +
    (faixa["5-9"] || 0) +
    (faixa["10+"] || 0) +
    (faixa.ign || 0)
  );
};
</script>

<style scoped lang="scss">
.table-responsive {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
    vertical-align: middle;
  }
  th {
    background-color: #f2f2f2;
  }
  input[type="text"] {
    width: 120px;
  }
  input[type="number"] {
    width: 60px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px;
  }
  .total-cell {
    font-weight: bold;
    background-color: #e9ecef;
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
