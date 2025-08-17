<template>
  <div class="print-container">
    <div class="print-actions">
      <button @click="imprimirPagina" class="print-button">
        <Printer :size="20" /> Imprimir
      </button>
    </div>

    <div id="printable-content" class="report-content form-page">
      <header class="print-header">
        <img
          src="@/assets/logo.png"
          alt="Logo da Prefeitura"
          class="logo-prefeitura"
        />
        <div class="header-text">
          <p>PREFEITURA MUNICIPAL DE GRANJA</p>
          <p>SECRETARIA MUNICIPAL DE SAÚDE</p>
          <h4>RELATÓRIO CONSOLIDADO DE PROFISSIONAIS (SCNES)</h4>
        </div>
        <div class="header-info">
          <p>MUNICÍPIO: GRANJA</p>
          <p>REF. AO MÊS: {{ formatarCompetencia(filtros.competencia) }}</p>
          <p>
            DATA DA INFORMAÇÃO: {{ new Date().toLocaleDateString("pt-BR") }}
          </p>
        </div>
      </header>

      <div v-if="loading" class="loading-message">Carregando relatório...</div>
      <div v-else-if="resultados.length > 0" class="table-container">
        <table class="report-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>CBO</th>
              <th>CPF</th>
              <th>Equipe</th>
              <th>UBS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in resultados" :key="index">
              <td>{{ item.nome }}</td>
              <td>{{ item.cbo }}</td>
              <td>{{ item.cpf || "N/A" }}</td>
              <td>{{ item.equipeNome }}</td>
              <td>{{ item.ubsNome }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data-message">
        Nenhum dado encontrado para os filtros selecionados.
      </div>

      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-title">Assinatura do Coordenador(a)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { coordenadorService } from "@/services/coordenadorService";
import { errorService } from "@/services/errorService";
import { Printer } from "lucide-vue-next";

const route = useRoute();
const loading = ref(true);
const resultados = ref([]);
const filtros = reactive({ competencia: "", ubsIds: [], equipeIds: [] });

const formatarCompetencia = (comp) => {
  if (!comp) return "";
  const [ano, mes] = comp.split("-");
  return `${mes}/${ano}`;
};

const imprimirPagina = () => window.print();

onMounted(async () => {
  const { competencia, ubsIds, equipeIds } = route.query;
  filtros.competencia = competencia;
  filtros.ubsIds = Array.isArray(ubsIds) ? ubsIds : ubsIds ? [ubsIds] : [];
  filtros.equipeIds = Array.isArray(equipeIds)
    ? equipeIds
    : equipeIds
    ? [equipeIds]
    : [];

  try {
    resultados.value = await coordenadorService.getRelatorioScnes(filtros);
  } catch (error) {
    errorService.handle(
      error,
      "Erro ao carregar relatório SCNES para impressão."
    );
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import "@/assets/styles/ReportPage.css";
@import "@/assets/styles/PrintLayout.css";
</style>
