<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Impressão do Cronograma da Equipe</h1>
    </header>
    <div class="conteudo-card card-filtros">
      <div class="campo">
        <label for="competencia">Competência</label>
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

    const eventos = await servicoCronograma.buscarCronograma(competencia.value, equipeId)

    if (!eventos || eventos.length === 0) {
      erroBusca.value = 'Nenhum evento encontrado no cronograma para esta competência.'
      return
    }

    // Salva os dados no store temporário
    storeImpressao.setDados({
      tipo: 'cronograma',
      eventos: eventos,
      competencia: competencia.value,
      nomeAssinante: nomeAssinante.value,
      infoEquipe: {
        nomeEquipe: storeUsuario.usuario?.nomeEquipe,
        nomeUbs: storeUsuario.usuario?.nomeUbs,
      },
    })

    // Navega para a página de pré-visualização
    router.push({ name: 'EnfermeiroPreviewCronograma' })
  } catch (error) {
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}
</script>

<style scoped>
/* Estilos permanecem simples, focados nos filtros */
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
