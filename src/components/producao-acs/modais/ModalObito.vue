<template>
  <BaseModal :exibir="exibir" @fechar="$emit('fechar')">
    <template #titulo>{{ titulo }}</template>

    <form @submit.prevent="salvar" class="form-modal">
      <div class="form-group">
        <label for="nomePaciente">Nome do Paciente</label>
        <input
          id="nomePaciente"
          type="text"
          v-model="registroLocal.nomePaciente"
          required
        />
      </div>
      <div class="form-group">
        <label for="dataNascimento">Data de Nascimento do Paciente</label>
        <input
          id="dataNascimento"
          type="date"
          v-model="registroLocal.dataNascimento"
          required
        />
      </div>
      <div class="form-group">
        <label for="dataObito">Data do Óbito</label>
        <input
          id="dataObito"
          type="date"
          v-model="registroLocal.dataObito"
          required
        />
      </div>
      <div class="form-group">
        <label for="municipioObito">Município de Ocorrência do Óbito</label>
        <input
          id="municipioObito"
          type="text"
          v-model="registroLocal.municipioObito"
          required
        />
      </div>
      <div class="actions">
        <button
          type="button"
          @click="$emit('fechar')"
          class="btn btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" class="btn">Salvar</button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import BaseModal from "@/components/shared/BaseModal.vue";

const props = defineProps({
  exibir: { type: Boolean, default: false },
  registroParaEditar: { type: Object, default: null },
});
const emit = defineEmits(["fechar", "salvar"]);

const registroLocal = ref(criarRegistroLimpo());

const titulo = computed(() =>
  props.registroParaEditar ? "Editar Óbito" : "Adicionar Óbito"
);

function criarRegistroLimpo() {
  return {
    nomePaciente: "",
    dataNascimento: "",
    dataObito: "",
    municipioObito: "",
  };
}

watch(
  () => props.registroParaEditar,
  (novoValor) => {
    if (novoValor) {
      registroLocal.value = { ...novoValor };
    } else {
      registroLocal.value = criarRegistroLimpo();
    }
  }
);

function salvar() {
  emit("salvar", { ...registroLocal.value });
  emit("fechar");
}
</script>

<style scoped>
/* Estilos padronizados */
.form-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  box-sizing: border-box;
}
.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
</style>
