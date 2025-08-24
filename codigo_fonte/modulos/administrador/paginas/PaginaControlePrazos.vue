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
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { Save } from 'lucide-vue-next'

const prazosMensaisComp = ref(null)
const prazosSemanaisComp = ref(null)
const storeNotificacoes = useStoreNotificacoes()

async function salvarTudo() {
  try {
    if (prazosMensaisComp.value && prazosSemanaisComp.value) {
      await Promise.all([prazosMensaisComp.value.salvar(), prazosSemanaisComp.value.salvar()])
      storeNotificacoes.mostrarNotificacao({
        mensagem: 'Prazos salvos com sucesso!',
        tipo: 'sucesso',
      })
    } else {
      throw new Error('Componentes de prazo não foram inicializados corretamente.')
    }
  } catch (error) {
    console.error('Falha ao salvar prazos:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Ocorreu um erro ao salvar os prazos. Verifique o console.',
      tipo: 'erro',
    })
  }
}
</script>

<style scoped>
.conteudo-prazos {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
