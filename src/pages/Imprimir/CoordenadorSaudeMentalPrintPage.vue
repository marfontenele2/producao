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
            RELATÓRIO MENSAL DE ACOMPANHAMENTO DE PACIENTES DE SAÚDE MENTAL
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
      <div v-else-if="resultados.length > 0" class="table-container">
        <table class="report-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>CNS</th>
              <th>Equipe</th>
              <th>UBS</th>
              <th>Status do Acompanhamento</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in resultados" :key="item.id">
              <td>{{ item.nome }}</td>
              <td>{{ item.cns }}</td>
              <td>{{ item.equipeNome }}</td>
              <td>{{ item.ubsNome }}</td>
              <td>{{ formatarStatusAcompanhamento(item.status) }}</td>
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

const formatarStatusAcompanhamento = (status) => {
  if (typeof status !== "object" || status === null) return "Não Informado";
  const descricoes = [];
  if (status.acompCAPS) descricoes.push("Acomp. CAPS");
  if (status.acompUBS) descricoes.push("Acomp. UBS");
  if (status.recebeMedicacao) descricoes.push("Recebe Medicação");
  return descricoes.length > 0 ? descricoes.join(", ") : "Não Informado";
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
    resultados.value = await coordenadorService.getRelatorioSaudeMental(
      filtros
    );
  } catch (error) {
    errorService.handle(
      error,
      "Erro ao carregar relatório de Saúde Mental para impressão."
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
