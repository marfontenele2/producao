// 📄 ARQUIVO: src/components/gerente/PacienteForm.vue
<template>
  <div class="form-overlay" @click.self="$emit('fechar')">
    <div class="form-container">
      <h2>{{ titulo }}</h2>
      <form @submit.prevent="salvar">
        <div class="form-group">
          <label for="nome">Nome do Paciente</label>
          <input type="text" id="nome" v-model="form.nome" required />
        </div>
        <div class="form-group">
          <label for="nomeMae">Nome da Mãe</label>
          <input type="text" id="nomeMae" v-model="form.nomeMae" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="dataNascimento">Data de Nascimento</label>
            <input
              type="date"
              id="dataNascimento"
              v-model="form.dataNascimento"
              required
            />
          </div>
          <div class="form-group">
            <label for="cns">CNS do Paciente</label>
            <input type="text" id="cns" v-model="form.cns" />
          </div>
        </div>
        <div class="form-group">
          <label for="endereco">Endereço</label>
          <input type="text" id="endereco" v-model="form.endereco" />
        </div>
        <div class="form-actions">
          <button type="button" @click="$emit('fechar')" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-save">Salvar Paciente</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  pacienteParaEditar: { type: Object, default: null },
});
const emit = defineEmits(["fechar", "salvar"]);

const form = ref({});
const titulo = computed(() =>
  props.pacienteParaEditar ? "Editar Paciente" : "Adicionar Paciente"
);

watch(
  () => props.pacienteParaEditar,
  (novoValor) => {
    if (novoValor) {
      form.value = { ...novoValor };
    } else {
      form.value = {
        nome: "",
        nomeMae: "",
        dataNascimento: "",
        cns: "",
        endereco: "",
      };
    }
  },
  { immediate: true }
);

const salvar = () => emit("salvar", form.value);
</script>

<style lang="scss" scoped>
/* Estilos para o formulário modal */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.form-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group {
  margin-bottom: 1.25rem;
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
  gap: 1rem;
  margin-top: 1.5rem;
}
button {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.btn-save {
  background-color: #007bff;
  color: #fff;
}
.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}
</style>
