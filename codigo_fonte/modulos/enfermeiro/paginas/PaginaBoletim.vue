<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Boletim de Testes Rápidos</h1>
      <button
        class="botao botao-primario"
        @click="finalizar"
        :disabled="salvando || !dadosBoletim || dadosBoletim.finalizado"
      >
        <CheckCircle :size="18" />
        {{ dadosBoletim?.finalizado ? 'Competência Finalizada' : 'Finalizar Competência' }}
      </button>
    </header>

    <div class="conteudo-card">
      <p class="secao-descricao">
        Selecione um teste abaixo para registrar a produção. Apenas testes liberados pelo
        administrador para a competência <strong>{{ competenciaAtualFormatada }}</strong> são
        exibidos.
      </p>
      <div v-if="carregando">Carregando testes liberados...</div>
      <div v-if="!carregando && testesLiberados.length === 0">
        Nenhum teste liberado para esta competência.
      </div>
      <div v-if="!carregando && testesLiberados.length > 0" class="grid-testes">
        <div
          v-for="teste in testesLiberados"
          :key="teste.id"
          class="card-teste"
          @click="navegarParaTeste(teste.id)"
        >
          <FlaskConical :size="32" />
          <span class="card-titulo">{{ teste.nome }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoLiberacoes } from '@/modulos/administrador/servicos/servicoLiberacoes'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { servicoBoletim } from '@/modulos/enfermeiro/servicos/servicoBoletim'
import { FlaskConical, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregando = ref(true)
const salvando = ref(false)
const testesLiberados = ref([])
const dadosBoletim = ref(null)

const hoje = new Date()
const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

const competenciaAtualFormatada = computed(() => {
  const [ano, mes] = competenciaAtual.split('-')
  return `${mes}/${ano}`
})

onMounted(() => {
  const equipeId = storeUsuario.usuario.equipeId

  // Carrega o boletim atual para saber o status 'finalizado'
  servicoBoletim.buscarDados(competenciaAtual, equipeId).then((dados) => {
    dadosBoletim.value = dados
  })

  // Combina as liberações com o catálogo de testes
  servicoLiberacoes.monitorarLiberacoes(competenciaAtual, async (liberacoes) => {
    const catalogoTestes = await servicoTestes.buscarTodos()
    const idsTestesLiberados = Object.keys(liberacoes.testesLiberados || {})

    testesLiberados.value = catalogoTestes.filter((teste) => idsTestesLiberados.includes(teste.id))
    carregando.value = false
  })
})

function navegarParaTeste(testeId) {
  if (dadosBoletim.value?.finalizado) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Competência finalizada. Não é possível editar.',
      tipo: 'alerta',
    })
    return
  }
  router.push({ name: 'EnfermeiroPreencherBoletim', params: { testeId } })
}

async function finalizar() {
  salvando.value = true
  try {
    const { equipeId, ubsId, uid } = storeUsuario.usuario
    const dadosParaSalvar = dadosBoletim.value
      ? { ...dadosBoletim.value, finalizado: true }
      : { finalizado: true }

    await servicoBoletim.salvarDados(competenciaAtual, equipeId, ubsId, uid, dadosParaSalvar)
    dadosBoletim.value.finalizado = true // Atualiza o estado local
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Competência finalizada com sucesso!',
      tipo: 'sucesso',
    })
  } catch (error) {
    console.error(error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Erro ao finalizar competência.',
      tipo: 'erro',
    })
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.secao-descricao {
  margin-top: 0;
}
.grid-testes {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.card-teste {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: #f8fafc;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  padding: 2rem;
  min-width: 200px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.card-teste:hover {
  border-color: var(--cor-primaria);
  color: var(--cor-primaria);
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.card-titulo {
  font-weight: 600;
}
</style>
