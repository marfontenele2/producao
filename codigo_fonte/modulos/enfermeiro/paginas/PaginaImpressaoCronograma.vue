<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Impressão do Cronograma da Equipe</h1>
    </header>
    <div class="conteudo-card card-filtros">
      <div class="campo">
        <label for="competencia">Selecione a Competência</label>
        <input type="month" id="competencia" v-model="competencia" class="input-padrao" />
      </div>
      <div class="campo">
        <label for="assinante">Nome para Assinatura</label>
        <input
          type="text"
          id="assinante"
          v-model="nomeAssinante"
          class="input-padrao"
          placeholder="Digite seu nome"
        />
      </div>
      <button
        class="botao botao-primario"
        @click="prepararRelatorio"
        :disabled="!competencia || buscando"
      >
        <FileSearch :size="18" /> {{ buscando ? 'Buscando...' : 'Gerar Pré-visualização' }}
      </button>
    </div>
    <div v-if="erroBusca" class="mensagem-feedback erro" style="margin-top: 1rem">
      {{ erroBusca }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreImpressao } from '@/nucleo/stores/storeImpressao'
import { servicoCronograma } from '../servicos/servicoCronograma'
import { addMonths, format } from 'date-fns'
import { FileSearch } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeImpressao = useStoreImpressao()
const router = useRouter()

const buscando = ref(false)
const erroBusca = ref('')
const competencia = ref(new Date().toISOString().slice(0, 7))
const nomeAssinante = ref(storeUsuario.usuario?.nome || '')

async function prepararRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  try {
    const equipeId = storeUsuario.usuario?.equipeId
    if (!equipeId) throw new Error('ID da equipe não encontrado.')

    // 1. Busca os eventos usando a competência selecionada (ex: Outubro)
    const eventos = await servicoCronograma.buscarCronograma(competencia.value, equipeId)

    // ======================================================================================
    // 💥 CORREÇÃO CRÍTICA: LÓGICA DO MÊS SEGUINTE
    // Calculamos qual é a competência que o calendário deve EXIBIR (Novembro)
    // ======================================================================================
    const [ano, mes] = competencia.value.split('-').map(Number)
    const dataProximoMes = addMonths(new Date(ano, mes - 1, 1), 1)
    const competenciaParaCalendario = format(dataProximoMes, 'yyyy-MM')
    // ======================================================================================

    storeImpressao.setDados({
      tipo: 'cronograma',
      eventos: eventos,
      competencia: competencia.value, // Mantém o ID original para rastreabilidade
      competenciaCalendario: competenciaParaCalendario, // <-- NOVO: A competência que o preview DEVE renderizar
      nomeAssinante: nomeAssinante.value,
      infoEquipe: {
        nomeEquipe: storeUsuario.usuario?.nomeEquipe,
        nomeUbs: storeUsuario.usuario?.nomeUbs,
      },
    })

    router.push({ name: 'EnfermeiroPreviewCronograma' })
  } catch (error) {
    console.error('Erro ao preparar relatório:', error)
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}
</script>

<style scoped>
.conteudo-card.card-filtros {
  padding: 1.5rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.mensagem-feedback.erro {
  color: #b91c1c;
  background-color: #fee2e2;
  padding: 1rem;
  border-radius: 8px;
}
</style>
