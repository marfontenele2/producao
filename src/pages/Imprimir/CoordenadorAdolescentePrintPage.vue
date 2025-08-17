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
          <h4>
            RELATÓRIO MENSAL DO ATENDIMENTO AO ADOLESCENTE NA ATENÇÃO PRIMÁRIA
          </h4>
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
      <div v-else-if="resultados" class="table-container">
        <AdolescenteAtendimentosTable :dados="resultados" />
        <AdolescenteMetodosTable :dados="resultados" />
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
import AdolescenteAtendimentosTable from "@/components/indicadores/adolescente/AdolescenteAtendimentosTable.vue";
import AdolescenteMetodosTable from "@/components/indicadores/adolescente/AdolescenteMetodosTable.vue";

const route = useRoute();
const loading = ref(true);
const resultados = ref(null);
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
    resultados.value = await coordenadorService.getRelatorioAdolescente(
      filtros
    );
  } catch (error) {
    errorService.handle(
      error,
      "Erro ao carregar relatório de adolescente para impressão."
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
