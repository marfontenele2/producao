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
          <h4>Acompanhamento de Gestantes por Risco</h4>
          <p>
            <strong>Competência:</strong>
            {{ formatarCompetencia(props.competencia) }}
          </p>
          <p>
            <strong>UBS:</strong> {{ nomeUbs }} | <strong>Equipe:</strong>
            {{ nomeEquipe }}
          </p>
        </div>
      </header>

      <table class="print-table">
        <thead>
          <tr>
            <th>Classificação de Risco</th>
            <th>Total de Gestantes</th>
            <th>Branca</th>
            <th>Parda</th>
            <th>Preta</th>
            <th>Soma</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Risco Habitual</td>
            <td>{{ dados.riscoHabitual?.total || 0 }}</td>
            <td>{{ dados.riscoHabitual?.branca || 0 }}</td>
            <td>{{ dados.riscoHabitual?.parda || 0 }}</td>
            <td>{{ dados.riscoHabitual?.preta || 0 }}</td>
            <td>{{ totais.riscoHabitual }}</td>
          </tr>
          <tr>
            <td>Risco Intermediário</td>
            <td>{{ dados.riscoIntermediario?.total || 0 }}</td>
            <td>{{ dados.riscoIntermediario?.branca || 0 }}</td>
            <td>{{ dados.riscoIntermediario?.parda || 0 }}</td>
            <td>{{ dados.riscoIntermediario?.preta || 0 }}</td>
            <td>{{ totais.riscoIntermediario }}</td>
          </tr>
          <tr>
            <td>Alto Risco</td>
            <td>{{ dados.altoRisco?.total || 0 }}</td>
            <td>{{ dados.altoRisco?.branca || 0 }}</td>
            <td>{{ dados.altoRisco?.parda || 0 }}</td>
            <td>{{ dados.altoRisco?.preta || 0 }}</td>
            <td>{{ totais.altoRisco }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th>Total Geral</th>
            <td>{{ totais.geral.total }}</td>
            <td>{{ totais.geral.branca }}</td>
            <td>{{ totais.geral.parda }}</td>
            <td>{{ totais.geral.preta }}</td>
            <td>{{ totais.geral.soma }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Assinatura do(a) Enfermeiro(a)</p>
      </div>

      <footer class="print-footer">
        <p>Gerado em: {{ new Date().toLocaleString("pt-BR") }}</p>
      </footer>
    </div>
    <div v-else>Carregando dados para impressão...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps } from "vue";
import { gestantesService } from "@/services/gestantesService";
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

const formatarCompetencia = (comp) => {
  if (!comp) return "";
  const [ano, mes] = comp.split("-");
  return `${mes}/${ano}`;
};
const imprimirPagina = () => window.print();

const totais = computed(() => {
  const p = dados.value;
  if (!p) return { geral: {} };
  const num = (val) => Number(val) || 0;

  const riscoHabitual =
    num(p.riscoHabitual?.branca) +
    num(p.riscoHabitual?.parda) +
    num(p.riscoHabitual?.preta);
  const riscoIntermediario =
    num(p.riscoIntermediario?.branca) +
    num(p.riscoIntermediario?.parda) +
    num(p.riscoIntermediario?.preta);
  const altoRisco =
    num(p.altoRisco?.branca) +
    num(p.altoRisco?.parda) +
    num(p.altoRisco?.preta);

  return {
    riscoHabitual,
    riscoIntermediario,
    altoRisco,
    geral: {
      total:
        num(p.riscoHabitual?.total) +
        num(p.riscoIntermediario?.total) +
        num(p.altoRisco?.total),
      branca:
        num(p.riscoHabitual?.branca) +
        num(p.riscoIntermediario?.branca) +
        num(p.altoRisco?.branca),
      parda:
        num(p.riscoHabitual?.parda) +
        num(p.riscoIntermediario?.parda) +
        num(p.altoRisco?.parda),
      preta:
        num(p.riscoHabitual?.preta) +
        num(p.riscoIntermediario?.preta) +
        num(p.altoRisco?.preta),
      soma: riscoHabitual + riscoIntermediario + altoRisco,
    },
  };
});

onMounted(async () => {
  const documentoId = `${props.competencia}_${props.equipeId}`;
  dados.value = await gestantesService.getDadosCompetencia(documentoId);

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
  text-align: right;
  padding: 1rem;
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
  padding: 1cm;
  max-width: 21cm;
  margin: 0 auto;
}
.print-header {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: center;
  border-bottom: 1px solid #000;
  padding-bottom: 1rem;
}
.logo-prefeitura {
  width: 80px;
  height: auto;
}
.header-text {
  flex-grow: 1;
}
.header-text h4 {
  margin: 0;
}
.header-text p {
  margin: 4px 0 0;
  font-size: 0.9rem;
}
.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
}
.print-table th,
.print-table td {
  border: 1px solid #000;
  padding: 0.5rem;
  text-align: center;
}
.print-table td:first-child {
  text-align: left;
}
.print-table tfoot {
  font-weight: bold;
}
.signature-area {
  margin-top: 4cm;
  text-align: center;
}
.signature-line {
  border-bottom: 1px solid #000;
  width: 70%;
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
  }
  .print-actions {
    display: none;
  }
  .form-page {
    margin: 0;
    padding: 0;
  }
  @page {
    size: A4;
    margin: 2cm;
  }
}
</style>
