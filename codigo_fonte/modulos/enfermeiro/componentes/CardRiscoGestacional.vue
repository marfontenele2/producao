<template>
  <div class="conteudo-card">
    <h3 class="titulo-secao">{{ titulo }}</h3>
    <div class="grid-campos">
      <div class="campo">
        <label>Total</label>
        <input type="number" min="0" :value="totalCalculado" readonly class="total-calculado" />
      </div>
      <div class="campo">
        <label>Branca</label>
        <input
          type="number"
          min="0"
          v-model.number="dados.branca"
          placeholder="0"
          @input="atualizarTotal"
        />
      </div>
      <div class="campo">
        <label>Parda</label>
        <input
          type="number"
          min="0"
          v-model.number="dados.parda"
          placeholder="0"
          @input="atualizarTotal"
        />
      </div>
      <div class="campo">
        <label>Preta</label>
        <input
          type="number"
          min="0"
          v-model.number="dados.preta"
          placeholder="0"
          @input="atualizarTotal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  titulo: String,
  dados: Object,
})

// [ALTERADO] O total é uma propriedade computada para refletir a soma em tempo real
const totalCalculado = computed(() => {
  const total = (props.dados.branca || 0) + (props.dados.parda || 0) + (props.dados.preta || 0)
  // Atualiza o objeto de dados reativamente
  props.dados.total = total
  return total
})

// Função vazia apenas para forçar a recomputação, o v-model já é reativo
const atualizarTotal = () => {}
</script>

<style scoped>
.titulo-secao {
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 1rem;
}
.grid-campos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
}
.campo input {
  padding: 10px 14px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.total-calculado {
  background-color: #f1f5f9;
  font-weight: 600;
  color: var(--cor-primaria);
}
</style>
