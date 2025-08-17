<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" /> Imprimir
      </button>
    </div>

    <div v-if="!loading && producao" class="print-content">
      <header class="print-header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="header-text">
          <p>Secretaria da Saúde</p>
          <p>Célula de Vigilância Epidemiológica</p>
          <h4>
            Ficha de Atualização Semanal da Classificação dos Casos Notificados
            de Sarampo/Rubéola
          </h4>
        </div>
      </header>

      <div class="info-section">
        <div><strong>Município:</strong> Granja</div>
        <div>
          <strong>Semana/Ano de Notificação:</strong>
          {{ competenciaInfo.semana }} / {{ competenciaInfo.ano }}
        </div>
        <div><strong>Equipe:</strong> {{ equipe?.nome || "N/A" }}</div>
        <div><strong>UBS:</strong> {{ equipe?.ubsNome || "N/A" }}</div>
      </div>

      <table class="print-table">
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
          </tr>
          <tr>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in producao.casos" :key="index">
            <td>{{ item.sinan }}</td>
            <td class="align-left">{{ item.nome }}</td>
            <td>{{ item.idade }}</td>
            <td>{{ item.suspeito }}</td>
            <td>{{ formatDate(item.dataNotificacao) }}</td>
            <td>{{ formatDate(item.dataInvestigacao) }}</td>
            <td>{{ item.bloqueioStatus }}</td>
            <td>{{ formatDate(item.dataBloqueio) }}</td>
            <td>{{ formatDate(item.dataExantema) }}</td>
            <td>{{ formatDate(item.dataSoro) }}</td>
            <td>{{ item.diagnosticoFinal }}</td>
          </tr>
          <tr v-for="n in 10 - producao.casos.length" :key="'blank-' + n">
            <td v-for="i in 11" :key="i">&nbsp;</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-section">
        <p><strong>Número de Casos Acumulados até esta semana:</strong></p>
        <p>Sarampo: {{ producao.acumuladoSarampo || 0 }}</p>
        <p>Rubéola: {{ producao.acumuladoRubeola || 0 }}</p>
      </div>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Responsável pela Notificação</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { sarampoService } from "@/services/sarampoService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Printer } from "lucide-vue-next";

const props = defineProps({ competencia: String, equipeId: String });
const loading = ref(true);
const producao = ref(null);
const equipe = ref(null);
const documentoId = `${props.competencia}_${props.equipeId}`;

const competenciaInfo = computed(() => {
  if (!props.competencia) return { ano: "", semana: "" };
  const [ano, semana] = props.competencia.split("-W");
  return { ano, semana: semana.replace(/^0+/, "") };
});

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

onMounted(async () => {
  const [dadosProducao, dadosEquipe] = await Promise.all([
    sarampoService.getDadosCompetencia(documentoId),
    getEquipeInfo(props.equipeId),
  ]);
  producao.value = dadosProducao;
  equipe.value = dadosEquipe;
  loading.value = false;
  setTimeout(() => window.print(), 500);
});

const getEquipeInfo = async (equipeId) => {
  if (!equipeId) return null;
  const equipeRef = doc(db, "equipes", equipeId);
  const equipeSnap = await getDoc(equipeRef);
  if (!equipeSnap.exists()) return null;
  const equipeData = equipeSnap.data();

  const ubsRef = doc(db, "ubs", equipeData.ubsId);
  const ubsSnap = await getDoc(ubsRef);
  equipeData.ubsNome = ubsSnap.exists() ? ubsSnap.data().nome : "N/A";

  return equipeData;
};

const imprimirPagina = () => window.print();
</script>

<style scoped lang="scss">
@import "@/assets/styles/print-layout.scss";
.print-actions {
  padding: 1rem;
  text-align: right;
  @media print {
    display: none;
  }
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
.print-header {
  display: flex;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid #000;
  padding-bottom: 1rem;
  gap: 1rem;
}
.logo {
  width: 80px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  p {
    margin: 0;
  }
  h4 {
    margin: 5px 0;
  }
}
.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 20px;
  margin: 20px 0;
  border: 1px solid #000;
  padding: 10px;
}
.print-table {
  font-size: 9pt;
}
.print-table td.align-left {
  text-align: left;
}
.summary-section {
  margin-top: 1.5rem;
}
.signature-area {
  margin-top: 3cm;
  text-align: center;
}
.signature-line {
  border-bottom: 1px solid #000;
  width: 300px;
  margin: 0 auto;
}
.signature-title {
  margin-top: 8px;
  font-size: 10pt;
}
</style>
