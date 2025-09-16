<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Gerenciar Profissionais (SCNES)</h1>
    </header>

    <div class="conteudo-card card-filtros" style="margin-bottom: 2rem">
      <div class="campo">
        <label for="competencia">Competência (Mês/Ano)</label>
        <input
          id="competencia"
          :type="competenciaInputType"
          class="input-padrao"
          placeholder="Selecione o mês..."
          v-model="competenciaSelecionada"
          @focus="competenciaInputType = 'month'"
          @blur="ajustarTipoInputCompetencia"
        />
      </div>
      <div class="campo">
        <label for="equipe">Equipe</label>
        <select id="equipe" v-model="equipeSelecionada" class="input-padrao">
          <option disabled value="">
            {{ carregandoEquipes ? 'Carregando...' : 'Selecione uma equipe' }}
          </option>
          <option v-for="equipe in equipes" :key="equipe.id" :value="equipe.id">
            {{ equipe.nome }}
          </option>
        </select>
      </div>
      <button
        @click="buscarDadosSCNES"
        class="botao botao-primario"
        :disabled="!competenciaSelecionada || !equipeSelecionada || carregando"
      >
        <LoaderCircle :size="18" v-if="carregando" class="animate-spin" />
        <span>{{ carregando ? 'Buscando...' : 'Buscar Dados' }}</span>
      </button>
    </div>

    <section class="conteudo-card" v-if="dadosCarregados">
      <div class="info-preenchimento" v-if="dadosVieramDoMesAnterior">
        <Info :size="18" />
        <span>
          Não foram encontrados dados para a competência selecionada. A lista abaixo foi preenchida
          com base nos dados do mês anterior para facilitar o seu trabalho.
        </span>
      </div>

      <div class="cabecalho-tabela">
        <h2>Profissionais da Competência: {{ competenciaFormatada }}</h2>
        <button @click="abrirModal('adicionar')" class="botao botao-primario">
          <PlusCircle :size="18" />
          <span>Adicionar Profissional</span>
        </button>
      </div>

      <table class="tabela-padrao">
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>CPF</th>
            <th>Cargo</th>
            <th style="width: 120px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="profissionais.length === 0">
            <td colspan="4" class="sem-registros">Nenhum profissional cadastrado.</td>
          </tr>
          <tr v-for="profissional in profissionais" :key="profissional.id">
            <td>{{ profissional.nome }}</td>
            <td>{{ profissional.cpf }}</td>
            <td>{{ profissional.cargo }}</td>
            <td>
              <div class="acoes-tabela">
                <button @click="abrirModal('editar', profissional)" class="botao-acao">
                  <Pencil :size="16" />
                </button>
                <button @click="removerProfissional(profissional.id)" class="botao-acao excluir">
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <footer class="rodape-card">
        <button @click="finalizarMes" class="botao botao-primario" :disabled="salvando">
          <LoaderCircle :size="18" v-if="salvando" class="animate-spin" />
          <span>{{ salvando ? 'Salvando...' : 'Salvar e Finalizar Mês' }}</span>
        </button>
      </footer>
    </section>

    <div v-if="modal.visivel" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-container">
        <header class="modal-cabecalho">
          <h3>
            {{ modal.modo === 'adicionar' ? 'Adicionar Novo Profissional' : 'Editar Profissional' }}
          </h3>
          <button @click="fecharModal" class="modal-botao-fechar">&times;</button>
        </header>
        <div class="modal-corpo">
          <div class="form-grupo">
            <label for="form-nome">Nome Completo</label>
            <input
              id="form-nome"
              type="text"
              v-model="formProfissional.nome"
              class="input-padrao uppercase-input"
            />
          </div>
          <div class="form-grupo">
            <label for="form-cpf">CPF</label>
            <input
              id="form-cpf"
              type="text"
              v-model="formProfissional.cpf"
              @input="aplicarMascaraCPF"
              class="input-padrao"
              maxlength="14"
              placeholder="000.000.000-00"
            />
          </div>
          <div class="form-grupo">
            <label for="form-nasc">Data de Nascimento</label>
            <input
              id="form-nasc"
              type="date"
              v-model="formProfissional.dataNascimento"
              class="input-padrao"
            />
          </div>
          <div class="form-grupo">
            <label for="form-cns">CNS (Cartão Nacional de Saúde)</label>
            <input
              id="form-cns"
              type="text"
              v-model="formProfissional.cns"
              @input="aplicarMascaraCNS"
              class="input-padrao"
              maxlength="18"
              placeholder="000 0000 0000 0000"
            />
          </div>
          <div class="form-grupo">
            <label for="form-cargo">Cargo</label>
            <select id="form-cargo" v-model="formProfissional.cargo" class="input-padrao">
              <option disabled value="">Selecione o cargo</option>
              <option v-for="cargo in cargosSaude" :key="cargo" :value="cargo">{{ cargo }}</option>
            </select>
          </div>
        </div>
        <footer class="modal-rodape">
          <button @click="fecharModal" class="botao botao-acao">Cancelar</button>
          <button @click="salvarProfissional" class="botao botao-primario">Salvar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { LoaderCircle, PlusCircle, Pencil, Trash2, Info } from 'lucide-vue-next'

