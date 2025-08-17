// 📄 ARQUIVO: src/pages/Admin/GerenciarUbsPage.vue (Refatorado)
<template>
  <div class="gerenciar-page">
    <div class="header-container">
      <button @click="iniciarAdicao" class="add-button">
        <PlusCircle :size="20" />
        Adicionar UBS
      </button>
    </div>
    <UbsForm
      v-if="exibirFormulario"
      :ubs-para-editar="ubsSelecionada"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
    <UbsList
      :lista-ubs="listaUbs"
      :carregando="carregando"
      @editar="iniciarEdicao"
      @excluir="handleExcluir"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ubsService } from "@/services/ubsService";
import { useNotificationStore } from "@/store/notificationStore";
import { errorService } from "@/services/errorService"; // ✅ ADIÇÃO
import UbsForm from "@/components/admin/UbsForm.vue";
import UbsList from "@/components/admin/UbsList.vue";
import { PlusCircle } from "lucide-vue-next";

const notificationStore = useNotificationStore();
const listaUbs = ref([]);
const carregando = ref(true);
const exibirFormulario = ref(false);
const ubsSelecionada = ref(null);
let unsubscribe = null;

onMounted(() => {
  unsubscribe = ubsService.monitorarUbs((ubs) => {
    listaUbs.value = ubs;
    carregando.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const fecharFormulario = () => {
  exibirFormulario.value = false;
  ubsSelecionada.value = null;
};

const iniciarAdicao = () => {
  ubsSelecionada.value = null;
  exibirFormulario.value = true;
};

const iniciarEdicao = (ubs) => {
  ubsSelecionada.value = { ...ubs };
  exibirFormulario.value = true;
};

const handleSalvar = async (ubsData) => {
  try {
    if (ubsData.id) {
      const id = ubsData.id;
      delete ubsData.id;
      await ubsService.atualizarUbs(id, ubsData);
      notificationStore.showNotification(
        "UBS atualizada com sucesso!",
        "success"
      );
    } else {
      await ubsService.adicionarUbs(ubsData);
      notificationStore.showNotification(
        "UBS adicionada com sucesso!",
        "success"
      );
    }
    fecharFormulario();
  } catch (error) {
    // ✅ ALTERAÇÃO: Utiliza o serviço de erro centralizado
    errorService.handle(error, "Erro ao salvar UBS.");
  }
};

const handleExcluir = async (ubsId) => {
  if (window.confirm("Tem certeza que deseja excluir esta UBS?")) {
    try {
      await ubsService.excluirUbs(ubsId);
      notificationStore.showNotification(
        "UBS excluída com sucesso!",
        "success"
      );
    } catch (error) {
      // ✅ ALTERAÇÃO: Utiliza o serviço de erro centralizado
      errorService.handle(error, "Erro ao excluir UBS.");
    }
  }
};
</script>

<style lang="scss" scoped>
/* Estilos permanecem os mesmos */
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
}
.add-button:hover {
  background-color: #218838;
}
</style>
