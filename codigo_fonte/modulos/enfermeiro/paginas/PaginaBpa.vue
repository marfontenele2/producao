<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho"><h1>BPA - Testes Rápidos (MODO DIAGNÓSTICO ATIVO)</h1></header>
    <div class="conteudo-card">
      <div class="card-filtros">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label>
          <input type="month" id="competencia" v-model="competencia" @change="buscarDados" />
        </div>
        <button
          class="botao botao-primario"
          @click="salvarDados"
          :disabled="salvando || !competencia || !registros || registros.length === 0"
        >
          <Save :size="18" /> {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card secao-formulario">
      <p style="text-align: center">Carregando...</p>
    </div>

    <form v-if="!carregando && competencia" @submit.prevent="salvarDados">
      <div class="conteudo-card secao-formulario">
        <div class="cabecalho-tabela">
          <h3 class="titulo-secao">Registros de Atendimento</h3>
          <button type="button" class="botao botao-acao" @click="adicionarLinha">
            <PlusCircle :size="16" /> Adicionar Paciente
          </button>
        </div>
        <div class="tabela-container">
          <table class="tabela-padrao tabela-bpa">
            <thead>
              <tr>
                <th class="coluna-nome">Nome do Paciente *</th>
                <th class="coluna-cns">CNS do Paciente *</th>
                <th class="coluna-data-nasc">Data de Nasc. *</th>
                <th class="coluna-sexo">Sexo *</th>
                <th class="coluna-raca">Raça/Cor *</th>
                <th class="coluna-gestante">Gestante? *</th>
                <th class="coluna-exame">Tipo de Exame *</th>
                <th class="coluna-codigo">Código</th>
                <th class="coluna-data-atend">Data Atend. *</th>
                <th class="coluna-acao">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!registros || registros.length === 0">
                <td colspan="10" class="sem-registros">Nenhum atendimento registrado.</td>
              </tr>
              <tr v-for="(reg, index) in registros" :key="reg.id">
                <td><input type="text" v-model.trim="reg.nomePaciente" /></td>
                <td>
                  <input
                    type="text"
                    v-model="reg.cnsPaciente"
                    maxlength="15"
                    @input="formatarCNS(index)"
                    placeholder="Apenas números"
                  />
                </td>
                <td><input type="date" v-model="reg.dataNascimento" /></td>
                <td>
                  <select v-model="reg.sexo">
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </td>
                <td>
                  <select v-model="reg.racaCor">
                    <option value="">Selecione...</option>
                    <option value="Parda">Parda</option>
                    <option value="Branca">Branca</option>
                    <option value="Preta">Preta</option>
                    <option value="Amarela">Amarela</option>
                    <option value="Indígena">Indígena</option>
                    <option value="Sem Informação">Sem Informação</option>
                  </select>
                </td>
                <td>
                  <select v-model="reg.isGestante">
                    <option :value="false">Não</option>
                    <option :value="true">Sim</option>
                  </select>
                </td>
                <td>
                  <select v-model="reg.tipoExame">
                    <option value="">Selecione...</option>
                    <option value="hiv">HIV</option>
                    <option value="sifilis">Sífilis</option>
                    <option value="hepB">Hepatite B</option>
                    <option value="hepC">Hepatite C</option>
                  </select>
                </td>
                <td>
                  <span class="codigo-proc">{{ obterCodigoProcedimento(reg) }}</span>
                </td>
                <td><input type="date" v-model="reg.dataAtendimento" /></td>
                <td>
                  <button type="button" class="botao-acao excluir" @click="removerLinha(index)">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </form>

    <div class="conteudo-card area-diagnostico" v-if="competencia">
      <h3>Visualizador de Dados em Tempo Real</h3>
      <pre>{{ registros }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoBpa } from '@/modulos/enfermeiro/servicos/servicoBpa.js'
import { Save, PlusCircle, Trash2 } from 'lucide-vue-next'

console.log('--- SCRIPT DO COMPONENTE BPA CARREGADO (COM DIAGNÓSTICO) ---')

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()
const competencia = ref('')
const registros = ref([])
const carregando = ref(false)
const salvando = ref(false)

const mapaCodigos = {
  hiv: { gestante: '02.02.05.003-9', naoGestante: '02.02.05.004-7' },
  sifilis: { gestante: '02.02.05.005-5', naoGestante: '02.02.05.006-3' },
  hepB: { gestante: '02.02.05.007-1', naoGestante: '02.02.05.008-0' },
  hepC: { gestante: '02.02.05.009-8', naoGestante: '02.02.05.010-1' },
}

const criarModeloDeDadosInicial = () => ({
  id: Date.now() + Math.random(),
  nomePaciente: '',
  cnsPaciente: '',
  dataNascimento: '',
  sexo: '',
  racaCor: '',
  isGestante: false,
  tipoExame: '',
  dataAtendimento: '',
})

function formatarCNS(index) {
  const reg = registros.value[index]
  if (reg) reg.cnsPaciente = reg.cnsPaciente.replace(/\D/g, '')
}

function obterCodigoProcedimento(registro) {
  if (!registro.tipoExame) return ''
  const tipo = registro.isGestante ? 'gestante' : 'naoGestante'
  return mapaCodigos[registro.tipoExame][tipo]
}

function adicionarLinha() {
  registros.value.push(criarModeloDeDadosInicial())
}

function removerLinha(index) {
  registros.value.splice(index, 1)
}

async function buscarDados() {
  if (!competencia.value) {
    registros.value = []
    return
  }
  carregando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dadosDoBanco = await servicoBpa.buscarDados(competencia.value, equipeId)
    console.log('[BPA DEBUG] Dados brutos do Firebase:', JSON.parse(JSON.stringify(dadosDoBanco)))
    registros.value = dadosDoBanco.map((d) => ({ ...criarModeloDeDadosInicial(), ...d }))
    console.log('[BPA DEBUG] Dados após carregar:', JSON.parse(JSON.stringify(registros.value)))
  } catch (error) {
    storeNotificacoes.mostrarNotificacao('Erro ao buscar registros.', 'erro')
  } finally {
    carregando.value = false
  }
}

