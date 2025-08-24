<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Produção Mensal</h1>
      <span class="competencia-info">Competência: {{ competenciaAtualFormatada }}</span>
    </header>
    <div class="conteudo-card">
      <div v-if="carregando" class="carregando-info">Carregando prazos e status da produção...</div>
      <div v-else class="grid-cards">
        <div
          v-for="modulo in modulosComStatus"
          :key="modulo.nome"
          class="card-producao"
          @click="navegarParaProducao(modulo.rota, modulo.status)"
          :class="{ 'card-bloqueado': !['Aberto', 'Entregue'].includes(modulo.status) }"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoPrazos } from '@/modulos/administrador/servicos/servicoPrazos'
import { servicoVerificacaoProducao } from '@/modulos/enfermeiro/servicos/servicoVerificacaoProducao'
import { servicoStatusProducao } from '@/modulos/enfermeiro/servicos/servicoStatusProducao'
import IndicadorStatusProducao from '@/modulos/enfermeiro/componentes/IndicadorStatusProducao.vue'

const router = useRouter()
const storeUsuario = useStoreUsuario()
const carregando = ref(true)
const modulosComStatus = ref([])

const hoje = new Date()
const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

const competenciaAtualFormatada = computed(() => {
  const [ano, mes] = competenciaAtual.split('-')
  const data = new Date(ano, parseInt(mes, 10) - 1)
  return data.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
})

const modulosMensais = [
  { nome: 'BPA (Testes Rápidos)', rota: 'EnfermeiroBpa', chavePrazo: 'bpa' },
  {
    nome: 'Boletim de Testes (Antigo)',
    rota: 'EnfermeiroBoletim',
    chavePrazo: 'boletimTestesRapidos',
  },
  { nome: 'Suplementos', rota: 'EnfermeiroSuplementos', chavePrazo: 'suplementos' },
  {
    nome: 'Educação Permanente',
    rota: 'EnfermeiroEducacaoPermanente',
    chavePrazo: 'educacaoPermanente',
  },
  { nome: 'Saúde do Adolescente', rota: 'EnfermeiroSaudeAdolescente', chavePrazo: 'adolescente' },
  {
    nome: 'Acompanhamento de Gestantes',
    rota: 'EnfermeiroAcompanhamentoGestantes',
    chavePrazo: 'gestantes',
  },
]

onMounted(async () => {
  const equipeId = storeUsuario.usuario?.equipeId
  if (!equipeId) {
    carregando.value = false
    return
  }

  const statusPorPrazo = await servicoStatusProducao.obterTodosStatusProducao()

  servicoPrazos.monitorarPrazosDoMes(competenciaAtual, async (prazosDoMes) => {
    const modulosProcessados = []

    for (const modulo of modulosMensais) {
      const prazoInfo = prazosDoMes[modulo.chavePrazo] || {}
      const dataAbertura = prazoInfo.abertura
      const dataFechamento = prazoInfo.fechamento

      const foiEntregue = await servicoVerificacaoProducao.verificarEntregaMensal(
        competenciaAtual,
        equipeId,
        modulo.chavePrazo,
      )

      let statusFinal = foiEntregue ? 'Entregue' : statusPorPrazo[modulo.chavePrazo] || 'Pendente'

      modulosProcessados.push({
        ...modulo,
        status: statusFinal,
        dataAbertura: dataAbertura
          ? new Date(dataAbertura + 'T00:00:00').toLocaleDateString('pt-BR')
          : 'N/D',
        dataFechamento: dataFechamento
          ? new Date(dataFechamento + 'T00:00:00').toLocaleDateString('pt-BR')
          : 'N/D',
      })
    }
    modulosComStatus.value = modulosProcessados
    carregando.value = false
  })
})

/**
 * [ALTERADO] A lógica de navegação agora permite o acesso se o status for 'Aberto' ou 'Entregue'.
 * O bloqueio ocorre para 'Fechado', 'Encerrado' e 'Pendente'.
 */
function navegarParaProducao(nomeRota, status) {
  const statusPermitidos = ['Aberto', 'Entregue']
  if (!statusPermitidos.includes(status)) {
    alert(`Acesso bloqueado. Status da produção: ${status}.`)
    return
  }
  router.push({ name: nomeRota })
}
</script>

<style scoped>
/* Estilos permanecem inalterados */
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
