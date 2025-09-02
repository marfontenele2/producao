<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Boletim de Testes Rápidos</h1>
      <button
        v-if="!carregando && painelDeTestes.length > 0"
        class="botao botao-primario"
        @click="finalizar"
        :disabled="salvando || dadosBoletim?.finalizado || !todosOsTestesForamPreenchidos"
        :title="
          dadosBoletim?.finalizado
            ? 'Esta competência já foi finalizada.'
            : !todosOsTestesForamPreenchidos
              ? 'É necessário preencher todas as marcas de todos os testes antes de finalizar.'
              : 'Finalizar e travar a competência para edição.'
        "
      >
        <CheckCircle :size="18" />
        {{ dadosBoletim?.finalizado ? 'Competência Finalizada' : 'Finalizar Competência' }}
      </button>
    </header>

    <div class="conteudo-card">
      <p class="secao-descricao">
        Preencha os dados para cada marca de teste liberada para a competência de
        <strong>{{ competenciaAtualFormatada }}</strong
        >.
      </p>
      <div v-if="carregando" class="aviso-info">
        <LoaderCircle :size="24" class="icone-girando" />
        <span>Carregando painel de testes...</span>
      </div>

      <div v-if="!carregando && painelDeTestes.length === 0" class="aviso-info">
        <h4>Nenhum Teste Liberado</h4>
        <p>
          Não há testes rápidos liberados para esta competência. Peça a um
          <strong>Administrador</strong> para configurar as liberações.
        </p>
      </div>

      <div v-if="!carregando && painelDeTestes.length > 0" class="grid-testes">
        <div
          v-for="teste in painelDeTestes"
          :key="teste.id"
          class="card-teste"
          :class="{ preenchido: teste.todasMarcasPreenchidas }"
        >
          <div class="card-cabecalho" @click="navegarParaTeste(teste.id)">
            <div class="icone-wrapper">
              <FlaskConical :size="32" />
              <CheckCircle v-if="teste.todasMarcasPreenchidas" :size="20" class="icone-check" />
            </div>
            <span class="card-titulo">{{ teste.nome }}</span>
          </div>
          <ul class="lista-marcas-status">
            <li v-for="marca in teste.marcas" :key="marca.id">
              <CheckCircle v-if="marca.preenchida" :size="16" class="icone-marca-preenchida" />
              <Circle v-else :size="16" class="icone-marca-pendente" />
              <span>{{ marca.nome }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { get } from 'lodash-es'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoLiberacoes } from '@/modulos/administrador/servicos/servicoLiberacoes'
import { servicoTestes } from '@/modulos/enfermeiro/servicos/servicoTestes'
import { servicoBoletim } from '@/modulos/enfermeiro/servicos/servicoBoletim'
import { FlaskConical, CheckCircle, LoaderCircle, Circle } from 'lucide-vue-next'

const router = useRouter()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregando = ref(true)
const salvando = ref(false)
const dadosBoletim = ref(null)
// NOVO: 'painelDeTestes' será nossa fonte da verdade para a UI.
const painelDeTestes = ref([])

const hoje = new Date()
const competenciaAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

const competenciaAtualFormatada = computed(() => {
  const [ano, mes] = competenciaAtual.split('-')
  return `${mes}/${ano}`
})

// LÓGICA DE VALIDAÇÃO REFEITA PARA SER MAIS PRECISA
const todosOsTestesForamPreenchidos = computed(() => {
  if (painelDeTestes.value.length === 0) return false
  return painelDeTestes.value.every((teste) => teste.todasMarcasPreenchidas)
})

