<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciamento de Equipes</h1>
      <button class="botao botao-primario" @click="abrirFormulario()">
        <PlusCircle :size="18" />
        <span>Adicionar Equipe</span>
      </button>
    </header>

    <div class="conteudo-card">
      <div v-if="carregando">Carregando dados...</div>
      <div v-else>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Nome da Equipe</th>
              <th>Código INE</th>
              <th>UBS Vinculada</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="equipes.length === 0">
              <td colspan="4">Nenhuma equipe cadastrada.</td>
            </tr>
            <tr v-for="equipe in equipes" :key="equipe.id">
              <td>{{ equipe.nome }}</td>
              <td>{{ equipe.ine }}</td>
              <td>{{ getNomeUbs(equipe.ubsId) }}</td>
              <td>
                <div class="acoes-tabela">
                  <button class="botao-acao" @click="abrirFormulario(equipe)">Editar</button>
                  <button class="botao-acao excluir" @click="confirmarExclusao(equipe)">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <FormularioEquipe
      v-if="exibirFormulario"
      :equipeParaEditar="equipeSelecionada"
      :lista-ubs="listaUbs"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
  </div>
</template>

<script setup>
// O script permanece o mesmo da etapa anterior
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes.js'
import { servicoUbs } from '@/nucleo/servicos_comuns/servicoUbs.js'
import FormularioEquipe from '../componentes/FormularioEquipe.vue'
import { PlusCircle } from 'lucide-vue-next'

const equipes = ref([])
const listaUbs = ref([])
const carregando = ref(true)
const exibirFormulario = ref(false)
const equipeSelecionada = ref(null)

let unsubscribers = []

onMounted(() => {
  unsubscribers.push(
    servicoEquipes.monitorarEquipes((lista) => {
      equipes.value = lista
      carregando.value = false
    }),
  )
  unsubscribers.push(
    servicoUbs.monitorarUbs((lista) => {
      listaUbs.value = lista
    }),
  )
})

onUnmounted(() => {
  unsubscribers.forEach((unsub) => unsub())
})

const getNomeUbs = (ubsId) => {
  const ubs = listaUbs.value.find((u) => u.id === ubsId)
  return ubs ? ubs.nome : 'Não vinculada'
}

const abrirFormulario = (equipe = null) => {
  equipeSelecionada.value = equipe
  exibirFormulario.value = true
}

const fecharFormulario = () => {
  exibirFormulario.value = false
  equipeSelecionada.value = null
}

const handleSalvar = async (dadosEquipe) => {
  try {
    if (dadosEquipe.id) {
      await servicoEquipes.atualizarEquipe(dadosEquipe.id, dadosEquipe)
    } else {
      await servicoEquipes.adicionarEquipe(dadosEquipe)
    }
    fecharFormulario()
  } catch (error) {
    console.error('Erro ao salvar equipe:', error)
  }
}

const confirmarExclusao = async (equipe) => {
  if (window.confirm(`Deseja realmente excluir a equipe "${equipe.nome}"?`)) {
    try {
      await servicoEquipes.excluirEquipe(equipe.id)
    } catch (error) {
      console.error('Erro ao excluir equipe:', error)
    }
  }
}
</script>

<style scoped>
/* Estilos agora são globais */
</style>
