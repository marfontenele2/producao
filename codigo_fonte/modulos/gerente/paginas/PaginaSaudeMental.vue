<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Acompanhamento de Saúde Mental</h1>
    </header>

    <div class="conteudo-card card-filtros">
      <div class="campo">
        <label for="competencia">Competência</label>
        <input
          id="competencia"
          type="month"
          v-model="competenciaSelecionada"
          class="input-padrao"
        />
      </div>
      <div class="campo">
        <label for="equipe">Equipe</label>
        <select
          id="equipe"
          v-model="equipeSelecionada"
          class="input-padrao"
          :disabled="carregandoEquipes"
        >
          <option :value="null" disabled>
            {{ carregandoEquipes ? 'Carregando...' : 'Selecione uma equipe' }}
          </option>
          <option v-for="equipe in listaEquipes" :key="equipe.id" :value="equipe.id">
            {{ equipe.nome }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="equipeSelecionada" class="conteudo-card" style="margin-top: 1.5rem">
      <div class="cabecalho-tabela">
        <h2 class="secao-titulo">Pacientes da Equipe</h2>
        <button class="botao botao-primario" @click="abrirModalPaciente()">
          <UserPlus :size="18" /> Adicionar Paciente
        </button>
      </div>

      <div v-if="carregandoDados" class="aviso-info">Carregando dados da equipe...</div>
      <div v-else-if="pacientes.length === 0" class="aviso-info">
        Nenhum paciente cadastrado para esta equipe. Clique em "Adicionar Paciente" para começar.
      </div>
      <table v-else class="tabela-padrao tabela-saude-mental">
        <thead>
          <tr>
            <th>Nome do Paciente</th>
            <th>CNS</th>
            <th>Acompanhamento ({{ competenciaFormatada }})</th>
            <th class="coluna-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="paciente in pacientes" :key="paciente.id">
            <td>{{ paciente.nome }}</td>
            <td>{{ paciente.cns }}</td>
            <td>
              <select
                class="select-acompanhamento input-padrao"
                :value="acompanhamentosDaCompetencia[paciente.id] || 'Não Informado'"
                @change="salvarAcompanhamento(paciente.id, $event.target.value)"
              >
                <option v-for="opcao in opcoesAcompanhamento" :key="opcao" :value="opcao">
                  {{ opcao }}
                </option>
              </select>
            </td>
            <td class="coluna-acoes">
              <div class="acoes-tabela">
                <button
                  class="botao-acao"
                  @click="abrirModalPaciente(paciente)"
                  title="Editar dados cadastrais"
                >
                  <FilePenLine :size="16" />
                </button>
                <button
                  class="botao-acao excluir"
                  @click="removerPacienteDaEquipe(paciente)"
                  title="Remover paciente da lista"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modal.visivel" class="modal-backdrop" @click.self="fecharModal">
      <div class="modal-container">
        <header class="modal-cabecalho">
          <h2>{{ modal.modo === 'adicionar' ? 'Adicionar Novo Paciente' : 'Editar Paciente' }}</h2>
          <button class="botao-fechar" @click="fecharModal"><X :size="24" /></button>
        </header>
        <main class="modal-corpo">
          <form id="form-paciente" @submit.prevent="handleSalvarPaciente">
            <div class="campo">
              <label for="nome-paciente">Nome Completo</label>
              <input
                type="text"
                id="nome-paciente"
                v-model="pacienteEmEdicao.nome"
                class="input-padrao"
                required
              />
            </div>
            <div class="campo">
              <label for="cns-paciente">CNS</label>
              <input
                type="text"
                id="cns-paciente"
                v-model="pacienteEmEdicao.cns"
                class="input-padrao"
                required
              />
            </div>
            <div class="campo">
              <label for="dn-paciente">Data de Nascimento</label>
              <input
                type="date"
                id="dn-paciente"
                v-model="pacienteEmEdicao.dataNascimento"
                class="input-padrao"
                required
              />
            </div>
            <div class="campo">
              <label for="sexo-paciente">Sexo</label>
              <select
                id="sexo-paciente"
                v-model="pacienteEmEdicao.sexo"
                class="input-padrao"
                required
              >
                <option disabled value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
          </form>
        </main>
        <footer class="modal-rodape">
          <button class="botao botao-acao" @click="fecharModal">Cancelar</button>
          <button class="botao botao-primario" type="submit" form="form-paciente">
            <Save :size="18" /> Salvar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { servicoSaudeMental } from '../servicos/servicoSaudeMental'
import { UserPlus, FilePenLine, Trash2, Save, X } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregandoEquipes = ref(true)
const carregandoDados = ref(false)
const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const equipeSelecionada = ref(null)
const listaEquipes = ref([])
const pacientes = ref([])
const acompanhamentos = ref({})
const opcoesAcompanhamento = ['Não Informado', 'UBS', 'CAPS', 'Ambos']
const modal = reactive({ visivel: false, modo: 'adicionar' })
const pacienteEmEdicao = ref({})

let unsubscribe = null

onMounted(async () => {
  const ubsId = storeUsuario.usuario?.ubsId
  if (ubsId) {
    listaEquipes.value = await servicoEquipes.buscarEquipesPorUbs(ubsId)
  }
  carregandoEquipes.value = false
})

watch(equipeSelecionada, (novaEquipeId) => {
  if (unsubscribe) unsubscribe()
  if (novaEquipeId) {
    carregandoDados.value = true
    unsubscribe = servicoSaudeMental.monitorarDadosDaEquipe(novaEquipeId, (dados) => {
      pacientes.value = (dados.pacientes || []).sort((a, b) => a.nome.localeCompare(b.nome))
      // ===================================================================
      // === CORREÇÃO DO ERRO: Garante que 'acompanhamentos' seja sempre um objeto
      // ===================================================================
      acompanhamentos.value = dados.acompanhamentos || {}
      // ===================================================================
      carregandoDados.value = false
    })
  } else {
    pacientes.value = []
    acompanhamentos.value = {}
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const competenciaFormatada = computed(() => {
  if (!competenciaSelecionada.value) return ''
  const [ano, mes] = competenciaSelecionada.value.split('-')
  return `${mes}/${ano}`
})

const acompanhamentosDaCompetencia = computed(() => {
  return acompanhamentos.value[competenciaSelecionada.value] || {}
})

function abrirModalPaciente(paciente = null) {
  if (paciente) {
    modal.modo = 'editar'
    pacienteEmEdicao.value = { ...paciente }
  } else {
    modal.modo = 'adicionar'
    pacienteEmEdicao.value = { nome: '', cns: '', dataNascimento: '', sexo: '' }
  }
  modal.visivel = true
}

function fecharModal() {
  modal.visivel = false
}

async function handleSalvarPaciente() {
  try {
    if (modal.modo === 'adicionar') {
      await servicoSaudeMental.adicionarPaciente(equipeSelecionada.value, pacienteEmEdicao.value)
      storeNotificacoes.mostrarNotificacao({
        tipo: 'sucesso',
        mensagem: 'Paciente adicionado com sucesso!',
      })
    } else {
      await servicoSaudeMental.atualizarPaciente(equipeSelecionada.value, pacienteEmEdicao.value)
      storeNotificacoes.mostrarNotificacao({
        tipo: 'sucesso',
        mensagem: 'Paciente atualizado com sucesso!',
      })
    }
    fecharModal()
  } catch (error) {
    console.error('Erro ao salvar paciente:', error)
    storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao salvar paciente.' })
  }
}

async function removerPacienteDaEquipe(paciente) {
  if (confirm(`Tem certeza que deseja remover "${paciente.nome}" da lista permanentemente?`)) {
    try {
      await servicoSaudeMental.removerPaciente(equipeSelecionada.value, paciente)
      storeNotificacoes.mostrarNotificacao({ tipo: 'sucesso', mensagem: 'Paciente removido.' })
    } catch (error) {
      console.error('Erro ao remover paciente:', error)
      storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao remover paciente.' })
    }
  }
}

async function salvarAcompanhamento(pacienteId, status) {
  try {
    await servicoSaudeMental.salvarAcompanhamento({
      equipeId: equipeSelecionada.value,
      competencia: competenciaSelecionada.value,
      pacienteId: pacienteId,
      status: status,
    })
    storeNotificacoes.mostrarNotificacao({ tipo: 'sucesso', mensagem: 'Acompanhamento salvo!' })
  } catch (error) {
    console.error('Erro ao salvar acompanhamento:', error)
    storeNotificacoes.mostrarNotificacao({
      tipo: 'erro',
      mensagem: 'Falha ao salvar acompanhamento.',
    })
  }
}
</script>

<style scoped>
/* CORREÇÃO DE ESTILO: Adicionado padding e altura padrão para os inputs/selects */
.input-padrao {
  height: 42px;
  padding: 8px 12px;
  box-sizing: border-box;
}
.select-acompanhamento {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  width: 100%;
}
.cabecalho-tabela {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.secao-titulo {
  font-size: 1.25rem;
  margin: 0;
}
.aviso-info {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.tabela-saude-mental .coluna-acoes {
  width: 120px;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
}
.modal-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.modal-cabecalho h2 {
  margin: 0;
  font-size: 1.25rem;
}
.botao-fechar {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
}
.modal-corpo {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid var(--cor-borda-suave);
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
}
</style>
