<template>
  <div class="notificacoes-container">
    <transition-group name="list" tag="div">
      <div
        v-for="notificacao in store.notificacoes"
        :key="notificacao.id"
        :class="['notificacao-item', `notificacao-${notificacao.tipo}`]"
      >
        <CircleCheck v-if="notificacao.tipo === 'sucesso'" :size="20" />
        <CircleAlert v-if="notificacao.tipo === 'erro'" :size="20" />
        <TriangleAlert v-if="notificacao.tipo === 'alerta'" :size="20" />
        <span>{{ notificacao.mensagem }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
// [ADICIONADO] Importação do novo ícone
import { CircleCheck, CircleAlert, TriangleAlert } from 'lucide-vue-next'
const store = useStoreNotificacoes()
</script>

<style scoped>
.notificacoes-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.notificacao-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}
.notificacao-sucesso {
  background-color: #22c55e; /* Verde */
}
.notificacao-erro {
  background-color: #ef4444; /* Vermelho */
}
/* [ADICIONADO] Estilo para o tipo 'alerta' */
.notificacao-alerta {
  background-color: #f97316; /* Laranja */
}

/* Animações de entrada e saída */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
