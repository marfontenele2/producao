<template>
  <table class="print-table report-table">
    <thead>
      <tr>
        <th rowspan="2">Atendimento - Motivo da consulta</th>
        <th colspan="2">10-14 anos</th>
        <th colspan="2">15-19 anos</th>
        <th>Cons. Médica</th>
        <th>Cons. Enferm</th>
        <th>Cons. Outros Profiss</th>
        <th>TOTAL</th>
      </tr>
      <tr>
        <th>Masc</th>
        <th>Fem</th>
        <th>Masc</th>
        <th>Fem</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in atendimentos" :key="item.key">
        <td>{{ item.label }}</td>
        <td>{{ dados.atendimentos[item.key]?.masc1 || 0 }}</td>
        <td>{{ dados.atendimentos[item.key]?.fem1 || 0 }}</td>
        <td>{{ dados.atendimentos[item.key]?.masc2 || 0 }}</td>
        <td>{{ dados.atendimentos[item.key]?.fem2 || 0 }}</td>
        <td>{{ dados.atendimentos[item.key]?.med || 0 }}</td>
        <td>{{ dados.atendimentos[item.key]?.enf || 0 }}</td>
        <td>{{ dados.atendimentos[item.key]?.outros || 0 }}</td>
        <td class="total-cell">
          {{ totais.atendimentos[item.key]?.faixaEtaria || 0 }}
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th>TOTAL</th>
        <td>{{ totais.geralAtendimentos.masc1 }}</td>
        <td>{{ totais.geralAtendimentos.fem1 }}</td>
        <td>{{ totais.geralAtendimentos.masc2 }}</td>
        <td>{{ totais.geralAtendimentos.fem2 }}</td>
        <td>{{ totais.geralAtendimentos.med }}</td>
        <td>{{ totais.geralAtendimentos.enf }}</td>
        <td>{{ totais.geralAtendimentos.outros }}</td>
        <td class="total-cell">{{ totais.geralAtendimentos.total }}</td>
      </tr>
    </tfoot>
  </table>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  dados: { type: Object, required: true },
});

const atendimentos = ref([
  { key: "acompanhamentoCrescimento", label: "Acompanhamento do Crescimento" },
  { key: "planejamentoFamiliar", label: "Planejamento Familiar" },
  { key: "imunizacao", label: "Imunização" },
  { key: "preNatal", label: "Pré-Natal" },
  { key: "ist", label: "IST" },
  { key: "queixasGineco", label: "Queixas Gineco" },
  { key: "queixasClinicas", label: "Queixas Clínicas" },
  { key: "dentista", label: "Dentista" },
  { key: "nutricao", label: "Nutrição" },
  { key: "transtornosEmocionais", label: "Transt. Emocionais" },
  { key: "oficinasEducativas", label: "Oficinas Educativas" },
]);

const totais = computed(() => {
  const p = props.dados;
  if (!p || !p.atendimentos) {
    return { atendimentos: {}, geralAtendimentos: {} };
  }
  const num = (val) => Number(val) || 0;
  const resultados = {
    atendimentos: {},
    geralAtendimentos: {
      masc1: 0,
      fem1: 0,
      masc2: 0,
      fem2: 0,
      med: 0,
      enf: 0,
      outros: 0,
      total: 0,
    },
  };
  atendimentos.value.forEach((item) => {
    const d = p.atendimentos[item.key];
    resultados.atendimentos[item.key] = {
      faixaEtaria: num(d?.masc1) + num(d?.fem1) + num(d?.masc2) + num(d?.fem2),
    };
    resultados.geralAtendimentos.masc1 += num(d?.masc1);
    resultados.geralAtendimentos.fem1 += num(d?.fem1);
    resultados.geralAtendimentos.masc2 += num(d?.masc2);
    resultados.geralAtendimentos.fem2 += num(d?.fem2);
    resultados.geralAtendimentos.med += num(d?.med);
    resultados.geralAtendimentos.enf += num(d?.enf);
    resultados.geralAtendimentos.outros += num(d?.outros);
  });
  resultados.geralAtendimentos.total =
    resultados.geralAtendimentos.masc1 +
    resultados.geralAtendimentos.fem1 +
    resultados.geralAtendimentos.masc2 +
    resultados.geralAtendimentos.fem2;
  return resultados;
});
</script>

<style scoped>
/* Estilos da tabela original de impressão */
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
.print-table tfoot th,
.print-table tfoot td {
  font-weight: bold;
}
.print-table td:first-child {
  text-align: left;
}
</style>
