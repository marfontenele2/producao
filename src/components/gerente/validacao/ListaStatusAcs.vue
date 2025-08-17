<template>
  <div class="lista-status-container">
    <h3>Status dos Profissionais</h3>
    <ul class="lista-status-acs">
      <li
        v-for="acs in lista"
        :key="acs.id"
        @click="$emit('selecionar', acs)"
        :class="{ selecionado: acs.id === acsSelecionadoId }"
        :title="`Clique para ver os detalhes de ${acs.nome}`"
      >
        <span class="nome">{{ acs.nome }}</span>
        <StatusBadge :status="acs.status" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import StatusBadge from "@/components/shared/StatusBadge.vue";
defineProps({
  lista: { type: Array, required: true },
  acsSelecionadoId: { type: String, default: null },
});
defineEmits(["selecionar"]);
</script>

<style lang="scss" scoped>
.lista-status-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  height: 100%;
}
h3 {
  padding: 1rem 1.5rem;
  margin: 0;
  border-bottom: 1px solid #dee2e6;
  font-size: 1.1rem;
  color: #495057;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background-color 0.2s;
}
li:last-child {
  border-bottom: none;
}
li:hover {
  background-color: #f8f9fa;
}
li.selecionado {
  background-color: #e9ecef;
  border-left: 4px solid #007bff;
  padding-left: calc(1.5rem - 4px);
}
.nome {
  font-weight: 500;
  color: #212529;
}
</style>
