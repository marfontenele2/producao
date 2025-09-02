<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho no-print">
      <h1>Produção: Controle de Sarampo/Rubéola</h1>
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
        <h2 class="secao-titulo">Resumo da Semana</h2>
        <div class="grid-resumo">
          <div class="campo">
            <label>Nº de casos notificados (Sarampo) nesta semana</label>
            <input
              type="number"
              min="0"
              class="input-padrao"
              v-model.number="dadosFormulario.resumo.notificadosSarampoSemana"
            />
          </div>
          <div class="campo">
            <label>Nº de casos acumulados (Sarampo) até esta semana</label>
            <input
              type="number"
              min="0"
              class="input-padrao input-readonly"
              :value="acumuladoSarampoComputado"
              readonly
            />
          </div>
          <div class="campo">
            <label>Nº de casos notificados (Rubéola) nesta semana</label>
            <input
              type="number"
              min="0"
              class="input-padrao"
              v-model.number="dadosFormulario.resumo.notificadosRubeolaSemana"
            />
          </div>
          <div class="campo">
            <label>Nº de casos acumulados (Rubéola) até esta semana</label>
            <input
              type="number"
              min="0"
              class="input-padrao input-readonly"
              :value="acumuladoRubeolaComputado"
              readonly
            />
          </div>
        </div>
      </div>

      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Dados Complementares dos Casos Notificados na Semana</h2>
        <div class="tabela-container">
          <table class="tabela-padrao tabela-producao">
            <thead>
              <tr>
                <th>SINAN Nº</th>
                <th>Nome</th>
                <th>Idade</th>
                <th>Suspeito</th>
                <th>Data Not.</th>
                <th>Data Inves.</th>
                <th>Bloqueio</th>
                <th>Data Início Exantema</th>
                <th>Data Coleta Soro</th>
                <th>Data Envio LACEN</th>
                <th>Data Receb. LACEN</th>
                <th>Diag. Final</th>
                <th class="coluna-acao no-print"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="dadosFormulario.casos.length === 0">
                <td colspan="13">Nenhum caso adicionado.</td>
              </tr>
              <tr v-for="(caso, index) in dadosFormulario.casos" :key="index">
                <td><input type="text" v-model="caso.sinan" /></td>
                <td><input type="text" v-model="caso.nome" /></td>
                <td><input type="number" min="0" v-model.number="caso.idade" /></td>
                <td>
                  <select v-model="caso.suspeito">
                    <option value="S">Sarampo</option>
                    <option value="R">Rubéola</option>
                    <option value="D">Dengue</option>
                    <option value="OE">Outras Exant.</option>
                  </select>
                </td>
                <td><input type="date" v-model="caso.dataNotificacao" /></td>
                <td><input type="date" v-model="caso.dataInvestigacao" /></td>
                <td>
                  <select v-model="caso.bloqueio">
                    <option value="RE">Realizado</option>
                    <option value="NR">Não Realizado</option>
                    <option value="NI">Não Indicado</option>
                  </select>
                </td>
                <td><input type="date" v-model="caso.dataInicioExantema" /></td>
                <td><input type="date" v-model="caso.dataColetaSoro" /></td>
                <td><input type="date" v-model="caso.dataEnvioLacen" /></td>
                <td><input type="date" v-model="caso.dataRecebLacen" /></td>
                <td>
                  <select v-model="caso.diagFinal">
                    <option value="SR">Soro Reagente</option>
                    <option value="SNR">Soro Não Reagente</option>
                  </select>
                </td>
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, CheckCircle, PlusCircle, Trash2 } from 'lucide-vue-next'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { ServicoSarampo } from '../servicos/ServicoSarampo'
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
const acumuladosAnteriores = ref({ sarampo: 0, rubeola: 0 })

const criarEstadoInicial = () => ({
  resumo: {
    notificadosSarampoSemana: 0,
    notificadosRubeolaSemana: 0,
  },
  casos: [],
  finalizado: false,
})
const dadosFormulario = ref(criarEstadoInicial())

// MODIFICADO: Computeds para calcular os totais em tempo real
const acumuladoSarampoComputado = computed(() => {
  return (
    (acumuladosAnteriores.value.sarampo || 0) +
    (dadosFormulario.value.resumo.notificadosSarampoSemana || 0)
  )
})
const acumuladoRubeolaComputado = computed(() => {
  return (
    (acumuladosAnteriores.value.rubeola || 0) +
    (dadosFormulario.value.resumo.notificadosRubeolaSemana || 0)
  )
})

