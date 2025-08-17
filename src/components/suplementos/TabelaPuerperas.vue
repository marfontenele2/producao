<template>
  <div class="table-container">
    <h3 class="table-title">
      3- MULHERES ATÉ O 3º MÊS PÓS-PARTO E O 3º MÊS PÓS-ABORTO
    </h3>
    <table>
      <thead>
        <tr>
          <th rowspan="2">Tipo de Suplemento</th>
          <th colspan="3">Quantidade de Entregas</th>
        </tr>
        <tr>
          <th>1ª Entrega</th>
          <th>2ª Entrega</th>
          <th>3ª Entrega</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Xarope de Sulfato Ferroso</td>
          <td>
            <input
              type="number"
              v-model.number="dados.xaropeSulfatoFerroso.entrega1"
              :disabled="disabled"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="dados.xaropeSulfatoFerroso.entrega2"
              :disabled="disabled"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="dados.xaropeSulfatoFerroso.entrega3"
              :disabled="disabled"
            />
          </td>
        </tr>
        <tr>
          <td>Comprimido de Sulfato Ferroso</td>
          <td>
            <input
              type="number"
              v-model.number="dados.comprimidoSulfatoFerroso.entrega1"
              :disabled="disabled"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="dados.comprimidoSulfatoFerroso.entrega2"
              :disabled="disabled"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="dados.comprimidoSulfatoFerroso.entrega3"
              :disabled="disabled"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineModel, defineProps } from "vue";

// ✅ CORREÇÃO: Removido "const props ="
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const dados = defineModel({
  type: Object,
  required: true,
});
</script>

<style scoped>
/* ✅ CORREÇÃO DE ESTILO */
.table-container {
  margin-bottom: 2rem;
  background-color: #f0f2f5; /* Cor de fundo "antiga" da página */
  padding: 1.5rem;
  border-radius: 8px;
}
.table-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
}
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}
th {
  background-color: #f8f9fa;
}
input {
  width: 80px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px;
}
input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}
</style>
