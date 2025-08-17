<template>
  <div class="report-page">
    <header class="page-header">
      <div>
        <h1>Relatório de Saúde Mental</h1>
        <p>Visualize os acompanhamentos por competência, UBS e equipe.</p>
      </div>
      <div class="header-actions">
        <button
          @click="$router.push('/coordenador/relatorios/mensal')"
          class="back-button"
        >
          <ArrowLeft :size="20" />
          Voltar ao Hub
        </button>
        <button @click="gerarImpressao" class="print-button">
          <Printer :size="20" />
          Gerar Impressão
        </button>
      </div>
    </header>

    <div class="filters">
      <div class="filter-group">
        <label for="competencia">Competência:</label>
        <input
          type="month"
          id="competencia"
          v-model="filtros.competencia"
          class="competencia-input"
        />
      </div>
      <div class="filter-group">
        <label>UBS:</label>
        <MultiSelectDropdown
          v-model="filtros.ubsIds"
          :options="ubsOptions"
          placeholder="Todas as UBS"
        />
      </div>
      <div class="filter-group">
        <label>Equipe:</label>
        <MultiSelectDropdown
          v-model="filtros.equipeIds"
          :options="equipeOptions"
          placeholder="Todas as Equipes"
        />
      </div>
    </div>

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
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { coordenadorService } from "@/services/coordenadorService";
import { ubsService } from "@/services/ubsService";
import { equipesService } from "@/services/equipesService";
import { errorService } from "@/services/errorService";
import MultiSelectDropdown from "@/components/shared/MultiSelectDropdown.vue";
import { Printer, ArrowLeft } from "lucide-vue-next";

const router = useRouter();
const loading = ref(false);
const resultados = ref([]);
const todasAsUbs = ref([]);
const todasAsEquipes = ref([]);

const filtros = reactive({
  competencia: new Date().toISOString().slice(0, 7),
  ubsIds: [],
  equipeIds: [],
});

const ubsOptions = computed(() =>
  todasAsUbs.value.map((u) => ({ value: u.id, text: u.nome }))
);
const equipeOptions = computed(() => {
  if (filtros.ubsIds.length > 0) {
    return todasAsEquipes.value
      .filter((e) => filtros.ubsIds.includes(e.ubsId))
      .map((e) => ({ value: e.id, text: e.nome }));
  }
  return todasAsEquipes.value.map((e) => ({ value: e.id, text: e.nome }));
});

const formatarStatusAcompanhamento = (status) => {
  if (typeof status !== "object" || status === null) {
    return "Não Informado";
  }
  const descricoes = [];
  if (status.acompCAPS) descricoes.push("Acomp. CAPS");
  if (status.acompUBS) descricoes.push("Acomp. UBS");
  if (status.recebeMedicacao) descricoes.push("Recebe Medicação");
  return descricoes.length > 0 ? descricoes.join(", ") : "Não Informado";
};

const gerarImpressao = () => {
  router.push({
    name: "CoordenadorSaudeMentalPrint",
    query: {
      competencia: filtros.competencia,
      ubsIds: filtros.ubsIds,
      equipeIds: filtros.equipeIds,
    },
  });
};

async function carregarRelatorio() {
  if (!filtros.competencia) return;
  loading.value = true;
  try {
    resultados.value = await coordenadorService.getRelatorioSaudeMental(
      filtros
    );
  } catch (error) {
    errorService.handle(error, "Erro ao carregar relatório de Saúde Mental.");
  } finally {
    loading.value = false;
  }
}

watch(filtros, carregarRelatorio, { deep: true, immediate: true });

onMounted(() => {
  ubsService.monitorarUbs((data) => (todasAsUbs.value = data));
  equipesService.monitorarEquipes((data) => (todasAsEquipes.value = data));
});
</script>

<style scoped>
@import "@/assets/styles/ReportPage.css";
</style>
