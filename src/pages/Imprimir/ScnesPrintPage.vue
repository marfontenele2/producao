<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <div v-if="!loading" class="print-content">
      <header class="print-header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="header-text">
          <h4>Relação de Profissionais (SCNES)</h4>
        </div>
      </header>

      <div class="info-section">
        <div>
          <strong>Equipe:</strong> {{ equipe?.nome || "Carregando..." }}
        </div>
        <div>
          <strong>UBS:</strong> {{ equipe?.ubsNome || "Carregando..." }}
        </div>
        <div>
          <strong>Competência:</strong>
          {{ formatarCompetencia(props.competencia) }}
        </div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th>Nome do Profissional</th>
            <th>CPF</th>
            <th>CBO</th>
            <th>Cargo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="profissional in listaProfissionais" :key="profissional.id">
            <td class="align-left">{{ profissional.nome }}</td>
            <td>{{ formatarCPF(profissional.cpf) }}</td>
            <td>{{ profissional.cbo }}</td>
            <td>{{ profissional.cargo }}</td>
          </tr>
          <tr v-if="listaProfissionais.length === 0">
            <td colspan="4">
              Nenhum profissional cadastrado para esta competência.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Assinatura do Gerente da UBS</p>
      </div>
    </div>
    <BaseSpinner v-else text="Carregando dados para impressão..." />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { scnesService } from "@/services/scnesService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { formatarCompetencia } from "@/utils/dateUtils";
// ✅ INÍCIO DA INSERÇÃO: Importando a nova função de formatação
import { formatarCPF } from "@/utils/formatUtils";
// ✅ FIM DA INSERÇÃO
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Printer } from "lucide-vue-next";

const props = defineProps({
  competencia: { type: String, required: true },
  equipeId: { type: String, required: true },
});

const loading = ref(true);
const listaProfissionais = ref([]);
const equipe = ref(null);

onMounted(async () => {
  const documentoId = `${props.competencia}_${props.equipeId}`;
  const [profissionais, dadosEquipe] = await Promise.all([
    scnesService.getProfissionais(documentoId),
    getEquipeInfo(props.equipeId),
  ]);

  listaProfissionais.value = profissionais;
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
.print-table td.align-left {
  text-align: left;
}
.signature-area {
  margin-top: 4cm;
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
