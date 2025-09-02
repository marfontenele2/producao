<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Produção Semanal</h1>
    </header>
    <div class="conteudo-card">
      <div v-if="carregando" class="carregando-info">Carregando prazos e status da produção...</div>
      <div v-else class="grid-cards">
        <div
          v-for="modulo in modulosComStatus"
          :key="modulo.nome"
          class="card-producao"
          @click="navegarParaProducao(modulo.rota, modulo.status)"
          :class="{ 'card-bloqueado': modulo.status !== 'Aberto' && modulo.status !== 'Entregue' }"
        >
          <div class="card-conteudo">
            <span class="card-titulo">{{ modulo.nome }}</span>
            <IndicadorStatusProducao :status="modulo.status" />
          </div>
          <div class="card-prazos">
            <div class="prazo-item">
              <span class="prazo-label">Abre:</span>
              <span class="prazo-data">{{ modulo.dataAbertura || 'N/D' }}</span>
            </div>
            <div class="prazo-item">
              <span class="prazo-label">Fecha:</span>
              <span class="prazo-data">{{ modulo.dataFechamento || 'N/D' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { servicoPrazosSemanais } from '@/modulos/administrador/servicos/servicoPrazosSemanais'
import IndicadorStatusProducao from '@/modulos/enfermeiro/componentes/IndicadorStatusProducao.vue'
// ===================================================================
// === NOVOS IMPORTS NECESSÁRIOS ===
// ===================================================================
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoVerificacaoProducao } from '../servicos/servicoVerificacaoProducao'
// ===================================================================

const router = useRouter()
const carregando = ref(true)
const modulosComStatus = ref([])
// ADICIONADO storeUsuario para pegar o equipeId
const storeUsuario = useStoreUsuario()
let unsubPrazos = null

// MODIFICADO: Adicionada a 'chaveVerificacao' para conectar com o serviço de status
const modulosSemanais = [
  { nome: 'MDDA', rota: 'EnfermeiroMDDA', chavePrazo: 'mdda', chaveVerificacao: 'mdda' },
  {
    nome: 'Notificação Semanal',
    rota: 'EnfermeiroNotificacaoSemanal',
    chavePrazo: 'notificacaoSemanal',
    chaveVerificacao: 'notificacaoSemanal',
  },
  {
    nome: 'Sarampo',
    rota: 'EnfermeiroSarampo',
    chavePrazo: 'sarampo',
    chaveVerificacao: 'sarampo',
  },
]

// ADICIONADO: Função para obter a chave da semana, para usar na verificação
function getWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`
}

onMounted(() => {
  unsubPrazos = servicoPrazosSemanais.monitorarPrazos(async (prazos) => {
    // MODIFICADO: A função de callback agora é assíncrona para esperar a verificação de status
    const hoje = new Date()
    const diaDaSemanaHoje = hoje.getDay()
    const semanaKey = getWeekKey(hoje)
    const equipeId = storeUsuario.usuario?.equipeId

    // Usamos Promise.all para buscar o status de todos os módulos em paralelo
    const modulosProcessados = await Promise.all(
      modulosSemanais.map(async (modulo) => {
        const prazoInfo = prazos[modulo.chavePrazo] || {}
        const diaAbertura = parseInt(prazoInfo.abertura, 10)
        const diaFechamento = parseInt(prazoInfo.fechamento, 10)

        // LÓGICA DE STATUS ATUALIZADA
        const foiEntregue = await servicoVerificacaoProducao.verificarEntregaSemanal(
          semanaKey,
          equipeId,
          modulo.chaveVerificacao,
        )

        let status = 'Fechado' // Status padrão se não estiver dentro do prazo
        if (foiEntregue) {
          status = 'Entregue'
        } else if (!isNaN(diaAbertura) && !isNaN(diaFechamento)) {
          if (diaDaSemanaHoje >= diaAbertura && diaDaSemanaHoje <= diaFechamento) {
            status = 'Aberto'
          } else if (diaDaSemanaHoje > diaFechamento) {
            status = 'Encerrado'
          } else if (diaDaSemanaHoje < diaAbertura) {
            status = 'Pendente'
          }
        }

        const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

        return {
          ...modulo,
          status,
          dataAbertura: !isNaN(diaAbertura) ? diasDaSemana[diaAbertura] : 'N/D',
          dataFechamento: !isNaN(diaFechamento) ? diasDaSemana[diaFechamento] : 'N/D',
        }
      }),
    )

    modulosComStatus.value = modulosProcessados
    carregando.value = false
  })
})

onUnmounted(() => {
  if (unsubPrazos) unsubPrazos()
})

function navegarParaProducao(nomeRota, status) {
  // MODIFICADO: Permite clicar no card se já foi entregue (para visualizar/editar)
  if (status !== 'Aberto' && status !== 'Entregue') {
    alert(`Acesso bloqueado. Status da produção: ${status}.`)
    return
  }
  router.push({ name: nomeRota })
}
</script>

<style scoped>
/* Estilos permanecem os mesmos */
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
