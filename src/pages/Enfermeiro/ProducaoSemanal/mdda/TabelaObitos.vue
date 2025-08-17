<template>
  <div class="obitos-container">
    <div class="question">
      <span>Ocorreu óbito por diarreia?</span>
      <div class="radio-group">
        <label>
          <input type="radio" :value="'sim'" v-model="ocorreuObitoModel" /> Sim
        </label>
        <label>
          <input type="radio" :value="'nao'" v-model="ocorreuObitoModel" /> Não
        </label>
      </div>
    </div>
    <div v-if="ocorreuObitoModel === 'sim'" class="table-container">
      <h4>Óbitos por Faixa Etária</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>&lt;1</th>
            <th>1-4</th>
            <th>5-9</th>
            <th>10+</th>
            <th>Ign</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="number" v-model.number="obitosModel['<1']" min="0" />
            </td>
            <td>
              <input
                type="number"
                v-model.number="obitosModel['1-4']"
                min="0"
              />
            </td>
            <td>
              <input
                type="number"
                v-model.number="obitosModel['5-9']"
                min="0"
              />
            </td>
            <td>
              <input
                type="number"
                v-model.number="obitosModel['10+']"
                min="0"
              />
            </td>
            <td>
              <input type="number" v-model.number="obitosModel.Ing" min="0" />
            </td>
            <td class="total-cell">{{ totalObitos }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  obitos: { type: Object, required: true },
  ocorreuObito: { type: String, default: null },
});

const emit = defineEmits(["update:obitos", "update:ocorreuObito"]);

const obitosModel = computed({
  get: () => props.obitos,
  set: (value) => emit("update:obitos", value),
});

const ocorreuObitoModel = computed({
  get: () => props.ocorreuObito,
  set: (value) => emit("update:ocorreuObito", value),
});

const totalObitos = computed(() => {
  const obitos = obitosModel.value;
  return (
    (obitos["<1"] || 0) +
    (obitos["1-4"] || 0) +
    (obitos["5-9"] || 0) +
    (obitos["10+"] || 0) +
    (obitos.Ing || 0)
  );
});
</script>

<style scoped lang="scss">
.obitos-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
.question {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
.radio-group {
  display: flex;
  gap: 1rem;
}
.table-container h4 {
  margin-bottom: 0.5rem;
}
.data-table {
  width: 100%;
  max-width: 600px;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  th {
    background-color: #f2f2f2;
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
</style>
