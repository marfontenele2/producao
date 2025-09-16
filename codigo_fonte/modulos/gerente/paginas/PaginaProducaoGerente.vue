<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Painel de Produção</h1>
      <span class="competencia-info">Competência: {{ competenciaAtualFormatada }}</span>
    </header>
    <div class="conteudo-card">
      <div v-if="carregando" class="carregando-info">Carregando prazos e status da produção...</div>
      <div v-else class="grid-cards">
        <div
          v-for="modulo in modulosComStatus"
          :key="modulo.nome"
          class="card-producao"
          @click="navegarPara(modulo.rota, modulo.status)"
          :class="{ 'card-bloqueado': modulo.status !== 'Aberto' }"
        >
          <div class="card-conteudo">
            <span class="card-titulo">{{ modulo.nome }}</span>
            <IndicadorStatusProducao :status="modulo.status" />
          </div>
          <div class="card-prazos">
            <div class="prazo-item">
              <span class="prazo-label">Abertura:</span>
              <span class="prazo-data">{{ modulo.dataAbertura }}</span>
            </div>
            <div class="prazo-item">
              <span class="prazo-label">Fechamento:</span>
              <span class="prazo-data">{{ modulo.dataFechamento }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue' // Adicionado onUnmounted
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes' // Adicionado
import { servicoPrazos } from '@/modulos/administrador/servicos/servicoPrazos'
import IndicadorStatusProducao from '@/modulos/enfermeiro/componentes/IndicadorStatusProducao.vue'

const router = useRouter()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes() // Adicionado
const carregando = ref(true)
const modulosComStatus = ref([])

const hoje = new Date()
const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

const competenciaAtualFormatada = computed(() => {
  const [ano, mes] = competenciaAtual.split('-')
  const data = new Date(ano, parseInt(mes, 10) - 1)
  return data.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
})

// MODIFICADO: Lista de módulos agora inclui Saúde Mental
const modulosGerente = [
  { nome: 'Cadastro de Profissionais (SCNES)', rota: 'GerenteGerenciarSCNES', chavePrazo: 'scnes' },
  { nome: 'Acompanhamento de Saúde Mental', rota: 'GerenteSaudeMental', chavePrazo: 'saudeMental' },
]

let unsubscribePrazos = null

onMounted(() => {
  unsubscribePrazos = servicoPrazos.monitorarPrazosDoMes(competenciaAtual, (prazosDoMes) => {
    const modulosProcessados = []
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    for (const modulo of modulosGerente) {
      const prazoInfo = prazosDoMes[modulo.chavePrazo] || {}
      const dataAbertura = prazoInfo.abertura ? new Date(prazoInfo.abertura + 'T00:00:00') : null
      const dataFechamento = prazoInfo.fechamento
        ? new Date(prazoInfo.fechamento + 'T23:59:59')
        : null

      let status = 'Fechado'
      if (dataAbertura && dataFechamento) {
        if (hoje >= dataAbertura && hoje <= dataFechamento) {
          status = 'Aberto'
        }
      }

      modulosProcessados.push({
        ...modulo,
        status: status,
        dataAbertura: dataAbertura
          ? dataAbertura.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          : 'N/D',
        dataFechamento: dataFechamento
          ? dataFechamento.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
          : 'N/D',
      })
    }
    modulosComStatus.value = modulosProcessados
    carregando.value = false
  })
})

onUnmounted(() => {
  // Adicionado
  if (unsubscribePrazos) unsubscribePrazos()
})

function navegarPara(nomeRota, status) {
  if (status !== 'Aberto') {
    storeNotificacoes.mostrarNotificacao({
      tipo: 'alerta',
      mensagem: `Acesso bloqueado. Status da produção: ${status}.`,
    })
    return
  }
  router.push({ name: nomeRota })
}
</script>

<style scoped>
/* Nenhum estilo precisa ser alterado aqui */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.card-producao {
  background-color: #f8fafc;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}
.card-producao:hover {
  border-color: var(--cor-primaria);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transform: translateY(-3px);
}
.card-bloqueado {
  cursor: not-allowed;
  background-color: #f1f5f9;
  opacity: 0.7;
}
.card-bloqueado:hover {
  border-color: var(--cor-borda-suave);
  box-shadow: none;
  transform: none;
}
.card-conteudo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-titulo {
  font-weight: 600;
  color: var(--cor-texto-padrao);
}
.carregando-info {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.competencia-info {
  font-size: 1rem;
  font-weight: 500;
  color: #475569;
  text-transform: capitalize;
}
.card-prazos {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-borda-suave);
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}
.prazo-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}
.prazo-label {
  color: #64748b;
  font-weight: 500;
}
.prazo-data {
  color: var(--cor-texto-padrao);
  font-weight: 600;
}
</style>
