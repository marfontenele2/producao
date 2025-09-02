<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho no-print">
      <h1>Produção: Notificação Semanal</h1>
      <button class="botao botao-acao" @click="voltar"><ArrowLeft :size="18" /> Voltar</button>
    </header>

    <div class="conteudo-card">
      <div class="filtros-card">
        <div class="campo">
          <label for="ano">Ano</label>
          <select id="ano" v-model="anoSelecionado" class="input-padrao">
            <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>
        <div class="campo">
          <label for="semana">Semana Epidemiológica</label>
          <select
            id="semana"
            v-model="semanaKeySelecionada"
            @change="buscarDados"
            :disabled="!anoSelecionado"
            class="input-padrao"
          >
            <option :value="null" disabled>Selecione</option>
            <option v-for="semana in semanasDoAno" :key="semana.chave" :value="semana.chave">
              {{ semana.display }}
            </option>
          </select>
        </div>
        <div class="botoes-acao">
          <button
            class="botao"
            @click="salvar(false)"
            :disabled="salvando || carregando || dadosFormulario.finalizado"
          >
            <Save :size="18" /> Salvar Rascunho
          </button>
          <button
            class="botao botao-primario"
            @click="salvar(true)"
            :disabled="salvando || carregando || dadosFormulario.finalizado"
          >
            <CheckCircle :size="18" /> Finalizar
          </button>
        </div>
      </div>
      <div v-if="dadosFormulario.finalizado" class="aviso-finalizado">
        Esta produção foi finalizada e não pode mais ser editada.
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card secao-formulario">
      <p>Carregando dados...</p>
    </div>

    <form v-else @submit.prevent="salvar(true)">
      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Checklist de Notificações</h2>
        <div class="campo-radio-vertical">
          <p>Houve notificação de Tétano Neonatal?</p>
          <div class="grupo-radio">
            <label
              ><input type="radio" :value="true" v-model="dadosFormulario.tetanoNeonatal" />
              Sim</label
            >
            <label
              ><input type="radio" :value="false" v-model="dadosFormulario.tetanoNeonatal" />
              Não</label
            >
          </div>
        </div>
        <div class="campo-radio-vertical">
          <p>Houve notificação de Paralisia Flácida Aguda?</p>
          <div class="grupo-radio">
            <label
              ><input type="radio" :value="true" v-model="dadosFormulario.paralisiaFlacida" />
              Sim</label
            >
            <label
              ><input type="radio" :value="false" v-model="dadosFormulario.paralisiaFlacida" />
              Não</label
            >
          </div>
        </div>
        <div class="campo">
          <label for="casos-sarampo">Número de casos suspeitos de Sarampo notificados</label>
          <input
            class="input-numero-pequeno"
            type="number"
            id="casos-sarampo"
            min="0"
            v-model.number="dadosFormulario.casosSuspeitosSarampo"
          />
        </div>
      </div>

      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Casos de Paralisia Flácida Aguda (se houver)</h2>
        <div class="tabela-container">
          <table class="tabela-padrao tabela-producao">
            <thead>
              <tr>
                <th>Nome do Paciente</th>
                <th>Data de Nascimento</th>
                <th>Data da Notificação</th>
                <th class="coluna-acao no-print"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="dadosFormulario.casosParalisia.length === 0">
                <td colspan="4">Nenhum caso adicionado.</td>
              </tr>
              <tr v-for="(caso, index) in dadosFormulario.casosParalisia" :key="index">
                <td>
                  <input type="text" v-model="caso.nome" placeholder="Nome completo do paciente" />
                </td>
                <td><input type="date" v-model="caso.dataNascimento" /></td>
                <td><input type="date" v-model="caso.dataNotificacao" /></td>
                <td class="coluna-acao no-print">
                  <button type="button" class="botao-remover" @click="removerCaso(index)">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rodape-tabela no-print">
          <button type="button" class="botao botao-secundario" @click="adicionarCaso">
            <PlusCircle :size="16" /> Adicionar Caso
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, CheckCircle, PlusCircle, Trash2 } from 'lucide-vue-next'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { ServicoNotificacaoSemanal } from '../servicos/ServicoNotificacaoSemanal'
import { semanaEpidemiologicaUtils } from '@/nucleo/utils/semanaEpidemiologica'

