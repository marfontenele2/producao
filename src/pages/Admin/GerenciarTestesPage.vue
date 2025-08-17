// ARQUIVO FINAL: src/pages/Admin/GerenciarTestesPage.vue
<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Gerenciar Testes e Marcas do Boletim</h2>
        <p>
          Adicione ou remova marcas/fabricantes para cada tipo de teste rápido.
        </p>
      </div>
    </header>

    <div class="content-card">
      <BaseSpinner v-if="carregando" />
      <div v-else class="testes-lista">
        <div v-for="teste in testes" :key="teste.id" class="teste-item">
          <div class="teste-header">
            <h3>{{ teste.nome }}</h3>
            <button class="btn-primary-small" @click="abrirModal(teste)">
              <PlusCircle :size="16" /> Adicionar Marca
            </button>
          </div>
          <ul
            v-if="teste.marcas && teste.marcas.length > 0"
            class="marcas-lista"
          >
            <li v-for="marca in teste.marcas" :key="marca.id">
              <span>{{ marca.nome }}</span>
              <button
                @click="removerMarca(teste, marca)"
                class="icon-button danger"
              >
                <Trash2 :size="16" />
              </button>
            </li>
          </ul>
          <p v-else class="empty-message">Nenhuma marca cadastrada.</p>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="modalAberto" class="modal-backdrop" @click="fecharModal">
        <div class="modal-content" @click.stop>
          <h3>Adicionar Marca para {{ testeSelecionado?.nome }}</h3>
          <form @submit.prevent="adicionarMarca">
            <div class="form-group">
              <label for="nomeMarca">Nome da Marca/Fabricante</label>
              <input
                type="text"
                id="nomeMarca"
                v-model="nomeNovaMarca"
                required
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="fecharModal">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">Salvar Marca</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "@/store/notificationStore";
import { testesService } from "@/services/testesService";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import { PlusCircle, Trash2 } from "lucide-vue-next";
import { v4 as uuidv4 } from "uuid";

const notificationStore = useNotificationStore();
const carregando = ref(true);
const testes = ref([]);
let unsubTestes = null;

const modalAberto = ref(false);
const testeSelecionado = ref(null);
const nomeNovaMarca = ref("");

const abrirModal = (teste) => {
  testeSelecionado.value = teste;
  nomeNovaMarca.value = "";
  modalAberto.value = true;
};

const fecharModal = () => {
  modalAberto.value = false;
  testeSelecionado.value = null;
};

const adicionarMarca = async () => {
  if (!nomeNovaMarca.value.trim() || !testeSelecionado.value) return;

  const novaMarca = {
    id: uuidv4(),
    nome: nomeNovaMarca.value.trim(),
  };

  try {
    await testesService.adicionarMarca(testeSelecionado.value.id, novaMarca);
    notificationStore.showNotification(
      "Marca adicionada com sucesso!",
      "success"
    );
    fecharModal();
  } catch (error) {
    notificationStore.showNotification("Erro ao adicionar marca.", "error");
    console.error(error);
  }
};

const removerMarca = async (teste, marca) => {
  if (confirm(`Tem certeza que deseja remover a marca "${marca.nome}"?`)) {
    try {
      await testesService.removerMarca(teste.id, marca);
      notificationStore.showNotification("Marca removida.", "success");
    } catch (error) {
      notificationStore.showNotification("Erro ao remover marca.", "error");
      console.error(error);
    }
  }
};

onMounted(async () => {
  carregando.value = true;
  await testesService.inicializarTestesPadrao();
  unsubTestes = testesService.monitorarTestes((data) => {
    testes.value = data;
    carregando.value = false;
  });
});

onUnmounted(() => {
  if (unsubTestes) unsubTestes();
});
</script>

<style lang="scss" scoped>
/* Estilos consistentes com o projeto */
.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-header h2 {
  margin: 0;
}
.page-header p {
  margin: 4px 0 0;
  color: #6c757d;
}
.content-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.testes-lista {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
.teste-item {
  border: 1px solid #dee2e6;
  border-radius: 6px;
}
.teste-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
}
.marcas-lista {
  list-style: none;
  padding: 0;
  margin: 0;
}
.marcas-lista li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e9ecef;
  &:last-child {
    border-bottom: none;
  }
}
.empty-message {
  padding: 16px;
  color: #6c757d;
}
.btn-primary-small {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  padding: 6px 12px;
  background-color: #001529;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  &.danger {
    color: #dc3545;
  }
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.form-group {
  margin-bottom: 16px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
}
.btn-primary {
  background-color: #001529;
  color: white;
  border-color: #001529;
}
.btn-secondary {
  background-color: #f0f2f5;
  color: #333;
  border-color: #ccc;
}
</style>
