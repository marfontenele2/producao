<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" />
        Imprimir
      </button>
    </div>

    <BaseSpinner v-if="loading" text="Carregando dados para impressão..." />
    <div v-else-if="producao" class="print-content">
      <header class="print-header">
        <p>SECRETARIA DA SAÚDE DO ESTADO DO CEARÁ</p>
        <p>Coordenadoria de Politicas em Saúde</p>
        <p>Célula de Informação em Saúde</p>
        <h3>MONITORIZAÇÃO DAS DOENÇAS DIARREICAS AGUDAS</h3>
      </header>

      <div class="info-section">
        <div>
          <strong>Unidade Básica de Saúde:</strong>
          {{ equipe?.ubsNome || "Não informado" }}
        </div>
        <div><strong>Município:</strong> Granja</div>
        <div>
          <strong>Equipe:</strong> {{ equipe?.nome || "Não informada" }}
        </div>
        <div>
          <strong>Semana Epidemiológica:</strong> {{ competenciaInfo.semana }}
        </div>
        <div>
          <strong>Ano Epidemiológico:</strong> {{ competenciaInfo.ano }}
        </div>
      </div>

      <table class="print-table">
        <thead>
          <tr>
            <th rowspan="2">MICROAREA</th>
            <th colspan="6">FAIXA ETÁRIA</th>
            <th colspan="3">PLANO DE TRATAMENTO</th>
            <th colspan="3">SURTOS</th>
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
          <tr v-for="(item, index) in producao.microareas" :key="index">
            <td class="align-left">{{ item.nome }}</td>
            <td>{{ item.faixaEtaria["<1"] || 0 }}</td>
            <td>{{ item.faixaEtaria["1-4"] || 0 }}</td>
            <td>{{ item.faixaEtaria["5-9"] || 0 }}</td>
            <td>{{ item.faixaEtaria["10+"] || 0 }}</td>
            <td>{{ item.faixaEtaria.ign || 0 }}</td>
            <td class="total-cell">
              {{ calcularTotalFaixaEtaria(item.faixaEtaria) }}
            </td>
            <td>{{ item.plano.a || 0 }}</td>
            <td>{{ item.plano.b || 0 }}</td>
            <td>{{ item.plano.c || 0 }}</td>
            <td>{{ item.surtos.num || 0 }}</td>
            <td>{{ item.surtos.invest || 0 }}</td>
            <td>{{ item.surtos.naoInf || 0 }}</td>
          </tr>
        </tbody>
      </table>

      <div class="obitos-section">
        <strong>Ocorreu óbito por diarreia?</strong>
        (
        <span class="checkbox">{{
          producao.ocorreuObito === "sim" ? "X" : "&nbsp;"
        }}</span>
        ) SIM (
        <span class="checkbox">{{
          producao.ocorreuObito === "nao" ? "X" : "&nbsp;"
        }}</span>
        ) NÃO
        <table
          v-if="producao.ocorreuObito === 'sim'"
          class="print-table obitos-table"
        >
          <thead>
            <tr>
              <th colspan="6">ÓBITOS POR FAIXA ETÁRIA</th>
            </tr>
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
              <td>{{ producao.obitos["<1"] || 0 }}</td>
              <td>{{ producao.obitos["1-4"] || 0 }}</td>
              <td>{{ producao.obitos["5-9"] || 0 }}</td>
              <td>{{ producao.obitos["10+"] || 0 }}</td>
              <td>{{ producao.obitos.Ing || 0 }}</td>
              <td class="total-cell">{{ totalObitos }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Responsável pela Informação</p>
      </div>
    </div>
    <div v-else>Nenhum dado encontrado para esta semana/equipe.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
// ✅ CORREÇÃO: 'useRoute' foi removido da importação
import { mddaService } from "@/services/mddaService";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { Printer } from "lucide-vue-next";

const props = defineProps({
  competencia: { type: String, required: true },
  equipeId: { type: String, required: true },
});

// ✅ CORREÇÃO: A linha 'const route = useRoute()' foi removida.
const loading = ref(true);
const producao = ref(null);
const equipe = ref(null);

const documentoId = `${props.competencia}_${props.equipeId}`;

const competenciaInfo = computed(() => {
  if (!props.competencia) return { ano: "", semana: "" };
  const [ano, semana] = props.competencia.split("-W");
  return { ano, semana };
});

onMounted(async () => {
  const [dadosProducao, dadosEquipe] = await Promise.all([
    mddaService.getDadosCompetencia(documentoId),
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

const calcularTotalFaixaEtaria = (faixa) => {
  return (
    (faixa["<1"] || 0) +
    (faixa["1-4"] || 0) +
    (faixa["5-9"] || 0) +
    (faixa["10+"] || 0) +
    (faixa.ign || 0)
  );
};

const totalObitos = computed(() => {
  if (!producao.value || !producao.value.obitos) return 0;
  const obitos = producao.value.obitos;
  return (
    (obitos["<1"] || 0) +
    (obitos["1-4"] || 0) +
    (obitos["5-9"] || 0) +
    (obitos["10+"] || 0) +
    (obitos.Ing || 0)
  );
});

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
  text-align: center;
  margin-bottom: 20px;
  p {
    margin: 0;
    font-size: 12pt;
  }
  h3 {
    margin-top: 10px;
    font-size: 14pt;
  }
}

.info-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  font-size: 11pt;
  gap: 5px 20px;
  margin-bottom: 20px;
  border: 1px solid #000;
  padding: 10px;
}

.align-left {
  text-align: left !important;
}

.obitos-section {
  margin-top: 20px;
  font-size: 11pt;
}

.obitos-table {
  margin-top: 10px;
  max-width: 500px;
}

.checkbox {
  display: inline-block;
  width: 1.2em;
  text-align: center;
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
