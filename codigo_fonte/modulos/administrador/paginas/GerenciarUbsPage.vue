<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gestão de Unidades Básicas de Saúde (UBS)</h1>
      <button class="botao botao-primario" @click="abrirFormulario()">
        <PlusCircle :size="18" />
        <span>Adicionar UBS</span>
      </button>
    </header>

    <div class="conteudo-card">
      <div v-if="carregando">Carregando UBS...</div>
      <table v-else class="tabela-padrao">
        <thead>
          <tr>
            <th>Nome da UBS</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="listaUbs.length === 0">
            <td colspan="2">Nenhuma UBS cadastrada.</td>
          </tr>
          <tr v-for="ubs in listaUbs" :key="ubs.id">
            <td>{{ ubs.nome }}</td>
            <td>
              <div class="acoes-tabela">
                <button class="botao-acao" @click="abrirFormulario(ubs)">Editar</button>
                <button class="botao-acao excluir" @click="confirmarExclusao(ubs)">Excluir</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <FormularioUbs
      v-if="exibirFormulario"
      :ubs-para-editar="ubsSelecionada"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoUbs } from '@/nucleo/servicos_comuns/servicoUbs.js'
import FormularioUbs from '../componentes/FormularioUbs.vue'
import { PlusCircle } from 'lucide-vue-next'

const listaUbs = ref([])
const carregando = ref(true)
const exibirFormulario = ref(false)
const ubsSelecionada = ref(null)

let unsubscribe = null

onMounted(() => {
  unsubscribe = servicoUbs.monitorarUbs((lista) => {
    listaUbs.value = lista
    carregando.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const abrirFormulario = (ubs = null) => {
  ubsSelecionada.value = ubs
  exibirFormulario.value = true
}

const fecharFormulario = () => {
  exibirFormulario.value = false
  ubsSelecionada.value = null
}

const handleSalvar = async (dadosUbs) => {
  try {
    if (dadosUbs.id) {
      // Edição
      await servicoUbs.atualizarUbs(dadosUbs.id, { nome: dadosUbs.nome })
    } else {
      // Criação
      await servicoUbs.adicionarUbs({ nome: dadosUbs.nome })
    }
    fecharFormulario()
  } catch (error) {
    console.error('Erro ao salvar UBS:', error)
  }
}

const confirmarExclusao = async (ubs) => {
  if (window.confirm(`Tem certeza que deseja excluir a UBS "${ubs.nome}"?`)) {
    try {
      await servicoUbs.excluirUbs(ubs.id)
    } catch (error) {
      console.error('Erro ao excluir UBS:', error)
    }
  }
}
</script>

<style scoped>
/* Nenhum estilo específico é necessário aqui, pois usamos as classes globais */
</style>
