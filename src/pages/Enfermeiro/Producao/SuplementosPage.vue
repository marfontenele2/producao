<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Acompanhamento de Suplementos</h1>
      <div class="competencia-selector">
        <label for="competencia">Competência:</label>
        <input id="competencia" type="month" v-model="competencia" />
      </div>
    </header>

    <div v-if="loading" class="loading-message">Carregando...</div>

    <div v-else class="form-content">
      <TabelaCriancas
        v-model="dadosProducao.criancas"
        :disabled="isFormDisabled"
      />
      <TabelaGestantes
        v-model="dadosProducao.gestantes"
        :disabled="isFormDisabled"
      />
      <TabelaPuerperas
        v-model="dadosProducao.puerperas"
        :disabled="isFormDisabled"
      />
      <TabelaPerdas v-model="dadosProducao.perdas" :disabled="isFormDisabled" />

      <div class="action-buttons">
        <button @click="handlePrint" class="print-button">Imprimir</button>
        <button
          @click="handleSave"
          :disabled="isFormDisabled"
          class="save-button"
        >
          Salvar Rascunho
        </button>
        <button
          @click="handleFinalize"
          :disabled="isFormDisabled"
          class="finalize-button"
        >
          Finalizar e Entregar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// O SCRIPT NÃO MUDA, APENAS O CSS
import { ref, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { suplementosService } from "@/services/suplementosService";
import { getCompetenciaAtual } from "@/utils/dateUtils";

import TabelaCriancas from "@/components/suplementos/TabelaCriancas.vue";
import TabelaGestantes from "@/components/suplementos/TabelaGestantes.vue";
import TabelaPuerperas from "@/components/suplementos/TabelaPuerperas.vue";
import TabelaPerdas from "@/components/suplementos/TabelaPerdas.vue";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const competencia = ref(getCompetenciaAtual());
const loading = ref(true);
const dadosProducao = ref({});

const documentoId = computed(() => {
  if (userStore.user?.equipeId && competencia.value) {
    return `${competencia.value}_${userStore.user.equipeId}`;
  }
  return null;
});

const isFormDisabled = computed(
  () => dadosProducao.value?.finalizado || loading.value
);

let unsubscribe = () => {};

watch(
  documentoId,
  (newId) => {
    unsubscribe();
    if (newId) {
      loading.value = true;
      unsubscribe = suplementosService.monitorarDados(newId, (data) => {
        dadosProducao.value = data;
        loading.value = false;
      });
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  unsubscribe();
});

async function handleSave() {
  if (!documentoId.value) return;
  try {
    await suplementosService.salvarDados(
      documentoId.value,
      dadosProducao.value,
      userStore.user.equipeId,
      userStore.user.ubsId
    );
    notificationStore.showNotification(
      "Rascunho salvo com sucesso!",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar:", error);
    notificationStore.showNotification("Erro ao salvar rascunho.", "error");
  }
}

async function handleFinalize() {
  if (
    window.confirm(
      "Após finalizar, não será possível editar. Deseja continuar?"
    )
  ) {
    await handleSave();
    try {
      await suplementosService.finalizarCompetencia(documentoId.value);
      notificationStore.showNotification(
        "Produção finalizada e entregue!",
        "success"
      );
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      notificationStore.showNotification(
        "Erro ao finalizar produção.",
        "error"
      );
    }
  }
}

function handlePrint() {
  if (!documentoId.value) return;
  const routeData = router.resolve({
    name: "RelatorioSuplementosPrint",
    params: {
      competencia: competencia.value,
      equipeId: userStore.user.equipeId,
    },
  });
  window.open(routeData.href, "_blank");
}
</script>

<style scoped>
/* ✅ CORREÇÃO DE ESTILO */
.page-container {
  padding: 1.5rem;
  background-color: #fff; /* Fundo branco para a página */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.competencia-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ✅ CORREÇÃO DE ESTILO: Estilo padrão para o input de data */
#competencia {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.save-button {
  background-color: #007bff;
  color: white;
}
.finalize-button {
  background-color: #28a745;
  color: white;
}
.print-button {
  background-color: #6c757d;
  color: white;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
