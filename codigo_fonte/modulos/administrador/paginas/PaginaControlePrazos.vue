<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Controle de Prazos de Produção</h1>
      <button class="botao botao-primario" @click="salvarTudo">
        <Save :size="18" />
        <span>Salvar Todas as Alterações</span>
      </button>
    </header>

    <div class="conteudo-prazos">
      <ControlePrazosMensais ref="prazosMensaisComp" />
      <ControlePrazosSemanais ref="prazosSemanaisComp" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ControlePrazosMensais from '../componentes/ControlePrazosMensais.vue'
import ControlePrazosSemanais from '../componentes/ControlePrazosSemanais.vue'
import { Save } from 'lucide-vue-next'

const prazosMensaisComp = ref(null)
const prazosSemanaisComp = ref(null)

async function salvarTudo() {
  try {
    await Promise.all([prazosMensaisComp.value.salvar(), prazosSemanaisComp.value.salvar()])
    // Lógica para notificação de sucesso aqui
    alert('Prazos salvos com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar prazos:', error)
    // Lógica para notificação de erro aqui
    alert('Ocorreu um erro ao salvar os prazos.')
  }
}
</script>

<style scoped>
.conteudo-prazos {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.card-prazos {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}
.card-prazos h3 {
  margin-top: 0;
}
.card-prazos p {
  color: #64748b;
  margin-bottom: 1.5rem;
}
</style>
