<template>
  <div class="form-overlay" @click.self="$emit('fechar')">
    <div class="form-container">
      <h2>{{ titulo }}</h2>
      <form @submit.prevent="salvar">
        <div class="form-group">
          <label for="nome">Nome da UBS</label>
          <input
            type="text"
            id="nome"
            v-model="ubsEditavel.nome"
            required
            autocomplete="off"
          />
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
  ubsParaEditar: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["fechar", "salvar"]);

const ubsEditavel = ref({});

const titulo = computed(() =>
  props.ubsParaEditar ? "Editar UBS" : "Adicionar Nova UBS"
);

watch(
  () => props.ubsParaEditar,
  (novoValor) => {
    if (novoValor) {
      ubsEditavel.value = { ...novoValor };
    } else {
      ubsEditavel.value = { nome: "" };
    }
  },
  { immediate: true }
);

const salvar = () => {
  if (ubsEditavel.value.nome.trim()) {
    emit("salvar", ubsEditavel.value);
  }
};
</script>

<style lang="scss" scoped>
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
  background: white;
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

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-save {
  background-color: #007bff;
  color: white;
  &:hover {
    background-color: #0056b3;
  }
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
  &:hover {
    background-color: #e0e0e0;
  }
}
</style>
