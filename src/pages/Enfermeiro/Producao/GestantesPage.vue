<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Acompanhamento de Gestantes por Risco</h1>
      <div class="competencia-selector">
        <label for="competencia">Competência:</label>
        <input id="competencia" type="month" v-model="competencia" />
      </div>
    </header>

    <div class="content-card">
      <BaseSpinner v-if="loading" text="Carregando dados..." />
      <div v-else>
        <table class="production-table">
          <thead>
            <tr>
              <th>Classificação de Risco</th>
              <th>Total de Gestantes</th>
              <th>Branca</th>
              <th>Parda</th>
              <th>Preta</th>
              <th>Soma (Automático)</th>
            </tr>
          </thead>
          <tbody>
            <tr :class="{ 'row-invalid': !validacao.riscoHabitual }">
              <td>Risco Habitual</td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoHabitual.total"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoHabitual.branca"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoHabitual.parda"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoHabitual.preta"
                  :disabled="isFormDisabled"
                />
              </td>
              <td class="total-cell">
                {{ totais.riscoHabitual }}
                <span
                  v-if="!validacao.riscoHabitual"
                  title="A soma das etnias não corresponde ao Total de Gestantes."
                  class="warning-icon"
                  >⚠️</span
                >
              </td>
            </tr>
            <tr :class="{ 'row-invalid': !validacao.riscoIntermediario }">
              <td>Risco Intermediário</td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoIntermediario.total"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoIntermediario.branca"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoIntermediario.parda"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.riscoIntermediario.preta"
                  :disabled="isFormDisabled"
                />
              </td>
              <td class="total-cell">
                {{ totais.riscoIntermediario }}
                <span
                  v-if="!validacao.riscoIntermediario"
                  title="A soma das etnias não corresponde ao Total de Gestantes."
                  class="warning-icon"
                  >⚠️</span
                >
              </td>
            </tr>
            <tr :class="{ 'row-invalid': !validacao.altoRisco }">
              <td>Alto Risco</td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.altoRisco.total"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.altoRisco.branca"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.altoRisco.parda"
                  :disabled="isFormDisabled"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="producao.altoRisco.preta"
                  :disabled="isFormDisabled"
                />
              </td>
              <td class="total-cell">
                {{ totais.altoRisco }}
                <span
                  v-if="!validacao.altoRisco"
                  title="A soma das etnias não corresponde ao Total de Gestantes."
                  class="warning-icon"
                  >⚠️</span
                >
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total Geral</th>
              <td>{{ totais.geral.total }}</td>
              <td>{{ totais.geral.branca }}</td>
              <td>{{ totais.geral.parda }}</td>
              <td>{{ totais.geral.preta }}</td>
              <td class="total-cell">{{ totais.geral.soma }}</td>
            </tr>
          </tfoot>
        </table>

        <div class="actions">
          <button @click="handlePrint" class="btn-secondary">Imprimir</button>
          <button
            @click="handleSave"
            :disabled="isFormDisabled"
            class="btn-secondary"
          >
            Salvar Rascunho
          </button>
          <button
            @click="handleFinalize"
            :disabled="isFormDisabled || !isFormValid"
            class="btn-success"
          >
            Finalizar e Entregar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { gestantesService } from "@/services/gestantesService";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const competencia = ref(getCompetenciaAtual());
const loading = ref(true);
const producao = ref({});

const documentoId = computed(() =>
  userStore.user?.equipeId
    ? `${competencia.value}_${userStore.user.equipeId}`
    : null
);
const isFormDisabled = computed(
  () => producao.value?.finalizado || loading.value
);

let unsubscribe = () => {};

watch(
  documentoId,
  (newId) => {
    unsubscribe();
    if (newId) {
      loading.value = true;
      unsubscribe = gestantesService.monitorarProducao(newId, (data) => {
        producao.value = data;
        loading.value = false;
      });
    }
  },
  { immediate: true }
);

onUnmounted(() => unsubscribe());

const num = (val) => Number(val) || 0;

const totais = computed(() => {
  const p = producao.value;
  if (!p) return {};

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

const validacao = computed(() => {
  const p = producao.value;
  if (!p) return {};
  return {
    riscoHabitual: num(p.riscoHabitual?.total) === totais.value.riscoHabitual,
    riscoIntermediario:
      num(p.riscoIntermediario?.total) === totais.value.riscoIntermediario,
    altoRisco: num(p.altoRisco?.total) === totais.value.altoRisco,
  };
});

const isFormValid = computed(() =>
  Object.values(validacao.value).every(Boolean)
);

async function handleSave() {
  if (!documentoId.value) return;
  try {
    await gestantesService.salvarProducao(
      documentoId.value,
      producao.value,
      userStore.user.equipeId,
      userStore.user.ubsId
    );
    notificationStore.showNotification(
      "Rascunho salvo com sucesso!",
      "success"
    );
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar rascunho.", "error");
  }
}

async function handleFinalize() {
  if (!isFormValid.value) {
    notificationStore.showNotification(
      "Verifique os totais. A soma das etnias deve ser igual ao total de gestantes.",
      "warning"
    );
    return;
  }
  if (
    window.confirm(
      "Após finalizar, não será possível editar. Deseja continuar?"
    )
  ) {
    await handleSave();
    await gestantesService.finalizarCompetencia(documentoId.value);
    notificationStore.showNotification(
      "Produção finalizada e entregue!",
      "success"
    );
  }
}

function handlePrint() {
  if (!documentoId.value) return;
  const routeData = router.resolve({
    name: "GestantesPrint",
    params: {
      competencia: competencia.value,
      equipeId: userStore.user.equipeId,
    },
  });
  window.open(routeData.href, "_blank");
}
</script>

<style scoped>
.page-container {
  padding: 1.5rem;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
#competencia {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}
.content-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.production-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.production-table th,
.production-table td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: center;
}
.production-table thead th {
  background-color: #f8f9fa;
}
.production-table tfoot th,
.production-table tfoot td {
  font-weight: bold;
  background-color: #f8f9fa;
}
.production-table td:first-child {
  text-align: left;
  font-weight: 500;
}
.production-table input {
  width: 100%;
  max-width: 120px;
  text-align: center;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 4px;
}
.total-cell {
  font-weight: 500;
  background-color: #f8f9fa;
}
.row-invalid {
  background-color: #fff3cd;
}
.warning-icon {
  color: #ffc107;
  font-weight: bold;
  margin-left: 4px;
  cursor: help;
}
.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
