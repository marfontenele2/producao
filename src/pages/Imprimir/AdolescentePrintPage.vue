<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <div v-if="dados" class="report-content form-page">
      <header class="print-header">
        <img
          src="@/assets/logo.png"
          alt="Logo da Prefeitura"
          class="logo-prefeitura"
        />
        <div class="header-text">
          <p>PREFEITURA MUNICIPAL DE GRANJA</p>
          <p>SECRETARIA MUNICIPAL DE GRANJA</p>
          <h4>
            RELATÓRIO MENSAL DO ATENDIMENTO AO ADOLESCENTE NA ATENÇÃO PRIMÁRIA
          </h4>
        </div>
        <div class="header-info">
          <p>MUNICÍPIO: GRANJA</p>
          <p>REF. AO MÊS: {{ formatarCompetencia(props.competencia) }}</p>
          <p>
            DATA DA INFORMAÇÃO: {{ new Date().toLocaleDateString("pt-BR") }}
          </p>
        </div>
      </header>

      <table class="print-table">
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

      <h4 class="table-title">MÉTODOS CONTRACEPTIVOS</h4>
      <table class="print-table">
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

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Assinatura do Enfermeiro da APS</p>
      </div>
    </div>
    <div v-else>Carregando dados para impressão...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps } from "vue";
import { adolescenteService } from "@/services/adolescenteService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-vue-next";

const props = defineProps({
  competencia: { type: String, required: true },
  equipeId: { type: String, required: true },
});

const dados = ref(null);
const nomeUbs = ref("");
const nomeEquipe = ref("");

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
const metodos = ref([
  { key: "preservativoMasc", label: "PRESER. MASC." },
  { key: "anticoncepcionalOral", label: "ANTICONC. ORAL" },
  { key: "anticoncepcionalInjetavel", label: "ANTICONC. INJETÁVEL" },
]);

const formatarCompetencia = (comp) => {
  if (!comp) return "";
  const [ano, mes] = comp.split("-");
  return `${mes}/${ano}`;
};
const imprimirPagina = () => window.print();

const totais = computed(() => {
  const p = dados.value;
  if (!p || !p.atendimentos) {
    return { atendimentos: {}, metodos: {}, geralAtendimentos: {} };
  }
  const num = (val) => Number(val) || 0;

  const resultados = {
    atendimentos: {},
    metodos: {},
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

  metodos.value.forEach((item) => {
    const d = p.metodos[item.key];
    resultados.metodos[item.key] =
      num(d?.masc1) + num(d?.fem1) + num(d?.masc2) + num(d?.fem2);
  });

  return resultados;
});

onMounted(async () => {
  const documentoId = `${props.competencia}_${props.equipeId}`;
  dados.value = await adolescenteService.getDadosCompetencia(documentoId);

  if (props.equipeId) {
    const equipeDoc = await getDoc(doc(db, "equipes", props.equipeId));
    if (equipeDoc.exists()) {
      nomeEquipe.value = equipeDoc.data().nome;
      const ubsId = equipeDoc.data().ubsId;
      if (ubsId) {
        const ubsDoc = await getDoc(doc(db, "ubs", ubsId));
        if (ubsDoc.exists()) nomeUbs.value = ubsDoc.data().nome;
      }
    }
  }
});
</script>

<style scoped>
.print-container {
  font-family: "Times New Roman", Times, serif;
  color: #000;
}
.print-actions {
  padding: 1rem;
  text-align: right;
}
.print-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}
.form-page {
  border: 2px solid #000;
  padding: 1cm;
  max-width: 21cm;
  margin: 0 auto 2rem auto;
}
.print-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid #000;
  padding-bottom: 1rem;
}
.logo-prefeitura {
  width: 80px;
  height: auto;
  justify-self: start;
}
.header-text h4 {
  margin: 5px 0;
  font-size: 14pt;
}
.header-text p {
  margin: 0;
  font-size: 12pt;
}
.header-info {
  text-align: left;
  font-size: 10pt;
  align-self: end;
}
.header-info p {
  margin: 0;
}
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
.print-table tfoot th,
.print-table tfoot td {
  font-weight: bold;
}
.print-table td:first-child {
  text-align: left;
}
.print-table .section-header td {
  background-color: #e9ecef;
  font-weight: bold;
  text-align: left;
}
.signature-area {
  margin-top: 4cm;
  text-align: center;
}
.signature-line {
  border-bottom: 1px solid #000;
  width: 80%;
  margin: 0 auto;
}
.signature-title {
  margin-top: 8px;
  font-size: 10pt;
}
.print-footer {
  text-align: center;
  font-size: 8pt;
  margin-top: 2rem;
}

@media print {
  body {
    background-color: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-actions {
    display: none;
  }
  .form-page {
    border: none;
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  @page {
    size: A4 portrait;
    margin: 2cm;
  }
}
</style>