// Serviços
import {
  carregarProfissionais,
  salvarProfissionais,
} from '@/modulos/gerente/servicos/ServicoSCNES.js'
import { cargosSaude } from '@/nucleo/utils/cargosSaude.js'
import { servicoEquipes } from '@/nucleo/servicos_comuns/servicoEquipes.js'

const storeUsuario = useStoreUsuario()
const notificacaoStore = useStoreNotificacoes()

// --- ESTADO REATIVO ---
const competenciaSelecionada = ref('')
const competenciaInputType = ref('text')
const equipeSelecionada = ref('')
const equipes = ref([])
const profissionais = ref([])
const carregandoEquipes = ref(true)
const carregando = ref(false)
const salvando = ref(false)
const dadosCarregados = ref(false)
const dadosVieramDoMesAnterior = ref(false)

const modal = reactive({
  visivel: false,
  modo: 'adicionar',
  idEmEdicao: null,
})

const formProfissional = reactive({
  id: '',
  nome: '',
  cpf: '',
  dataNascimento: '',
  cns: '',
  cargo: '',
})

// --- HOOKS E WATCHERS ---
onMounted(async () => {
  const ubsId = storeUsuario.usuario?.ubsId
  if (ubsId) {
    equipes.value = await servicoEquipes.buscarEquipesPorUbs(ubsId)
  } else {
    notificacaoStore.mostrarNotificacao({
      tipo: 'erro',
      mensagem: 'ID da Unidade de Saúde não encontrado para o seu usuário.',
    })
  }
  carregandoEquipes.value = false
})

watch([competenciaSelecionada, equipeSelecionada], () => {
  dadosCarregados.value = false
})

// --- PROPRIEDADES COMPUTADAS ---
const competenciaFormatada = computed(() => {
  if (!competenciaSelecionada.value) return ''
  const [ano, mes] = competenciaSelecionada.value.split('-')
  return `${mes}/${ano}`
})

// --- FUNÇÕES ---
function ajustarTipoInputCompetencia() {
  if (!competenciaSelecionada.value) {
    competenciaInputType.value = 'text'
  }
}

function getCompetenciaAnterior(competencia) {
  const [ano, mes] = competencia.split('-').map(Number)
  const data = new Date(ano, mes - 1, 1)
  data.setMonth(data.getMonth() - 1)
  const anoAnterior = data.getFullYear()
  const mesAnterior = String(data.getMonth() + 1).padStart(2, '0')
  return `${anoAnterior}-${mesAnterior}`
}

async function buscarDadosSCNES() {
  carregando.value = true
  dadosCarregados.value = false
  dadosVieramDoMesAnterior.value = false

  let dadosAtuais = await carregarProfissionais(
    competenciaSelecionada.value,
    equipeSelecionada.value,
  )

  if (dadosAtuais.length > 0) {
    profissionais.value = dadosAtuais
  } else {
    const competenciaAnterior = getCompetenciaAnterior(competenciaSelecionada.value)
    notificacaoStore.mostrarNotificacao({
      tipo: 'info',
      mensagem: `Nenhum dado encontrado. Buscando dados de ${competenciaAnterior}...`,
    })

    let dadosAnteriores = await carregarProfissionais(competenciaAnterior, equipeSelecionada.value)

    profissionais.value = dadosAnteriores.map((p) => {
      const { id, ...resto } = p
      return resto
    })

    if (dadosAnteriores.length > 0) {
      dadosVieramDoMesAnterior.value = true
    }
  }

  dadosCarregados.value = true
  carregando.value = false
}

function aplicarMascaraCPF() {
  let valor = formProfissional.cpf.replace(/\D/g, '')
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  formProfissional.cpf = valor
}

