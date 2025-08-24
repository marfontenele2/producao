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
          :class="{ 'card-bloqueado': modulo.status !== 'Aberto' }"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { servicoPrazosSemanais } from '@/modulos/administrador/servicos/servicoPrazosSemanais'
import IndicadorStatusProducao from '@/modulos/enfermeiro/componentes/IndicadorStatusProducao.vue'

const router = useRouter()
const carregando = ref(true)
const modulosComStatus = ref([])

const modulosSemanais = [
  { nome: 'MDDA', rota: 'EnfermeiroMDDA', chavePrazo: 'mdda' },
  {
    nome: 'Notificação Semanal',
    rota: 'EnfermeiroNotificacaoSemanal',
    chavePrazo: 'notificacaoSemanal',
  },
  { nome: 'Sarampo', rota: 'EnfermeiroSarampo', chavePrazo: 'sarampo' },
]

onMounted(() => {
  servicoPrazosSemanais.monitorarPrazos(async (prazos) => {
    const modulosProcessados = []
    const hoje = new Date()
    const diaDaSemanaHoje = hoje.getDay() // Domingo = 0, Segunda = 1, etc.

    for (const modulo of modulosSemanais) {
      const prazoInfo = prazos[modulo.chavePrazo] || {}
      // CORREÇÃO APLICADA AQUI: usar 'abertura' e 'fechamento'
      const diaAbertura = parseInt(prazoInfo.abertura, 10)
      const diaFechamento = parseInt(prazoInfo.fechamento, 10)

      const foiEntregue = false

      let status = 'Aguardando'
      if (foiEntregue) {
        status = 'Entregue'
      } else if (!isNaN(diaAbertura) && !isNaN(diaFechamento)) {
        if (diaDaSemanaHoje >= diaAbertura && diaDaSemanaHoje <= diaFechamento) {
          status = 'Aberto'
        } else if (diaDaSemanaHoje > diaFechamento) {
          status = 'Encerrado'
        }
      }

      const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

      modulosProcessados.push({
        ...modulo,
        status,
        dataAbertura: !isNaN(diaAbertura) ? diasDaSemana[diaAbertura] : 'N/D',
        dataFechamento: !isNaN(diaFechamento) ? diasDaSemana[diaFechamento] : 'N/D',
      })
    }
    modulosComStatus.value = modulosProcessados
    carregando.value = false
  })
})

function navegarParaProducao(nomeRota, status) {
  if (status !== 'Aberto') {
    alert(`Acesso bloqueado. Status da produção: ${status}.`)
    return
  }
  router.push({ name: nomeRota })
}
</script>

<style scoped>
/* Estilos são idênticos ao da PaginaProducaoMensal.vue */
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
