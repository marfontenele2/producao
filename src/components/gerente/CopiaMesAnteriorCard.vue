// 📄 ARQUIVO: src/components/gerente/CopiaMesAnteriorCard.vue
<template>
  <div class="copy-container">
    <div class="copy-content">
      <ClipboardCopy :size="24" class="icon" />
      <div class="text-content">
        <h4>Copiar Dados</h4>
        <p>
          Encontramos <strong>{{ count }}</strong> profissionais registrados no
          mês anterior. Deseja usá-los como base para este mês?
        </p>
      </div>
    </div>
    <div class="actions">
      <button @click="$emit('dismiss')" class="btn-dismiss">
        Não, começar do zero
      </button>
      <button @click="$emit('copy')" class="btn-copy">Sim, usar dados</button>
    </div>
  </div>
</template>

<script setup>
import { ClipboardCopy } from "lucide-vue-next";

defineProps({
  count: {
    type: Number,
    required: true,
  },
});

defineEmits(["copy", "dismiss"]);
</script>

<style lang="scss" scoped>
.copy-container {
  background-color: #e9f5ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copy-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon {
  color: #007bff;
  flex-shrink: 0;
}

.text-content {
  h4 {
    margin: 0 0 4px 0;
    color: #0056b3;
  }
  p {
    margin: 0;
    color: #333;
  }
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 8px 16px;
  border-radius: 5px;
  border: 1px solid;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-dismiss {
  background-color: transparent;
  border-color: #6c757d;
  color: #6c757d;
  &:hover {
    background-color: #6c757d;
    color: #fff;
  }
}

.btn-copy {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
  &:hover {
    background-color: #0056b3;
    border-color: #0056b3;
  }
}
</style>
