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

    <div v-if="equipeSelecionada">
      <div
        class="conteudo-card card-status-agenda"
        :class="{ agendado: agendaDoMesSeguinte && agendaDoMesSeguinte.data }"
      >
        <div class="info-status">
          <h4>Agenda para {{ proximaCompetenciaFormatada }}</h4>
          <div v-if="agendaDoMesSeguinte && agendaDoMesSeguinte.data">
            <p>
              ✅ Agendado para: <strong>{{ formatarData(agendaDoMesSeguinte.data) }}</strong>
            </p>
            <p>Profissionais: {{ agendaDoMesSeguinte.profissionaisNomes.join(', ') }}</p>
          </div>
          <p v-else>⚠️ Agendamento para o próximo mês está pendente.</p>
        </div>
        <button class="botao" @click="abrirModalAgenda">
          {{ agendaDoMesSeguinte ? 'Editar Agenda' : 'Agendar Agora' }}
        </button>
      </div>

      <div class="conteudo-card" style="margin-top: 1.5rem">
        <div class="cabecalho-tabela">
          <h2 class="secao-titulo">Pacientes da Equipe</h2>
          <button class="botao botao-primario" @click="abrirModalPaciente()">
            <UserPlus :size="18" /> Adicionar Paciente
          </button>
        </div>
        <div v-if="carregandoDados" class="aviso-info">Carregando dados da equipe...</div>
        <div v-else-if="pacientes.length === 0" class="aviso-info">
          Nenhum paciente cadastrado para esta equipe.
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
                  :value="getAcompanhamentoPaciente(paciente.id)"
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
                    title="Editar dados"
                  >
                    <FilePenLine :size="16" />
                  </button>
                  <button
                    class="botao-acao excluir"
                    @click="removerPacienteDaEquipe(paciente)"
                    title="Remover paciente"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

    <ModalAgendamentoSaudeMental
      v-if="modalAgenda.visivel"
      :profissionais-da-equipe="profissionaisDaEquipe"
      :competencia-para-agendar="proximaCompetencia"
      :agenda-existente="agendaDoMesSeguinte"
      @fechar="fecharModalAgenda"
      @salvar="onAgendaSalva"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes'
import { servicoSaudeMental } from '../servicos/servicoSaudeMental'
import { ServicoSCNES } from '@/modulos/gerente/servicos/ServicoSCNES'
import { addMonths, format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { UserPlus, FilePenLine, Trash2, Save, X } from 'lucide-vue-next'
import ModalAgendamentoSaudeMental from '../componentes/ModalAgendamentoSaudeMental.vue'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()
const carregandoEquipes = ref(true)
const carregandoDados = ref(false)
const competenciaSelecionada = ref(new Date().toISOString().slice(0, 7))
const equipeSelecionada = ref(null)
const listaEquipes = ref([])
const dadosDaEquipe = ref({ pacientes: [], acompanhamentos: {}, agendaSaudeMental: {} })
const opcoesAcompanhamento = [
  'Sem Acompanhamento',
  'UBS',
  'CAPS',
  'Ambos',
  'Rede Privada',
  'Outros',
]
const modal = reactive({ visivel: false, modo: 'adicionar' })
const pacienteEmEdicao = ref({})
const profissionaisDaEquipe = ref([])
const modalAgenda = reactive({ visivel: false })
let unsubscribe = null

const pacientes = computed(() =>
  (dadosDaEquipe.value.pacientes || []).sort((a, b) => a.nome.localeCompare(b.nome)),
)
const acompanhamentos = computed(() => dadosDaEquipe.value.acompanhamentos || {})

const competenciaFormatada = computed(() => {
  if (!competenciaSelecionada.value) return ''
  const [ano, mes] = competenciaSelecionada.value.split('-')
  return `${mes}/${ano}`
})

const proximaCompetencia = computed(() => {
  if (!competenciaSelecionada.value) return ''
  const [ano, mes] = competenciaSelecionada.value.split('-').map(Number)
  const dataAtual = new Date(ano, mes - 1, 15)
  return format(addMonths(dataAtual, 1), 'yyyy-MM')
})

const proximaCompetenciaFormatada = computed(() => {
  if (!proximaCompetencia.value) return ''
  const [ano, mes] = proximaCompetencia.value.split('-')
  return `${mes}/${ano}`
})

const formatarData = (data) => {
  if (!data) return 'Data não definida'
  return format(new Date(`${data}T12:00:00`), 'dd/MM/yyyy')
}

const agendaDoMesSeguinte = computed(
  () => dadosDaEquipe.value.agendaSaudeMental?.[proximaCompetencia.value] || null,
)

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
    carregarDadosDaEquipe(novaEquipeId)
  } else {
    dadosDaEquipe.value = { pacientes: [], acompanhamentos: {}, agendaSaudeMental: {} }
    profissionaisDaEquipe.value = []
  }
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function carregarDadosDaEquipe(equipeId) {
  carregandoDados.value = true
  if (unsubscribe) unsubscribe()
  const [profissionais] = await Promise.all([
    ServicoSCNES.buscarProfissionaisMaisRecentes(equipeId),
    new Promise((resolve) => {
      unsubscribe = servicoSaudeMental.monitorarDadosDaEquipe(equipeId, (dados) => {
        dadosDaEquipe.value = dados
        resolve()
      })
    }),
  ])
  profissionaisDaEquipe.value = profissionais
  carregandoDados.value = false
}

