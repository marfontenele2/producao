<template>
  <div class="form-overlay" @click.self="$emit('fechar')">
    <div class="form-container">
      <h2>{{ titulo }}</h2>
      <form @submit.prevent="salvar">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input
            type="text"
            id="nome"
            v-model="usuarioEditavel.nome"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="usuarioEditavel.email"
            :disabled="!!usuarioParaEditar"
            required
          />
        </div>
        <div class="form-group" v-if="!usuarioParaEditar">
          <label for="password">Senha</label>
          <input
            type="password"
            id="password"
            v-model="usuarioEditavel.password"
            required
          />
        </div>
        <div class="form-group">
          <label for="role">Perfil</label>
          <select id="role" v-model="usuarioEditavel.role" required>
            <option value="Enfermeiro">Enfermeiro</option>
            <option value="Gerente">Gerente</option>
            <option value="Coordenador">Coordenador</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <div v-if="!isCoordenadorProfile">
          <div class="form-group">
            <label for="ubs">UBS</label>
            <select id="ubs" v-model="usuarioEditavel.ubsId" required>
              <option disabled value="">Selecione uma UBS</option>
              <option v-for="ubs in listaUbs" :key="ubs.id" :value="ubs.id">
                {{ ubs.nome }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="equipe">Equipe (Opcional)</label>
            <select
              id="equipe"
              v-model="usuarioEditavel.equipeId"
              :disabled="equipesFiltradas.length === 0"
            >
              <option value="">Nenhuma</option>
              <option
                v-for="equipe in equipesFiltradas"
                :key="equipe.id"
                :value="equipe.id"
              >
                {{ equipe.nome }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" @click="$emit('fechar')" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-save">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  usuarioParaEditar: { type: Object, default: null },
  listaUbs: { type: Array, required: true },
  listaEquipes: { type: Array, required: true },
});

const emit = defineEmits(["fechar", "salvar"]);

const usuarioEditavel = ref({});

const titulo = computed(() =>
  props.usuarioParaEditar ? "Editar Usuário" : "Adicionar Novo Usuário"
);

// LÓGICA ADICIONADA: Verifica se o perfil selecionado é Coordenador
const isCoordenadorProfile = computed(
  () => usuarioEditavel.value.role === "Coordenador"
);

const equipesFiltradas = computed(() => {
  if (!usuarioEditavel.value.ubsId || isCoordenadorProfile.value) return [];
  return props.listaEquipes.filter(
    (e) => e.ubsId === usuarioEditavel.value.ubsId
  );
});

watch(
  () => props.usuarioParaEditar,
  (novoValor) => {
    if (novoValor) {
      usuarioEditavel.value = { ...novoValor, password: "" };
    } else {
      usuarioEditavel.value = {
        nome: "",
        email: "",
        password: "",
        role: "Enfermeiro",
        ubsId: "",
        equipeId: "",
      };
    }
  },
  { immediate: true }
);

// LÓGICA ADICIONADA: Limpa os campos de UBS e Equipe se o perfil for Coordenador
watch(
  () => usuarioEditavel.value.role,
  (newRole) => {
    if (newRole === "Coordenador") {
      usuarioEditavel.value.ubsId = null;
      usuarioEditavel.value.equipeId = null;
    }
  }
);

watch(
  () => usuarioEditavel.value.ubsId,
  () => {
    if (
      !equipesFiltradas.value.find(
        (e) => e.id === usuarioEditavel.value.equipeId
      )
    ) {
      usuarioEditavel.value.equipeId = "";
    }
  }
);

const salvar = () => {
  // Validação ajustada para não exigir UBS se for Coordenador
  const isFormValid =
    usuarioEditavel.value.nome.trim() &&
    (isCoordenadorProfile.value || usuarioEditavel.value.ubsId);

  if (isFormValid) {
    emit("salvar", usuarioEditavel.value);
  }
};
</script>

<style lang="scss" scoped>
/* Estilos permanecem os mesmos */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.form-container {
  background: #fff;
  padding: 24px 32px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  transition: background-color 0.2s;
}
.btn-save {
  background-color: #007bff;
  color: #fff;
}
.btn-save:hover {
  background-color: #0056b3;
}
.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}
.btn-cancel:hover {
  background-color: #e0e0e0;
}
</style>
