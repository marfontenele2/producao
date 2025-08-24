<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho"><h1>BPA - Boletim de Produção Ambulatorial</h1></header>
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
      <p style="text-align: center">Carregando dados da competência...</p>
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
                <td colspan="10" class="sem-registros">
                  Nenhum atendimento registrado. Clique em "Adicionar Paciente".
                </td>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoBpa } from '@/modulos/enfermeiro/servicos/servicoBpa.js'
import { Save, PlusCircle, Trash2 } from 'lucide-vue-next'

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

    registros.value = dadosDoBanco.map((d) => ({
      ...criarModeloDeDadosInicial(),
      ...d,
      cnsPaciente: d.cnsPaciente || d.cns || '',
    }))
  } catch (error) {
    console.error('[ERRO AO BUSCAR BPA]', error)
    // [CORRIGIDO] Chamada à notificação com o formato de objeto correto.
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Erro ao buscar registros da competência.',
      tipo: 'erro',
    })
  } finally {
    carregando.value = false
  }
}

function validarRegistros() {
  for (const [index, reg] of registros.value.entries()) {
    const linha = index + 1
    if (!reg.nomePaciente?.trim()) {
      // [CORRIGIDO] Chamada à notificação com o formato de objeto correto.
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Nome do Paciente" é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (!reg.cnsPaciente || reg.cnsPaciente.length !== 15) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"CNS do Paciente" deve ter 15 números na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (!reg.dataNascimento) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Data de Nasc." é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (!reg.sexo) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Sexo" é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (!reg.racaCor) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Raça/Cor" é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (reg.isGestante === null || reg.isGestante === undefined) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Gestante?" é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (!reg.tipoExame) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Tipo de Exame" é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
    if (!reg.dataAtendimento) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: `"Data do Atendimento" é obrigatório na linha ${linha}.`,
        tipo: 'alerta',
      })
      return false
    }
  }
  return true
}

async function salvarDados() {
  if (!storeUsuario.usuario?.uid || !storeUsuario.usuario?.equipeId) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Dados do usuário incompletos. Recarregue a página.',
      tipo: 'erro',
    })
    return
  }

  // A validação agora considera que pode haver linhas vazias que serão filtradas.
  if (!validarRegistros()) return

  salvando.value = true
  try {
    const dadosLimposParaSalvar = registros.value
      .filter((reg) => reg.nomePaciente && reg.nomePaciente.trim() !== '')
      .map((reg) => ({
        nomePaciente: reg.nomePaciente,
        cnsPaciente: reg.cnsPaciente,
        dataNascimento: reg.dataNascimento,
        sexo: reg.sexo,
        racaCor: reg.racaCor,
        isGestante: reg.isGestante,
        tipoExame: reg.tipoExame,
        dataAtendimento: reg.dataAtendimento,
      }))

    if (dadosLimposParaSalvar.length === 0 && registros.value.length > 0) {
      storeNotificacoes.mostrarNotificacao({
        mensagem: 'Nenhum registro preenchido para salvar.',
        tipo: 'alerta',
      })
      salvando.value = false
      return
    }

    const equipeId = storeUsuario.usuario.equipeId
    const usuarioId = storeUsuario.usuario.uid

    await servicoBpa.salvarDados(competencia.value, equipeId, usuarioId, dadosLimposParaSalvar)

    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Dados do BPA salvos com sucesso!',
      tipo: 'sucesso',
    })

    registros.value = []
    competencia.value = ''
  } catch (error) {
    console.error('[FALHA AO SALVAR BPA]', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Ocorreu um erro inesperado ao salvar. Verifique o console.',
      tipo: 'erro',
    })
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
/* Estilos permanecem os mesmos e foram omitidos para brevidade */
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
</style>
