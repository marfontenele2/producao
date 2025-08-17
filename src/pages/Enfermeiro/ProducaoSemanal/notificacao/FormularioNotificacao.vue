<template>
  <div class="notification-form">
    <div class="form-group">
      <p class="question">
        Houve notificação de casos suspeitos de Tétano Neonatal?
      </p>
      <div class="radio-group">
        <label>
          <input
            type="radio"
            :value="'sim'"
            v-model="formData.tetanoNeonatal"
          />
          Sim
        </label>
        <label>
          <input
            type="radio"
            :value="'nao'"
            v-model="formData.tetanoNeonatal"
          />
          Não
        </label>
      </div>
    </div>
    <div class="form-group">
      <p class="question">
        Houve notificação de casos suspeitos de Paralisia Flácida Aguda?
      </p>
      <div class="radio-group">
        <label>
          <input
            type="radio"
            :value="'sim'"
            v-model="formData.paralisiaFlacida"
          />
          Sim
        </label>
        <label>
          <input
            type="radio"
            :value="'nao'"
            v-model="formData.paralisiaFlacida"
          />
          Não
        </label>
      </div>
    </div>
    <div class="form-group">
      <label for="sarampo" class="question"
        >Nº de casos suspeitos de Sarampo notificados:</label
      >
      <input
        id="sarampo"
        type="number"
        min="0"
        v-model.number="formData.casosSuspeitosSarampo"
        class="number-input"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<style scoped lang="scss">
.notification-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  .question {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  .radio-group {
    display: flex;
    gap: 1.5rem;
    label {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
  .number-input {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    width: 100px;
  }
}
</style>
