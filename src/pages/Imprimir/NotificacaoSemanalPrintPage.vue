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
          <p>ESTADO DO CEARÁ</p>
          <p>Secretaria da Saúde</p>
          <p>Célula de Vigilância Epidemiológica</p>
          <h3>NOTIFICAÇÃO NEGATIVA / POSITIVA SEMANAL</h3>
        </div>
      </header>

      <div class="info-section">
        <div><strong>MUNICÍPIO:</strong> Granja</div>
        <div>
          <strong>SEMANA EPIDEMIOLÓGICA:</strong> {{ competenciaInfo.semana }} /
          {{ competenciaInfo.ano }}
        </div>
        <div>
          <strong>EQUIPE:</strong> {{ equipe?.nome || "Não informada" }}
        </div>
        <div>
          <strong>UBS:</strong> {{ equipe?.ubsNome || "Não informada" }}
        </div>
      </div>

      <div class="notification-section">
        <h4>Houve notificação de casos suspeitos de:</h4>
        <div class="check-item">
          <strong>TÉTANO NEONATAL:</strong>
          <span
            >( {{ producao.tetanoNeonatal === "sim" ? "X" : "&nbsp;" }} )
            SIM</span
          >
          <span
            >( {{ producao.tetanoNeonatal === "nao" ? "X" : "&nbsp;" }} )
            NÃO</span
          >
        </div>
        <div class="check-item">
          <strong>PARALISIA FLÁCIDA AGUDA:</strong>
          <span
            >( {{ producao.paralisiaFlacida === "sim" ? "X" : "&nbsp;" }} )
            SIM</span
          >
          <span
            >( {{ producao.paralisiaFlacida === "nao" ? "X" : "&nbsp;" }} )
            NÃO</span
          >
        </div>
        <div class="check-item">
          <strong>Nº DE CASOS SUSPEITOS DE SARAMPO:</strong>
          <span>{{ producao.casosSuspeitosSarampo || 0 }}</span>
        </div>
      </div>

      <div v-if="producao.casosParalisia && producao.casosParalisia.length > 0">
        <h4 class="table-title">
          INVESTIGAÇÃO DE CASOS DE PARALISIA FLÁCIDA AGUDA
        </h4>
        <table class="print-table">
          <thead>
            <tr>
              <th rowspan="2">Nome do Paciente</th>
              <th rowspan="2">Data de Nascimento</th>
              <th rowspan="2">Idade</th>
              <th rowspan="2">Vacinação (Poliomielite)</th>
              <th rowspan="2">Notificação (SINAN)</th>
              <th colspan="2">Investigação</th>
            </tr>
            <tr>
              <th>Data</th>
              <th>Concluída</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in producao.casosParalisia" :key="index">
              <td class="align-left">{{ item.nome }}</td>
              <td>{{ formatDate(item.dataNascimento) }}</td>
              <td>{{ item.idade }}</td>
              <td>{{ item.vacinacao }}</td>
              <td>{{ item.notificacaoSinan }}</td>
              <td>{{ formatDate(item.dataInvestigacao) }}</td>
              <td>{{ item.investigacaoConcluida ? "Sim" : "Não" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Responsável pela Notificação</p>
      </div>
    </div>
    <div v-else>Nenhum dado encontrado para esta competência.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { notificacaoSemanalService } from "@/services/notificacaoSemanalService";
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
    notificacaoSemanalService.getDadosCompetencia(documentoId),
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
.notification-section {
  border: 1px solid #000;
  padding: 15px;
  h4 {
    margin-top: 0;
    text-align: center;
  }
  .check-item {
    margin-top: 15px;
    font-size: 1.1rem;
    span {
      margin-left: 20px;
    }
  }
}
.print-table {
  font-size: 9pt;
  margin-top: 1.5rem;
}
.print-table td.align-left {
  text-align: left;
}
.table-title {
  text-align: center;
  font-weight: bold;
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
