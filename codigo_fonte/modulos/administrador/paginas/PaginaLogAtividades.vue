<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Log de Atividades do Sistema</h1>
    </header>

    <div class="conteudo-card">
      <div v-if="carregando">Carregando logs...</div>
      <div v-else>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th style="width: 180px">Data/Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="4">Nenhum log de atividade encontrado.</td>
            </tr>
            <tr v-for="log in logs" :key="log.id">
              <td>{{ formatarTimestamp(log.timestamp) }}</td>
              <td>{{ log.nomeUsuario }}</td>
              <td>
                <span class="tag-acao">{{ log.acao }}</span>
              </td>
              <td>{{ formatarDetalhes(log.detalhes) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoAuditoria } from '@/nucleo/servicos_comuns/servicoAuditoria.js'

const logs = ref([])
const carregando = ref(true)
let unsubscribe = null

onMounted(() => {
  unsubscribe = servicoAuditoria.monitorarLogs((lista) => {
    logs.value = lista
    carregando.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

/**
 * Formata o timestamp do Firestore para uma string legível.
 * @param {object} timestamp - O objeto de timestamp do Firestore.
 * @returns {string}
 */
function formatarTimestamp(timestamp) {
  if (!timestamp || !timestamp.toDate) return 'Data inválida'
  return timestamp.toDate().toLocaleString('pt-BR')
}

/**
 * Formata o objeto de detalhes para exibição.
 * @param {object} detalhes - O objeto de detalhes do log.
 * @returns {string}
 */
function formatarDetalhes(detalhes) {
  if (!detalhes) return '--'
  return Object.entries(detalhes)
    .map(([chave, valor]) => `${chave}: ${valor}`)
    .join('; ')
}
</script>

<style scoped>
.tag-acao {
  background-color: #e2e8f0;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}
</style>
