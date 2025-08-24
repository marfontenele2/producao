<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Educação Permanente</h1>
    </header>

    <div class="conteudo-card">
      <div class="card-filtros">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label>
          <input type="month" id="competencia" v-model="competencia" @change="carregarDados" />
        </div>
        <button
          class="botao botao-primario"
          @click="salvar"
          :disabled="salvando || !competencia || registros.length === 0"
        >
          <Save :size="18" /> {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card secao-formulario">
      <p style="text-align: center">Carregando...</p>
    </div>

    <form v-if="!carregando && competencia" @submit.prevent="salvar">
      <div class="conteudo-card secao-formulario">
        <div class="cabecalho-tabela">
          <h3 class="titulo-secao">Registros de Atividades</h3>
          <button type="button" class="botao botao-acao" @click="adicionarAtividade">
            <PlusCircle :size="16" /> Adicionar Atividade
          </button>
        </div>

        <div class="tabela-container">
          <table class="tabela-padrao tabela-educacao">
            <thead>
              <tr>
                <th>Data</th>
                <th>Local</th>
                <th>Palestrante</th>
                <th>Público Alvo</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="registros.length === 0">
                <td colspan="5" class="sem-registros">Nenhuma atividade registrada.</td>
              </tr>
              <template v-for="(registro, index) in registros" :key="registro.id">
                <tr>
                  <td><input type="date" v-model="registro.data" /></td>
                  <td><input type="text" v-model="registro.local" /></td>
                  <td><input type="text" v-model="registro.palestrante" /></td>
                  <td><input type="text" v-model="registro.publicoAlvo" /></td>
                  <td>
                    <button
                      type="button"
                      class="botao-acao excluir"
                      @click="removerAtividade(index)"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </td>
                </tr>
                <tr class="linha-detalhes">
                  <td colspan="5">
                    <div class="grid-detalhes">
                      <div class="campo span-12">
                        <label>Temas:</label><textarea v-model="registro.temas" rows="2"></textarea>
                      </div>
                      <div class="campo span-6">
                        <label>Objetivos:</label
                        ><textarea v-model="registro.objetivos" rows="4"></textarea>
                      </div>
                      <div class="campo span-6">
                        <label>Conteúdo:</label
                        ><textarea v-model="registro.conteudo" rows="4"></textarea>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoEducacaoPermanente } from '@/modulos/enfermeiro/servicos/ServicoEducacaoPermanente.js'
import { Save, PlusCircle, Trash2 } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const competencia = ref('')
const carregando = ref(false)
const salvando = ref(false)
const registros = ref([])

function criarAtividadeVazia() {
  return {
    id: Date.now() + Math.random(),
    ubs: storeUsuario.usuario?.nomeUbs || '',
    local: '',
    data: '',
    horario: '',
    palestrante: storeUsuario.usuario?.nome || '',
    publicoAlvo: '',
    temas: '',
    objetivos: '',
    conteudo: '',
  }
}

async function carregarDados() {
  if (!competencia.value) return
  carregando.value = true
  registros.value = [] // Limpa antes de carregar
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoEducacaoPermanente.buscarDados(competencia.value, equipeId)
    // A verificação `dados.map` agora é segura porque o serviço sempre retorna um array
    registros.value = dados.map((d) => ({ ...criarAtividadeVazia(), ...d }))
  } catch (error) {
    console.error(error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao carregar dados existentes.',
      tipo: 'erro',
    })
  } finally {
    carregando.value = false
  }
}

function adicionarAtividade() {
  registros.value.push(criarAtividadeVazia())
}

function removerAtividade(index) {
  registros.value.splice(index, 1)
}

function validarRegistros() {
  for (const [index, registro] of registros.value.entries()) {
    const camposObrigatorios = [
      'data',
      'local',
      'palestrante',
      'publicoAlvo',
      'temas',
      'objetivos',
      'conteudo',
    ]
    for (const campo of camposObrigatorios) {
      if (!registro[campo] || (typeof registro[campo] === 'string' && !registro[campo].trim())) {
        const nomeCampo = campo.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
        storeNotificacoes.mostrarNotificacao({
          mensagem: `O campo "${nomeCampo}" é obrigatório na atividade ${index + 1}.`,
          tipo: 'alerta',
        })
        return false
      }
    }
  }
  return true
}

async function salvar() {
  if (!validarRegistros()) return
  salvando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const usuarioId = storeUsuario.usuario.uid
    await servicoEducacaoPermanente.salvarDados(
      competencia.value,
      equipeId,
      usuarioId,
      registros.value,
    )
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Registros salvos com sucesso!',
      tipo: 'sucesso',
    })
    registros.value = []
    competencia.value = ''
  } catch (error) {
    console.error(error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao salvar os registros.',
      tipo: 'erro',
    })
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.secao-formulario {
  margin-top: 1.5rem;
}
.cabecalho-tabela {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.titulo-secao {
  margin: 0;
  font-size: 1.2rem;
}
.tabela-container {
  overflow-x: auto;
}
.tabela-educacao input,
.tabela-educacao textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  font-size: 0.9rem;
}
.linha-detalhes td {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
}
.grid-detalhes {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.8rem;
  color: #475569;
}
.span-6 {
  grid-column: span 6;
}
.span-12 {
  grid-column: span 12;
}
.sem-registros {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
</style>
