<template>
  <div class="gerenciar-page">
    <div class="header-container">
      <button @click="iniciarAdicao" class="add-button">
        <UserPlus :size="20" />
        Adicionar Usuário
      </button>
    </div>

    <UserForm
      v-if="exibirFormulario"
      :usuario-para-editar="usuarioSelecionado"
      :lista-ubs="listaUbs"
      :lista-equipes="listaEquipes"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />

    <UserList
      :lista-usuarios="listaUsuarios"
      :lista-ubs="listaUbs"
      :lista-equipes="listaEquipes"
      :carregando="carregando"
      @editar="iniciarEdicao"
      @excluir="handleExcluir"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { usuariosService } from "@/services/usuariosService.js";
import { ubsService } from "@/services/ubsService.js";
import { equipesService } from "@/services/equipesService.js";
import { useNotificationStore } from "@/store/notificationStore";
import UserForm from "@/components/admin/UserForm.vue";
import UserList from "@/components/admin/UserList.vue";
import { UserPlus } from "lucide-vue-next";

const notificationStore = useNotificationStore();

const listaUsuarios = ref([]);
const listaUbs = ref([]);
const listaEquipes = ref([]);
const carregando = ref(true);
const exibirFormulario = ref(false);
const usuarioSelecionado = ref(null);

let unsubUsuarios = null;
let unsubUbs = null;
let unsubEquipes = null;

onMounted(() => {
  carregando.value = true;
  unsubUsuarios = usuariosService.monitorarUsuarios((usuarios) => {
    listaUsuarios.value = usuarios;
    carregando.value = false;
  });
  unsubUbs = ubsService.monitorarUbs((ubs) => (listaUbs.value = ubs));
  unsubEquipes = equipesService.monitorarEquipes(
    (equipes) => (listaEquipes.value = equipes)
  );
});

onUnmounted(() => {
  if (unsubUsuarios) unsubUsuarios();
  if (unsubUbs) unsubUbs();
  if (unsubEquipes) unsubEquipes();
});

const fecharFormulario = () => {
  exibirFormulario.value = false;
  usuarioSelecionado.value = null;
};

const iniciarAdicao = () => {
  usuarioSelecionado.value = null;
  exibirFormulario.value = true;
};

const iniciarEdicao = (usuario) => {
  usuarioSelecionado.value = { ...usuario };
  exibirFormulario.value = true;
};

const handleSalvar = async (userData) => {
  try {
    if (userData.id) {
      // Editando
      await usuariosService.updateUsuario(userData.id, {
        nome: userData.nome,
        role: userData.role,
        ubsId: userData.ubsId,
        equipeId: userData.equipeId || null,
      });
      notificationStore.showNotification(
        "Usuário atualizado com sucesso!",
        "success"
      );
    } else {
      // Adicionando
      await usuariosService.criarNovoUsuario(userData);
      notificationStore.showNotification(
        "Usuário criado com sucesso!",
        "success"
      );
    }
    fecharFormulario();
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    notificationStore.showNotification(
      error.message || "Erro ao salvar usuário.",
      "error"
    );
  }
};

const handleExcluir = async (userId) => {
  if (
    window.confirm(
      "Tem certeza que deseja excluir este usuário? Esta ação é irreversível."
    )
  ) {
    try {
      await usuariosService.excluirUsuario(userId);
      notificationStore.showNotification(
        "Usuário excluído com sucesso!",
        "success"
      );
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      notificationStore.showNotification(
        error.message || "Erro ao excluir usuário.",
        "error"
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.gerenciar-page {
  max-width: 1100px;
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
}
</style>