function getAcompanhamentoPaciente(pacienteId) {
  const acompanhamentoAtual = acompanhamentos.value[competenciaSelecionada.value]?.[pacienteId]
  const validos = ['UBS', 'CAPS', 'Ambos', 'Rede Privada', 'Outros']
  if (acompanhamentoAtual && validos.includes(acompanhamentoAtual)) return acompanhamentoAtual
  return 'Sem Acompanhamento'
}

function abrirModalPaciente(paciente = null) {
  pacienteEmEdicao.value = paciente
    ? { ...paciente }
    : { nome: '', cns: '', dataNascimento: '', sexo: '' }
  modal.modo = paciente ? 'editar' : 'adicionar'
  modal.visivel = true
}

function fecharModal() {
  modal.visivel = false
}

async function handleSalvarPaciente() {
  // ... lógica de salvar paciente
}

async function removerPacienteDaEquipe(paciente) {
  // ... lógica de remover paciente
}

async function salvarAcompanhamento(pacienteId, status) {
  // ... lógica de salvar acompanhamento
}

function abrirModalAgenda() {
  modalAgenda.visivel = true
}

function fecharModalAgenda() {
  modalAgenda.visivel = false
}
// Dentro do seu <script setup>, encontre a função onAgendaSalva e a substitua por esta:

async function onAgendaSalva(dadosDoModal) {
  // O modal já nos entrega os dados prontos e limpos.
  // Apenas pegamos o payload e passamos para o serviço.
  const { data, profissionaisIds, profissionaisNomes } = dadosDoModal

  const dadosParaSalvar = {
    data: data || null,
    profissionaisIds: profissionaisIds, // IDs reais, já filtrados pelo modal
    profissionaisNomes: profissionaisNomes, // Nomes de todos os selecionados
  }

  console.log('[DETETIVE FINAL] Objeto enviado para o serviço:', JSON.stringify(dadosParaSalvar))

  try {
    await servicoSaudeMental.salvarAgendaDoMes({
      equipeId: equipeSelecionada.value,
      competencia: proximaCompetencia.value,
      dadosAgenda: dadosParaSalvar,
    })
    storeNotificacoes.mostrarNotificacao({ tipo: 'sucesso', mensagem: 'Agenda salva com sucesso!' })
    fecharModalAgenda()
  } catch (error) {
    console.error('Erro detalhado ao salvar agenda:', error)
    storeNotificacoes.mostrarNotificacao({ tipo: 'erro', mensagem: 'Falha ao salvar agenda.' })
  }
}
</script>

<style scoped>
/* CSS da página principal permanece o mesmo */
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
.card-status-agenda {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fffbeb;
  border-left: 5px solid #f59e0b;
  padding: 1.5rem;
}
.card-status-agenda.agendado {
  background-color: #f0fdf4;
  border-left-color: #22c55e;
}
.info-status h4 {
  margin: 0 0 0.5rem 0;
}
.info-status p {
  margin: 0;
}
</style>
