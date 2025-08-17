<template>
  <h4 class="table-title">MÉTODOS CONTRACEPTIVOS</h4>
  <table class="print-table report-table">
    <thead>
      <tr>
        <th rowspan="2">Métodos</th>
        <th colspan="2">10-14 anos</th>
        <th colspan="2">15-19 anos</th>
        <th rowspan="2">TOTAL</th>
        <th rowspan="2">ESTOQUE ATUAL</th>
      </tr>
      <tr>
        <th>Masc</th>
        <th>Fem</th>
        <th>Masc</th>
        <th>Fem</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in metodos" :key="item.key">
        <td>{{ item.label }}</td>
        <td>{{ dados.metodos[item.key]?.masc1 || 0 }}</td>
        <td>{{ dados.metodos[item.key]?.fem1 || 0 }}</td>
        <td>{{ dados.metodos[item.key]?.masc2 || 0 }}</td>
        <td>{{ dados.metodos[item.key]?.fem2 || 0 }}</td>
        <td class="total-cell">{{ totais.metodos[item.key] || 0 }}</td>
        <td>{{ dados.metodos[item.key]?.estoque || 0 }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  dados: { type: Object, required: true },
});

const metodos = ref([
  { key: "preservativoMasc", label: "PRESER. MASC." },
  { key: "anticoncepcionalOral", label: "ANTICONC. ORAL" },
  { key: "anticoncepcionalInjetavel", label: "ANTICONC. INJETÁVEL" },
]);

const totais = computed(() => {
  const p = props.dados;
  if (!p || !p.metodos) {
    return { metodos: {} };
  }
  const num = (val) => Number(val) || 0;
  const resultados = { metodos: {} };
  metodos.value.forEach((item) => {
    const d = p.metodos[item.key];
    resultados.metodos[item.key] =
      num(d?.masc1) + num(d?.fem1) + num(d?.masc2) + num(d?.fem2);
  });
  return resultados;
});
</script>

<style scoped>
.table-title {
  margin-top: 1.5rem;
  text-align: center;
  font-weight: bold;
}
.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 9pt;
}
.print-table th,
.print-table td {
  border: 1px solid #000;
  padding: 4px;
  text-align: center;
  vertical-align: middle;
}
.print-table thead th {
  font-weight: bold;
}
.print-table td:first-child {
  text-align: left;
}
</style>