onMounted(async () => {
  const equipeId = storeUsuario.usuario.equipeId
  try {
    const [liberacoes, catalogo, dadosSalvos] = await Promise.all([
      // Usamos buscarLiberacoes para uma única chamada
      servicoLiberacoes.buscarLiberacoes(competenciaAtual),
      servicoTestes.buscarTodos(),
      servicoBoletim.buscarDados(competenciaAtual, equipeId),
    ])

    dadosBoletim.value = dadosSalvos
    const idsTestesLiberados = Object.keys(liberacoes.testesLiberados || {})
    const dadosSalvosParaTestes = dadosSalvos?.testes || {}

    // LÓGICA PRINCIPAL: Constrói a estrutura de dados completa para o painel.
    painelDeTestes.value = catalogo
      .filter((teste) => idsTestesLiberados.includes(teste.id))
      .map((teste) => {
        // Para cada teste, mapeamos suas marcas liberadas
        const marcasLiberadasParaEsteTeste = teste.marcas.filter(
          (marca) => liberacoes.testesLiberados[teste.id]?.[marca.id],
        )

        // Verificamos o status de preenchimento de cada marca
        const marcasComStatus = marcasLiberadasParaEsteTeste.map((marca) => ({
          ...marca,
          preenchida: !!dadosSalvosParaTestes[teste.id]?.[marca.id],
        }))

        return {
          ...teste,
          marcas: marcasComStatus,
          todasMarcasPreenchidas:
            marcasComStatus.length > 0 && marcasComStatus.every((m) => m.preenchida),
        }
      })
  } catch (error) {
    console.error('Erro ao montar página do boletim:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao carregar dados do boletim.',
      tipo: 'erro',
    })
  } finally {
    carregando.value = false
  }
})

function navegarParaTeste(testeId) {
  if (dadosBoletim.value?.finalizado) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Competência finalizada. Não é possível editar.',
      tipo: 'alerta',
    })
    return
  }
  router.push({
    name: 'EnfermeiroPreencherBoletim',
    params: { competencia: competenciaAtual, testeId: testeId },
  })
}

async function finalizar() {
  if (!todosOsTestesForamPreenchidos.value) {
    storeNotificacoes.mostrarNotificacao({
      mensagem:
        'Todas as marcas de todos os testes liberados devem ser preenchidas antes de finalizar.',
      tipo: 'alerta',
    })
    return
  }
  salvando.value = true
  try {
    const { equipeId, ubsId, uid } = storeUsuario.usuario
    const dadosParaSalvar = { ...dadosBoletim.value, finalizado: true }
    await servicoBoletim.salvarDados(competenciaAtual, equipeId, ubsId, uid, dadosParaSalvar)
    if (dadosBoletim.value) {
      dadosBoletim.value.finalizado = true
    }
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
/* --- ESTILOS ADICIONADOS --- */
.card-teste.preenchido {
  background-color: #eff6ff; /* Tom de azul bem claro */
  border-color: #60a5fa; /* Azul mais suave */
  color: #1e40af; /* Azul escuro */
}
.card-cabecalho {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid var(--cor-borda-suave);
  transition: background-color 0.2s;
}
.card-teste.preenchido .card-cabecalho {
  border-bottom-color: #dbeafe;
}
.card-cabecalho:hover {
  background-color: #f1f5f9;
}
.card-teste.preenchido .card-cabecalho:hover {
  background-color: #dbeafe;
}
.card-titulo {
  font-weight: 600;
  text-align: center;
}
.icone-wrapper {
  position: relative;
}
.icone-check {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #22c55e;
  color: white;
  border-radius: 50%;
  padding: 2px;
}
.lista-marcas-status {
  list-style: none;
  margin: 0;
  padding: 1rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.lista-marcas-status li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icone-marca-preenchida {
  color: #22c55e;
}
.icone-marca-pendente {
  color: #94a3b8;
}
/* -------------------------- */
.secao-descricao {
  margin-top: 0;
}
.grid-testes {
  display: grid; /* MUDANÇA: Usando grid para melhor alinhamento */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.card-teste {
  background-color: #f8fafc;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex; /* Adicionado para controle interno */
  flex-direction: column; /* Adicionado para controle interno */
}
.aviso-info {
  text-align: center;
  padding: 2rem;
  margin-top: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  color: #475569;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.icone-girando {
  animation: spin 1.5s linear infinite;
}
</style>
