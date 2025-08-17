<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Educação Permanente</h1>
      <div class="competencia-selector">
        <label for="competencia">Competência:</label>
        <input id="competencia" type="month" v-model="competencia" />
      </div>
    </header>

    <div class="content-card">
      <div class="card-header">
        <h3>Eventos Registrados</h3>
        <button
          @click="abrirFormNovo"
          :disabled="isFormDisabled"
          class="btn-primary"
        >
          <Plus :size="18" /> Adicionar Evento
        </button>
      </div>

      <BaseSpinner v-if="loading" />
      <EventoList
        v-else
        :eventos="dadosProducao.eventos"
        :disabled="isFormDisabled"
        @editar="abrirFormEdicao"
        @excluir="handleExcluir"
      />

      <div class="actions">
        <button @click="handlePrint" class="btn-secondary">Imprimir</button>
        <button
          @click="handleSave"
          :disabled="isFormDisabled"
          class="btn-secondary"
        >
          Salvar Alterações
        </button>
        <button
          @click="handleFinalize"
          :disabled="isFormDisabled"
          class="btn-success"
        >
          Finalizar e Entregar
        </button>
      </div>
    </div>

    <EventoForm
      :visible="isFormVisible"
      :evento="eventoSelecionado"
      @cancelar="fecharForm"
      @salvar="handleSalvarEvento"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { educacaoPermanenteService } from "@/services/educacaoPermanenteService";
import { getCompetenciaAtual } from "@/utils/dateUtils";
import { v4 as uuidv4 } from "uuid";
import { Plus } from "lucide-vue-next";

import EventoList from "@/components/educacaoPermanente/EventoList.vue";
import EventoForm from "@/components/educacaoPermanente/EventoForm.vue";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const competencia = ref(getCompetenciaAtual());
const loading = ref(true);
const dadosProducao = ref({ eventos: [], finalizado: false });
const isFormVisible = ref(false);
const eventoSelecionado = ref(null);

const documentoId = computed(() =>
  userStore.user?.equipeId
    ? `${competencia.value}_${userStore.user.equipeId}`
    : null
);
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
      unsubscribe = educacaoPermanenteService.monitorarEducacaoPermanente(
        newId,
        (data) => {
          dadosProducao.value = data;
          loading.value = false;
        }
      );
    }
  },
  { immediate: true }
);

onUnmounted(() => unsubscribe());

const abrirFormNovo = () => {
  eventoSelecionado.value = {};
  isFormVisible.value = true;
};
const abrirFormEdicao = (evento) => {
  eventoSelecionado.value = { ...evento };
  isFormVisible.value = true;
};
const fecharForm = () => {
  isFormVisible.value = false;
  eventoSelecionado.value = null;
};

const handleSalvarEvento = (eventoData) => {
  const eventos = dadosProducao.value.eventos || [];
  if (eventoData.id) {
    const index = eventos.findIndex((e) => e.id === eventoData.id);
    if (index !== -1) eventos[index] = eventoData;
  } else {
    eventos.push({ ...eventoData, id: uuidv4() });
  }
  dadosProducao.value.eventos = eventos;
  handleSave();
  fecharForm();
};

const handleExcluir = (eventoId) => {
  if (window.confirm("Tem certeza que deseja excluir este evento?")) {
    dadosProducao.value.eventos = dadosProducao.value.eventos.filter(
      (e) => e.id !== eventoId
    );
    handleSave();
  }
};

async function handleSave() {
  if (!documentoId.value) return;
  try {
    await educacaoPermanenteService.salvarEducacaoPermanente(
      documentoId.value,
      dadosProducao.value,
      userStore.user.equipeId,
      userStore.user.ubsId
    );
    notificationStore.showNotification("Alterações salvas!", "success");
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar.", "error");
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
      await educacaoPermanenteService.finalizarCompetencia(documentoId.value);
      notificationStore.showNotification(
        "Produção finalizada e entregue!",
        "success"
      );
    } catch (error) {
      notificationStore.showNotification("Erro ao finalizar.", "error");
    }
  }
}

// ✅ FUNÇÃO ADICIONADA
function handlePrint() {
  if (!documentoId.value) return;
  const routeData = router.resolve({
    name: "EducacaoPermanentePrint",
    params: {
      competencia: competencia.value,
      equipeId: userStore.user.equipeId,
    },
  });
  window.open(routeData.href, "_blank");
}
</script>

<style scoped>
/* Estilos existentes */
.page-container {
  padding: 1.5rem;
  background-color: #fff;
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
#competencia {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}
.content-card {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}
.actions {
  margin-top: 1.5rem;
  text-align: right;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-primary {
  background-color: #007bff;
  color: white;
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
