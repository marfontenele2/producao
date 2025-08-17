<template>
  <div class="form-overlay" @click.self="$emit('fechar')">
    <div class="form-container">
      <h2>{{ titulo }}</h2>
      <form @submit.prevent="salvar">
        <div class="form-group">
          <label for="nome">Nome da Equipe</label>
          <input
            type="text"
            id="nome"
            v-model="equipeEditavel.nome"
            required
            autocomplete="off"
          />
        </div>
        <div class="form-group">
          <label for="ubs">UBS Associada</label>
          <select id="ubs" v-model="equipeEditavel.ubsId" required>
            <option disabled value="">Selecione uma UBS</option>
            <option v-for="ubs in listaUbs" :key="ubs.id" :value="ubs.id">
              {{ ubs.nome }}
            </option>
          </select>
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
  equipeParaEditar: { type: Object, default: null },
  listaUbs: { type: Array, required: true },
});

const emit = defineEmits(["fechar", "salvar"]);

const equipeEditavel = ref({ nome: "", ubsId: "" });

const titulo = computed(() =>
  props.equipeParaEditar ? "Editar Equipe" : "Adicionar Nova Equipe"
);

watch(
  () => props.equipeParaEditar,
  (novoValor) => {
    if (novoValor) {
      equipeEditavel.value = { ...novoValor };
    } else {
      // Ao adicionar uma nova, define a primeira UBS da lista como padrão, se houver
      equipeEditavel.value = { nome: "", ubsId: props.listaUbs[0]?.id || "" };
    }
  },
  { immediate: true }
);

const salvar = () => {
  if (equipeEditavel.value.nome.trim() && equipeEditavel.value.ubsId) {
    emit("salvar", equipeEditavel.value);
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
