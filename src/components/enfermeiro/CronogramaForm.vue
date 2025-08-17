// ARQUIVO GERADO: src/components/enfermeiro/CronogramaForm.vue
<template>
  <div class="form-placeholder">
    <h3>Formulário de Atividade</h3>
    <p>Área para adicionar/editar eventos do cronograma.</p>
    <div class="actions">
      <button @click="$emit('fechar')">Cancelar</button>
      <button @click="$emit('salvar', {})">Salvar (Simulado)</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(["salvar", "fechar"]);
</script>

<style scoped>
.form-placeholder {
  border: 1px dashed #ccc;
  padding: 20px;
  margin-top: 20px;
  border-radius: 8px;
  background-color: #fafafa;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}
</style>
