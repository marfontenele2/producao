<template>
  <div class="card-prazos">
    <h3>Prazos Semanais</h3>
    <p>
      Defina os dias da semana para abertura e fechamento dos relatórios semanais. Esta regra é a
      mesma para todas as semanas.
    </p>

    <div v-if="carregando" class="mensagem-info">Carregando prazos...</div>

    <div class="lista-prazos" v-else>
      <div v-for="modulo in modulosSemanais" :key="modulo.chave" class="item-prazo">
        <span class="nome-modulo">{{ modulo.nome }}</span>
        <div class="campos-data">
          <div class="grupo-formulario-inline">
            <label :for="`abertura-${modulo.chave}`">Abre na</label>
            <select :id="`abertura-${modulo.chave}`" v-model="prazos[modulo.chave].abertura">
              <option v-for="(dia, index) in diasDaSemana" :key="index" :value="index">
                {{ dia }}
              </option>
            </select>
          </div>
          <div class="grupo-formulario-inline">
            <label :for="`fechamento-${modulo.chave}`">Fecha na</label>
            <select :id="`fechamento-${modulo.chave}`" v-model="prazos[modulo.chave].fechamento">
              <option v-for="(dia, index) in diasDaSemana" :key="index" :value="index">
                {{ dia }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoPrazosSemanais } from '../servicos/servicoPrazosSemanais.js'

const prazos = ref({})
const carregando = ref(true)

const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const modulosSemanais = [
  { chave: 'mdda', nome: 'MDDA' },
  { chave: 'notificacaoSemanal', nome: 'Notificação Semanal' },
  { chave: 'sarampo', nome: 'Sarampo' },
]

let unsubscribe = null

onMounted(() => {
  unsubscribe = servicoPrazosSemanais.monitorarPrazos((dadosRemotos) => {
    const prazosLocais = {}
    modulosSemanais.forEach((mod) => {
      prazosLocais[mod.chave] = {
        abertura: dadosRemotos[mod.chave]?.abertura ?? 1, // Padrão: Segunda
        fechamento: dadosRemotos[mod.chave]?.fechamento ?? 5, // Padrão: Sexta
      }
    })
    prazos.value = prazosLocais
    carregando.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

defineExpose({
  salvar: () => servicoPrazosSemanais.salvarPrazos(prazos.value),
})
</script>

<style scoped>
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
.grupo-formulario-inline select {
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
}
</style>
