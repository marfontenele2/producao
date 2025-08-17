<template>
  <div class="form-overlay" @click.self="$emit('fechar')">
    <div class="form-container">
      <h2>{{ titulo }}</h2>
      <form @submit.prevent="salvar">
        <div class="form-group">
          <label for="nome">Nome do Profissional</label>
          <input type="text" id="nome" v-model="form.nome" required />
        </div>
        <div class="form-group">
          <label for="cpf">CPF</label>
          <input type="text" id="cpf" v-model="form.cpf" />
        </div>
        <div class="form-group">
          <label for="dataNascimento">Data de Nascimento</label>
          <input
            type="date"
            id="dataNascimento"
            v-model="form.dataNascimento"
          />
        </div>
        <div class="form-group">
          <label for="cargo">Cargo</label>
          <select id="cargo" v-model="form.cargo" required>
            <option disabled value="">Selecione um cargo</option>
            <option v-for="cargo in cargos" :key="cargo" :value="cargo">
              {{ cargo }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="registro">Registro Profissional (CRM, COREN, etc.)</label>
          <input type="text" id="registro" v-model="form.registro" />
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="form.status" required>
            <option>Ativo</option>
            <option>Férias</option>
            <option>Inativo</option>
          </select>
        </div>
        <div
          v-if="form.cargo === 'Agente Comunitário de Saúde (ACS)'"
          class="form-group"
        >
          <label for="cbo">CBO</label>
          <input type="text" id="cbo" v-model="form.cbo" required />
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
  profissionalParaEditar: { type: Object, default: null },
});
const emit = defineEmits(["fechar", "salvar"]);

const form = ref({});
const titulo = computed(() =>
  props.profissionalParaEditar
    ? "Editar Profissional"
    : "Adicionar Profissional"
);

const cargos = ref([
  "Médico",
  "Enfermeiro",
  "Técnico de Enfermagem",
  "Dentista",
  "Auxiliar de Saúde Bucal (ASB)",
  "Agente Comunitário de Saúde (ACS)",
  "Fisioterapeuta",
  "Psicólogo",
  "Assistente Social",
  "Nutricionista",
  "Farmacêutico",
  "Fonoaudiólogo",
  "Terapeuta Ocupacional",
  "Educador Físico",
]);

watch(
  () => props.profissionalParaEditar,
  (novoValor) => {
    if (novoValor) {
      form.value = { ...novoValor };
    } else {
      form.value = {
        nome: "",
        cpf: "",
        dataNascimento: "",
        cargo: "",
        cbo: "", // <-- CAMPO ADICIONADO
        registro: "",
        status: "Ativo",
      };
    }
  },
  { immediate: true }
);

const salvar = () => emit("salvar", form.value);
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
  max-height: 90vh;
  overflow-y: auto;
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
