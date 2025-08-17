<template>
  <div class="gerenciar-page">
    <div class="header-container">
      <button
        @click="iniciarAdicao"
        class="add-button"
        :disabled="listaUbs.length === 0"
      >
        <PlusCircle :size="20" />
        Adicionar Equipe
      </button>
    </div>
    <div v-if="listaUbs.length === 0 && !carregando" class="warning-message">
      <AlertTriangle :size="20" />
      <span
        >É necessário cadastrar pelo menos uma UBS antes de adicionar
        equipes.</span
      >
    </div>
    <EquipeForm
      v-if="exibirFormulario"
      :equipe-para-editar="equipeSelecionada"
      :lista-ubs="listaUbs"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
    <EquipeList
      :lista-equipes="listaEquipes"
      :lista-ubs="listaUbs"
      :carregando="carregando"
      @editar="iniciarEdicao"
      @excluir="handleExcluir"
    />
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { equipesService } from "@/services/equipesService.js";
import { ubsService } from "@/services/ubsService.js";
import { useNotificationStore } from "@/store/notificationStore";
import EquipeForm from "@/components/admin/EquipeForm.vue";
import EquipeList from "@/components/admin/EquipeList.vue";
import { PlusCircle, AlertTriangle } from "lucide-vue-next";
const notificationStore = useNotificationStore();
const listaEquipes = ref([]);
const listaUbs = ref([]);
const carregando = ref(true);
const exibirFormulario = ref(false);
const equipeSelecionada = ref(null);
let unsubEquipes = null;
let unsubUbs = null;
onMounted(() => {
  unsubUbs = ubsService.monitorarUbs((ubs) => {
    listaUbs.value = ubs;
  });
  unsubEquipes = equipesService.monitorarEquipes((equipes) => {
    listaEquipes.value = equipes;
    carregando.value = false;
  });
});
onUnmounted(() => {
  if (unsubEquipes) unsubEquipes();
  if (unsubUbs) unsubUbs();
});
const fecharFormulario = () => {
  exibirFormulario.value = false;
  equipeSelecionada.value = null;
};
const iniciarAdicao = () => {
  equipeSelecionada.value = null;
  exibirFormulario.value = true;
};
const iniciarEdicao = (equipe) => {
  equipeSelecionada.value = { ...equipe };
  exibirFormulario.value = true;
};
const handleSalvar = async (equipeData) => {
  try {
    if (equipeData.id) {
      const id = equipeData.id;
      delete equipeData.id;
      await equipesService.atualizarEquipe(id, equipeData);
      notificationStore.showNotification(
        "Equipe atualizada com sucesso!",
        "success"
      );
    } else {
      await equipesService.adicionarEquipe(equipeData);
      notificationStore.showNotification(
        "Equipe adicionada com sucesso!",
        "success"
      );
    }
    fecharFormulario();
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar equipe.", "error");
  }
};
const handleExcluir = async (equipeId) => {
  if (window.confirm("Tem certeza que deseja excluir esta equipe?")) {
    try {
      await equipesService.excluirEquipe(equipeId);
      notificationStore.showNotification(
        "Equipe excluída com sucesso!",
        "success"
      );
    } catch (error) {
      notificationStore.showNotification("Erro ao excluir equipe.", "error");
    }
  }
};
</script>
<style lang="scss" scoped>
.gerenciar-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
.header-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
}
.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
}
.warning-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 24px;
}
</style>