function validarRegistros() {
  for (const [index, reg] of registros.value.entries()) {
    const linha = index + 1
    if (!reg.nomePaciente.trim()) {
      storeNotificacoes.mostrarNotificacao(
        `"Nome do Paciente" é obrigatório na linha ${linha}.`,
        'alerta',
      )
      return false
    }
    if (!reg.cnsPaciente || reg.cnsPaciente.length !== 15) {
      storeNotificacoes.mostrarNotificacao(
        `"CNS do Paciente" deve ter 15 números na linha ${linha}.`,
        'alerta',
      )
      return false
    }
    if (!reg.dataNascimento) {
      storeNotificacoes.mostrarNotificacao(
        `"Data de Nasc." é obrigatório na linha ${linha}.`,
        'alerta',
      )
      return false
    }
    if (!reg.sexo) {
      storeNotificacoes.mostrarNotificacao(`"Sexo" é obrigatório na linha ${linha}.`, 'alerta')
      return false
    }
    if (!reg.racaCor) {
      storeNotificacoes.mostrarNotificacao(`"Raça/Cor" é obrigatório na linha ${linha}.`, 'alerta')
      return false
    }
    if (reg.isGestante === null || reg.isGestante === undefined) {
      storeNotificacoes.mostrarNotificacao(`"Gestante?" é obrigatório na linha ${linha}.`, 'alerta')
      return false
    }
    if (!reg.tipoExame) {
      storeNotificacoes.mostrarNotificacao(
        `"Tipo de Exame" é obrigatório na linha ${linha}.`,
        'alerta',
      )
      return false
    }
    if (!reg.dataAtendimento) {
      storeNotificacoes.mostrarNotificacao(
        `"Data do Atendimento" é obrigatório na linha ${linha}.`,
        'alerta',
      )
      return false
    }
  }
  return true
}

async function salvarDados() {
  if (!validarRegistros()) return
  salvando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const usuarioId = storeUsuario.usuario.uid
    const dadosParaSalvar = JSON.parse(JSON.stringify(registros.value))
    console.log('[BPA DEBUG] Enviando para salvar:', dadosParaSalvar)
    await servicoBpa.salvarDados(competencia.value, equipeId, usuarioId, dadosParaSalvar)
    storeNotificacoes.mostrarNotificacao('Dados do BPA salvos com sucesso!', 'sucesso')
    registros.value = []
  } catch (error) {
    storeNotificacoes.mostrarNotificacao('Erro ao salvar os dados.', 'erro')
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
.tabela-bpa {
  width: 100%;
  white-space: nowrap;
}
.tabela-bpa th,
.tabela-bpa td {
  vertical-align: middle;
}
.tabela-bpa input,
.tabela-bpa select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
  min-width: 120px;
}
.tabela-bpa input:focus,
.tabela-bpa select:focus {
  outline: none;
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 2px rgba(13, 71, 161, 0.2);
}
.coluna-nome {
  width: 20%;
}
.coluna-cns {
  width: 15%;
}
.coluna-data-nasc {
  width: 10%;
}
.coluna-sexo {
  width: 8%;
}
.coluna-raca {
  width: 10%;
}
.coluna-gestante {
  width: 8%;
}
.coluna-exame {
  width: 10%;
}
.coluna-codigo {
  width: 10%;
}
.coluna-data-atend {
  width: 10%;
}
.coluna-acao {
  width: 5%;
  text-align: center;
}
.codigo-proc {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0 8px;
}
.sem-registros {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.area-diagnostico {
  margin-top: 2rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}
.area-diagnostico pre {
  background-color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #1e293b;
}
</style>
