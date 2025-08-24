<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciamento de Usuários</h1>
      <button class="botao botao-primario" @click="abrirFormulario()">
        <PlusCircle :size="18" />
        <span>Adicionar Usuário</span>
      </button>
    </header>

    <div class="conteudo-card">
      <div v-if="carregando">Carregando usuários...</div>
      <div v-else>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>UBS</th>
              <th>Equipe</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usuarios.length === 0">
              <td colspan="6">Nenhum usuário cadastrado.</td>
            </tr>
            <tr v-for="usuario in usuarios" :key="usuario.id">
              <td>{{ usuario.nome }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.role }}</td>
              <td>{{ getNomeUbs(usuario.ubsId) }}</td>
              <td>{{ getNomeEquipe(usuario.equipeId) }}</td>
              <td>
                <div class="acoes-tabela">
                  <button class="botao-acao" @click="abrirFormulario(usuario)">Editar</button>
                  <button class="botao-acao excluir" @click="confirmarExclusao(usuario)">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <FormularioUsuario
      v-if="exibirFormulario"
      :usuarioParaEditar="usuarioSelecionado"
      :lista-ubs="listaUbs"
      @fechar="fecharFormulario"
      @salvar="handleSalvar"
    />
  </div>
</template>

<script setup>
// O script permanece o mesmo da etapa anterior
import { ref, onMounted, onUnmounted } from 'vue'
import { servicoUsuarios } from '@/nucleo/servicos_comuns/servicoUsuarios.js'
import { servicoUbs } from '@/nucleo/servicos_comuns/servicoUbs.js'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes.js'
import FormularioUsuario from '../componentes/FormularioUsuario.vue'
import { PlusCircle } from 'lucide-vue-next'

const usuarios = ref([])
const listaUbs = ref([])
const listaEquipes = ref([])
const carregando = ref(true)
const exibirFormulario = ref(false)
const usuarioSelecionado = ref(null)

let unsubscribers = []

onMounted(() => {
  unsubscribers.push(
    servicoUsuarios.monitorarUsuarios((lista) => {
      usuarios.value = lista
      carregando.value = false
    }),
  )
  unsubscribers.push(
    servicoUbs.monitorarUbs((lista) => {
      listaUbs.value = lista
    }),
  )
  unsubscribers.push(
    servicoEquipes.monitorarEquipes((lista) => {
      listaEquipes.value = lista
    }),
  )
})

onUnmounted(() => {
  unsubscribers.forEach((unsub) => unsub())
})

function getNomeUbs(ubsId) {
  if (!ubsId) return '--'
  return listaUbs.value.find((u) => u.id === ubsId)?.nome || 'Inválida'
}

function getNomeEquipe(equipeId) {
  if (!equipeId) return '--'
  return listaEquipes.value.find((e) => e.id === equipeId)?.nome || 'Inválida'
}

function abrirFormulario(usuario = null) {
  usuarioSelecionado.value = usuario
  exibirFormulario.value = true
}

function fecharFormulario() {
  exibirFormulario.value = false
  usuarioSelecionado.value = null
}

async function handleSalvar(dadosUsuario) {
  try {
    if (dadosUsuario.id) {
      const { id, ...updateData } = dadosUsuario
      await servicoUsuarios.atualizarUsuario(id, updateData)
    } else {
      await servicoUsuarios.criarNovoUsuario(dadosUsuario)
    }
    fecharFormulario()
  } catch (error) {
    console.error('Erro ao salvar usuário:', error)
  }
}

async function confirmarExclusao(usuario) {
  if (window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
    try {
      await servicoUsuarios.excluirUsuario(usuario.id)
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    }
  }
}
</script>

<style scoped>
/* O CSS específico desta página foi movido para o arquivo global, deixando este limpo */
</style>