function aplicarMascaraCNS() {
  let valor = formProfissional.cns.replace(/\D/g, '')
  valor = valor.replace(/(\d{3})(\d)/, '$1 $2')
  valor = valor.replace(/(\d{4})(\d)/, '$1 $2')
  valor = valor.replace(/(\d{4})(\d)/, '$1 $2')
  formProfissional.cns = valor
}

function resetarFormulario() {
  Object.assign(formProfissional, {
    id: '',
    nome: '',
    cpf: '',
    dataNascimento: '',
    cns: '',
    cargo: '',
  })
  modal.idEmEdicao = null
}

function abrirModal(modo, profissional = null) {
  modal.modo = modo
  if (modo === 'editar' && profissional) {
    Object.assign(formProfissional, profissional)
    modal.idEmEdicao = profissional.id
  } else {
    resetarFormulario()
  }
  modal.visivel = true
}

function fecharModal() {
  modal.visivel = false
  resetarFormulario()
}

function salvarProfissional() {
  const campos = ['nome', 'cpf', 'dataNascimento', 'cns', 'cargo']
  for (const campo of campos) {
    if (
      !formProfissional[campo] ||
      (typeof formProfissional[campo] === 'string' && !formProfissional[campo].trim())
    ) {
      const nomeAmigavel = campo
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
      notificacaoStore.mostrarNotificacao({
        tipo: 'alerta',
        mensagem: `O campo "${nomeAmigavel}" é obrigatório.`,
      })
      return
    }
  }

  const cpfNumeros = formProfissional.cpf.replace(/\D/g, '')
  if (cpfNumeros.length !== 11) {
    notificacaoStore.mostrarNotificacao({
      tipo: 'alerta',
      mensagem: 'O CPF deve conter 11 dígitos.',
    })
    return
  }
  const cnsNumeros = formProfissional.cns.replace(/\D/g, '')
  if (cnsNumeros.length !== 15) {
    notificacaoStore.mostrarNotificacao({
      tipo: 'alerta',
      mensagem: 'O CNS deve conter 15 dígitos.',
    })
    return
  }

  const dadosParaSalvar = {
    ...formProfissional,
    nome: formProfissional.nome.toUpperCase(),
  }

  if (modal.modo === 'adicionar') {
    profissionais.value.push({ ...dadosParaSalvar, id: uuidv4() })
  } else {
    const index = profissionais.value.findIndex((p) => p.id === modal.idEmEdicao)
    if (index !== -1) {
      profissionais.value[index] = { ...dadosParaSalvar }
    }
  }
  fecharModal()
}

function removerProfissional(id) {
  if (confirm('Tem certeza que deseja remover este profissional da lista?')) {
    profissionais.value = profissionais.value.filter((p) => p.id !== id)
  }
}

async function finalizarMes() {
  salvando.value = true
  const sucesso = await salvarProfissionais(
    competenciaSelecionada.value,
    equipeSelecionada.value,
    profissionais.value,
  )

  if (sucesso) {
    notificacaoStore.mostrarNotificacao({
      tipo: 'sucesso',
      mensagem: 'Lista de profissionais salva com sucesso!',
    })
  } else {
    notificacaoStore.mostrarNotificacao({
      tipo: 'erro',
      mensagem: 'Falha ao salvar a lista de profissionais.',
    })
  }
  salvando.value = false
}
</script>

<style scoped>
.uppercase-input {
  text-transform: uppercase;
}
.info-preenchimento {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #e0f2fe; /* Azul claro */
  border: 1px solid #7dd3fc; /* Azul médio */
  color: #0c4a6e; /* Azul escuro */
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.input-padrao,
.card-filtros select,
.card-filtros input {
  height: 42px;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  box-sizing: border-box;
}
.sem-registros {
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
}
.cabecalho-tabela {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.cabecalho-tabela h2 {
  margin: 0;
  font-size: 1.25rem;
}
.rodape-card {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--cor-borda-suave);
  display: flex;
  justify-content: flex-end;
}
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}
.modal-cabecalho {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--cor-borda-suave);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-cabecalho h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1e2b3b;
}
.modal-botao-fechar {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: #64748b;
}
.modal-corpo {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-grupo label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #334155;
}
.modal-corpo .input-padrao {
  width: 100%;
}
.modal-rodape {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--cor-borda-suave);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: #f8fafc;
  border-radius: 0 0 8px 8px;
}
</style>
