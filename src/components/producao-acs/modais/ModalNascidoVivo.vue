<template>
  <BaseModal :exibir="exibir" @fechar="$emit('fechar')">
    <template #titulo>{{ titulo }}</template>

    <form @submit.prevent="salvar" class="form-modal">
      <div class="form-group">
        <label for="nomeMae">Nome da Mãe</label>
        <input
          id="nomeMae"
          type="text"
          v-model="registroLocal.nomeMae"
          required
        />
      </div>
      <div class="form-group">
        <label for="cnsMae">CNS da Mãe</label>
        <input
          id="cnsMae"
          type="text"
          v-model="registroLocal.cnsMae"
          required
        />
      </div>
      <div class="form-group">
        <label for="dataNascimento">Data do Nascimento</label>
        <input
          id="dataNascimento"
          type="date"
          v-model="registroLocal.dataNascimento"
          required
        />
      </div>
      <div class="form-group">
        <label for="peso">Peso (gramas)</label>
        <input
          id="peso"
          type="number"
          v-model.number="registroLocal.peso"
          required
        />
      </div>
      <div class="form-group">
        <label for="sexo">Sexo</label>
        <select id="sexo" v-model="registroLocal.sexo" required>
          <option disabled value="">Selecione...</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Ignorado">Ignorado</option>
        </select>
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
  props.registroParaEditar ? "Editar Nascido Vivo" : "Adicionar Nascido Vivo"
);

function criarRegistroLimpo() {
  return { nomeMae: "", cnsMae: "", dataNascimento: "", peso: null, sexo: "" };
}

// Observa se um registro para edição foi passado e preenche o formulário
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
  emit("fechar"); // Fecha o modal após salvar
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
.form-group input,
.form-group select {
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
