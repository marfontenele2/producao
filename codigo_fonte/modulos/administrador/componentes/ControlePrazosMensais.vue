<template>
  <div class="card-prazos">
    <h3>Prazos Mensais</h3>
    <p>Defina as datas de abertura e fechamento para os relatórios de cada mês.</p>
    <div class="seletor-competencia">
      <label for="competencia">Selecione a Competência (Mês/Ano):</label>
      <input id="competencia" type="month" v-model="competenciaSelecionada" />
    </div>
    <div v-if="carregando" class="mensagem-info">Carregando prazos...</div>
    <div class="lista-prazos" v-else>
      <div v-for="modulo in modulosMensais" :key="modulo.chavePrazo" class="item-prazo">
        <span class="nome-modulo">{{ modulo.nome }}</span>
        <div class="campos-data">
          <div class="grupo-formulario-inline">
            <label :for="`abertura-${modulo.chavePrazo}`">Abertura</label>
            <input
              :id="`abertura-${modulo.chavePrazo}`"
              type="date"
              v-model="prazos[modulo.chavePrazo].abertura"
            />
          </div>
          <div class="grupo-formulario-inline">
            <label :for="`fechamento-${modulo.chavePrazo}`">Fechamento</label>
            <input
              :id="`fechamento-${modulo.chavePrazo}`"
              type="date"
              v-model="prazos[modulo.chavePrazo].fechamento"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { servicoPrazos } from '../servicos/servicoPrazos.js'

const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const prazos = ref({})
const carregando = ref(true)

const modulosMensais = [
  { nome: 'BPA (Testes Rápidos)', chavePrazo: 'bpa' },
  { nome: 'Boletim de Testes (Antigo)', chavePrazo: 'boletimTestesRapidos' },
  { nome: 'Suplementos', chavePrazo: 'suplementos' },
  { nome: 'Educação Permanente', chavePrazo: 'educacaoPermanente' },
  { nome: 'Saúde do Adolescente', chavePrazo: 'adolescente' },
  { nome: 'Acompanhamento de Gestantes', chavePrazo: 'gestantes' },
]

let unsubscribe = null

watch(
  competenciaSelecionada,
  (novaCompetencia) => {
    if (unsubscribe) unsubscribe()
    carregando.value = true
    unsubscribe = servicoPrazos.monitorarPrazosDoMes(novaCompetencia, (dadosRemotos) => {
      const prazosLocais = {}
      modulosMensais.forEach((mod) => {
        prazosLocais[mod.chavePrazo] = {
          abertura: dadosRemotos[mod.chavePrazo]?.abertura || '',
          fechamento: dadosRemotos[mod.chavePrazo]?.fechamento || '',
        }
      })
      prazos.value = prazosLocais
      carregando.value = false
    })
  },
  { immediate: true },
)

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

defineExpose({
  prazos,
  competenciaSelecionada,
  salvar: () => servicoPrazos.salvarPrazosDoMes(competenciaSelecionada.value, prazos.value),
})
</script>

<style scoped>
.seletor-competencia {
  margin-bottom: 2rem;
}
.seletor-competencia label {
  margin-right: 1rem;
  font-weight: 500;
}
.seletor-competencia input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--cor-borda-suave);
}
.lista-prazos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.item-prazo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 6px;
}
.nome-modulo {
  font-weight: 500;
}
.campos-data {
  display: flex;
  gap: 1.5rem;
}
.grupo-formulario-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.grupo-formulario-inline input {
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
}
</style>