const router = useRouter()
const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const carregando = ref(true)
const salvando = ref(false)

const anoSelecionado = ref(new Date().getFullYear())
const anosDisponiveis = ref([])
const semanasDoAno = ref([])
const semanaKeySelecionada = ref(null)

const criarEstadoInicial = () => ({
  tetanoNeonatal: false,
  paralisiaFlacida: false,
  casosSuspeitosSarampo: 0,
  casosParalisia: [],
  finalizado: false,
})
const dadosFormulario = ref(criarEstadoInicial())

watch(anoSelecionado, (novoAno) => {
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(novoAno)
  semanaKeySelecionada.value = null
  dadosFormulario.value = criarEstadoInicial()
})

onMounted(() => {
  anosDisponiveis.value = semanaEpidemiologicaUtils.getAnosDisponiveis()
  const anoAtual = new Date().getFullYear()

  if (anosDisponiveis.value.includes(anoAtual)) {
    anoSelecionado.value = anoAtual
  } else if (anosDisponiveis.value.length > 0) {
    anoSelecionado.value = anosDisponiveis.value[0]
  }

  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(anoSelecionado.value)
  const semanaAtual = semanaEpidemiologicaUtils.getSemanaAtual()

  if (semanaAtual && String(semanaAtual.chave).startsWith(String(anoSelecionado.value))) {
    semanaKeySelecionada.value = semanaAtual.chave
  } else if (semanasDoAno.value.length > 0) {
    semanaKeySelecionada.value = semanasDoAno.value[0].chave
  }

  buscarDados()
})

async function buscarDados() {
  carregando.value = true
  const equipeId = storeUsuario.usuario?.equipeId
  if (equipeId && semanaKeySelecionada.value) {
    const dadosSalvos = await ServicoNotificacaoSemanal.carregarDados(
      semanaKeySelecionada.value,
      equipeId,
    )
    dadosFormulario.value = dadosSalvos
      ? { ...criarEstadoInicial(), ...dadosSalvos }
      : criarEstadoInicial()
  } else {
    dadosFormulario.value = criarEstadoInicial()
  }
  carregando.value = false
}

function adicionarCaso() {
  dadosFormulario.value.casosParalisia.push({
    nome: '',
    dataNascimento: '',
    dataNotificacao: '',
  })
}

function removerCaso(index) {
  dadosFormulario.value.casosParalisia.splice(index, 1)
}

async function salvar(finalizar) {
  if (
    finalizar &&
    !confirm(
      `Tem certeza que deseja finalizar a notificação da semana ${semanaKeySelecionada.value}?`,
    )
  ) {
    return
  }
  salvando.value = true
  const equipeId = storeUsuario.usuario?.equipeId
  const usuarioId = storeUsuario.usuario?.uid
  const payload = { ...dadosFormulario.value, finalizado: finalizar }

  try {
    await ServicoNotificacaoSemanal.salvarDados(
      semanaKeySelecionada.value,
      equipeId,
      payload,
      usuarioId,
    )
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Notificação ${finalizar ? 'finalizada' : 'salva'} com sucesso!`,
      tipo: 'sucesso',
    })
    if (finalizar) {
      dadosFormulario.value.finalizado = true
    }
  } catch (error) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao salvar a notificação.',
      tipo: 'erro',
    })
  } finally {
    salvando.value = false
  }
}

function voltar() {
  router.push({ name: 'EnfermeiroProducaoSemanal' })
}
</script>

<style scoped>
/* MODIFICADO: Adicionados estilos para padronizar os filtros */
.filtros-card {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.botoes-acao {
  margin-left: auto; /* Empurra os botões para a direita */
  display: flex;
  gap: 1rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}
.input-padrao {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
  min-width: 250px;
}
/* ----------------------------------------------------------- */

.secao-formulario {
  margin-top: 1.5rem;
}
.secao-titulo {
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.campo-radio-vertical {
  margin-bottom: 1.5rem;
}
.campo-radio-vertical p {
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.grupo-radio {
  display: flex;
  gap: 1.5rem;
}
.input-numero-pequeno {
  width: 120px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--cor-borda-suave);
}
.aviso-finalizado {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
}
.tabela-producao input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
}
.coluna-acao {
  width: 60px;
  text-align: center;
}
.botao-remover {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}
.rodape-tabela {
  margin-top: 1rem;
}
</style>