watch(anoSelecionado, (novoAno) => {
  semanasDoAno.value = semanaEpidemiologicaUtils.getCalendario(novoAno)
  semanaKeySelecionada.value = null
  dadosFormulario.value = criarEstadoInicial()
  acumuladosAnteriores.value = { sarampo: 0, rubeola: 0 }
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

// MODIFICADO: Função agora busca os dados da semana E os acumulados
async function buscarDados() {
  carregando.value = true
  dadosFormulario.value = criarEstadoInicial()
  acumuladosAnteriores.value = { sarampo: 0, rubeola: 0 }

  const equipeId = storeUsuario.usuario?.equipeId
  if (equipeId && semanaKeySelecionada.value) {
    const [dadosSalvos, acumulados] = await Promise.all([
      ServicoSarampo.carregarDados(semanaKeySelecionada.value, equipeId),
      ServicoSarampo.calcularAcumuladosAnteriores(
        anoSelecionado.value,
        semanaKeySelecionada.value,
        equipeId,
      ),
    ])

    if (dadosSalvos) {
      dadosFormulario.value = { ...criarEstadoInicial(), ...dadosSalvos }
    }
    if (acumulados) {
      acumuladosAnteriores.value = {
        sarampo: acumulados.acumuladoSarampo,
        rubeola: acumulados.acumuladoRubeola,
      }
    }
  }
  carregando.value = false
}

function adicionarCaso() {
  dadosFormulario.value.casos.push({
    sinan: '',
    nome: '',
    idade: null,
    suspeito: 'S',
    dataNotificacao: '',
    dataInvestigacao: '',
    bloqueio: 'NR',
    dataInicioExantema: '',
    dataColetaSoro: '',
    dataEnvioLacen: '',
    dataRecebLacen: '',
    diagFinal: 'SNR',
  })
}

function removerCaso(index) {
  dadosFormulario.value.casos.splice(index, 1)
}

// MODIFICADO: Payload agora inclui os totais calculados
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

  const payload = {
    ...dadosFormulario.value,
    resumo: {
      ...dadosFormulario.value.resumo,
      acumuladosSarampo: acumuladoSarampoComputado.value,
      acumuladosRubeola: acumuladoRubeolaComputado.value,
    },
    finalizado: finalizar,
  }

  try {
    await ServicoSarampo.salvarDados(semanaKeySelecionada.value, equipeId, payload, usuarioId)
    storeNotificacoes.mostrarNotificacao({
      mensagem: `Controle de Sarampo ${finalizar ? 'finalizado' : 'salvo'} com sucesso!`,
      tipo: 'sucesso',
    })
    if (finalizar) {
      dadosFormulario.value.finalizado = true
    }
    // Atualiza o valor base dos acumulados após salvar
    acumuladosAnteriores.value.sarampo += dadosFormulario.value.resumo.notificadosSarampoSemana
    acumuladosAnteriores.value.rubeola += dadosFormulario.value.resumo.notificadosRubeolaSemana
  } catch (error) {
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Falha ao salvar os dados.', tipo: 'erro' })
  } finally {
    salvando.value = false
  }
}

function voltar() {
  router.push({ name: 'EnfermeiroProducaoSemanal' })
}
</script>

<style scoped>
.secao-formulario {
  margin-top: 1.5rem;
}
.secao-titulo {
  font-size: 1.25rem;
  margin-top: 0;
}
.tabela-container {
  overflow-x: auto;
}
.tabela-producao {
  width: 100%;
  white-space: nowrap;
  font-size: 0.85rem;
}
.tabela-producao th,
.tabela-producao td {
  text-align: center;
  vertical-align: middle;
  padding: 6px 4px;
}
.tabela-producao input,
.tabela-producao select {
  width: 100%;
  min-width: 120px;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid var(--cor-borda-suave);
}
.tabela-producao input[type='number'] {
  min-width: 60px;
}
.coluna-acao {
  width: 60px;
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
.grid-resumo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
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
/* Estilos para filtros e inputs, para garantir a padronização */
.filtros-card {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.botoes-acao {
  margin-left: auto;
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
}
.input-readonly {
  background-color: #f1f5f9;
  cursor: not-allowed;
}
</style>
