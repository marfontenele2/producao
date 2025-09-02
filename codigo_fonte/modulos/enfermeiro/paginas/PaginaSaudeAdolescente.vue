<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Produção: Saúde do Adolescente</h1>
    </header>

    <div class="conteudo-card">
      <div class="filtros-card">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label>
          <input type="month" id="competencia" v-model="competencia" @change="buscarDados" />
        </div>
        <button
          class="botao botao-primario"
          @click="salvarDados"
          :disabled="salvando || !competencia"
        >
          <Save :size="18" />
          {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card" style="margin-top: 1.5rem; text-align: center">
      <p>Carregando dados da competência...</p>
    </div>

    <form v-if="!carregando && producao" @submit.prevent="salvarDados">
      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Atendimento por Motivo da Consulta</h2>
        <p class="secao-descricao">
          A soma das faixas etárias deve ser igual à soma dos tipos de consulta.
        </p>
        <div class="tabela-container">
          <table class="tabela-padrao tabela-producao">
            <thead>
              <tr>
                <th class="coluna-atendimento">Atendimento</th>
                <th class="coluna-numerica">10-14 M</th>
                <th class="coluna-numerica">10-14 F</th>
                <th class="coluna-numerica">15-19 M</th>
                <th class="coluna-numerica">15-19 F</th>
                <th class="coluna-separador"></th>
                <th class="coluna-numerica">Cons. Médica</th>
                <th class="coluna-numerica">Cons. Enferm.</th>
                <th class="coluna-numerica">Cons. Outros</th>
                <th class="coluna-separador"></th>
                <th class="coluna-numerica">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in producaoComputada.atendimentos" :key="index">
                <td>{{ item.nome }}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].faixa10a14Masc"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].faixa10a14Fem"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].faixa15a19Masc"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].faixa15a19Fem"
                  />
                </td>
                <td class="coluna-separador"></td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].consMedica"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].consEnfermagem"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.atendimentos[index].consOutros"
                  />
                </td>
                <td class="coluna-separador"></td>
                <td class="total-celula" :class="{ 'total-invalido': !item.valido }">
                  {{ item.totalGeral }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL</td>
                <td>{{ producaoComputada.totaisAtendimento.faixa10a14Masc }}</td>
                <td>{{ producaoComputada.totaisAtendimento.faixa10a14Fem }}</td>
                <td>{{ producaoComputada.totaisAtendimento.faixa15a19Masc }}</td>
                <td>{{ producaoComputada.totaisAtendimento.faixa15a19Fem }}</td>
                <td class="coluna-separador"></td>
                <td>{{ producaoComputada.totaisAtendimento.consMedica }}</td>
                <td>{{ producaoComputada.totaisAtendimento.consEnfermagem }}</td>
                <td>{{ producaoComputada.totaisAtendimento.consOutros }}</td>
                <td class="coluna-separador"></td>
                <td class="total-celula">{{ producaoComputada.totaisAtendimento.totalGeral }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="conteudo-card secao-formulario">
        <h2 class="secao-titulo">Métodos Contraceptivos</h2>
        <div class="tabela-container">
          <table class="tabela-padrao tabela-producao">
            <thead>
              <tr>
                <th class="coluna-atendimento">Métodos</th>
                <th class="coluna-numerica">10-14 M</th>
                <th class="coluna-numerica">10-14 F</th>
                <th class="coluna-numerica">15-19 M</th>
                <th class="coluna-numerica">15-19 F</th>
                <th class="coluna-numerica">TOTAL</th>
                <th class="coluna-numerica">ESTOQUE ATUAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in producaoComputada.metodos" :key="index">
                <td>{{ item.nome }}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.metodos[index].faixa10a14Masc"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.metodos[index].faixa10a14Fem"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.metodos[index].faixa15a19Masc"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.metodos[index].faixa15a19Fem"
                  />
                </td>
                <td class="total-celula">{{ item.total }}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    v-model.number="producao.metodos[index].estoqueAtual"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL</td>
                <td>{{ producaoComputada.totaisMetodos.faixa10a14Masc }}</td>
                <td>{{ producaoComputada.totaisMetodos.faixa10a14Fem }}</td>
                <td>{{ producaoComputada.totaisMetodos.faixa15a19Masc }}</td>
                <td>{{ producaoComputada.totaisMetodos.faixa15a19Fem }}</td>
                <td class="total-celula">{{ producaoComputada.totaisMetodos.total }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Save } from 'lucide-vue-next'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoProducaoAdolescente } from '@/modulos/enfermeiro/servicos/servicoProducaoAdolescente'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const competencia = ref('')
const producao = ref(null)
const carregando = ref(false)
const salvando = ref(false)

const criarEstadoInicial = () => ({
  atendimentos: [
    {
      nome: 'Acompanhamento do Crescimento',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Planejamento Familiar',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Imunização',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Pré-Natal',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'IST',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Queixas Gineco',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Queixas Clínicas',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Dentista',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Nutrição',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Transt. Emocionais',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
    {
      nome: 'Oficinas Educativas',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      consMedica: 0,
      consEnfermagem: 0,
      consOutros: 0,
    },
  ],
  metodos: [
    {
      nome: 'PRESER. MASC.',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      estoqueAtual: 0,
    },
    {
      nome: 'ANTICONC. ORAL',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      estoqueAtual: 0,
    },
    {
      nome: 'ANTICONC. INJETÁVEL',
      faixa10a14Masc: 0,
      faixa10a14Fem: 0,
      faixa15a19Masc: 0,
      faixa15a19Fem: 0,
      estoqueAtual: 0,
    },
  ],
})

async function buscarDados() {
  if (!competencia.value) {
    producao.value = null
    return
  }
  carregando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoProducaoAdolescente.buscarProducaoPorCompetencia(
      competencia.value,
      equipeId,
    )
    producao.value = dados ? dados : criarEstadoInicial()
  } catch (error) {
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Erro ao buscar dados.', tipo: 'erro' })
    console.error(error)
  } finally {
    carregando.value = false
  }
}

async function salvarDados() {
  if (!competencia.value || !producao.value) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Selecione uma competência para salvar.',
      tipo: 'alerta',
    })
    return
  }
  salvando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    // --- ALTERAÇÃO CIRÚRGICA ABAIXO ---
    // A chamada agora passa os parâmetros corretos que o serviço espera.
    await servicoProducaoAdolescente.salvarProducao(competencia.value, equipeId, producao.value)
    // ------------------------------------

    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Produção salva com sucesso!',
      tipo: 'sucesso',
    })

    producao.value = null
    competencia.value = ''
  } catch (error) {
    console.error('Erro ao salvar produção:', error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao salvar. Tente novamente.',
      tipo: 'erro',
    })
  } finally {
    salvando.value = false
  }
}

const somarColuna = (lista, chave) => lista.reduce((total, item) => total + (item[chave] || 0), 0)

const producaoComputada = computed(() => {
  if (!producao.value) {
    const estadoVazio = criarEstadoInicial()
    return {
      atendimentos: estadoVazio.atendimentos.map((item) => ({
        ...item,
        totalGeral: 0,
        valido: true,
      })),
      metodos: estadoVazio.metodos.map((item) => ({ ...item, total: 0 })),
      totaisAtendimento: {
        faixa10a14Masc: 0,
        faixa10a14Fem: 0,
        faixa15a19Masc: 0,
        faixa15a19Fem: 0,
        consMedica: 0,
        consEnfermagem: 0,
        consOutros: 0,
        totalGeral: 0,
      },
      totaisMetodos: {
        faixa10a14Masc: 0,
        faixa10a14Fem: 0,
        faixa15a19Masc: 0,
        faixa15a19Fem: 0,
        total: 0,
      },
    }
  }

  const atendimentosProcessados = producao.value.atendimentos.map((item) => {
    const somaFaixaEtaria =
      (item.faixa10a14Masc || 0) +
      (item.faixa10a14Fem || 0) +
      (item.faixa15a19Masc || 0) +
      (item.faixa15a19Fem || 0)
    const somaProfissionais =
      (item.consMedica || 0) + (item.consEnfermagem || 0) + (item.consOutros || 0)
    return { ...item, totalGeral: somaFaixaEtaria, valido: somaFaixaEtaria === somaProfissionais }
  })

  const metodosProcessados = producao.value.metodos.map((item) => {
    const total =
      (item.faixa10a14Masc || 0) +
      (item.faixa10a14Fem || 0) +
      (item.faixa15a19Masc || 0) +
      (item.faixa15a19Fem || 0)
    return { ...item, total }
  })

  return {
    atendimentos: atendimentosProcessados,
    metodos: metodosProcessados,
    totaisAtendimento: {
      faixa10a14Masc: somarColuna(atendimentosProcessados, 'faixa10a14Masc'),
      faixa10a14Fem: somarColuna(atendimentosProcessados, 'faixa10a14Fem'),
      faixa15a19Masc: somarColuna(atendimentosProcessados, 'faixa15a19Masc'),
      faixa15a19Fem: somarColuna(atendimentosProcessados, 'faixa15a19Fem'),
      consMedica: somarColuna(atendimentosProcessados, 'consMedica'),
      consEnfermagem: somarColuna(atendimentosProcessados, 'consEnfermagem'),
      consOutros: somarColuna(atendimentosProcessados, 'consOutros'),
      totalGeral: somarColuna(atendimentosProcessados, 'totalGeral'),
    },
    totaisMetodos: {
      faixa10a14Masc: somarColuna(metodosProcessados, 'faixa10a14Masc'),
      faixa10a14Fem: somarColuna(metodosProcessados, 'faixa10a14Fem'),
      faixa15a19Masc: somarColuna(metodosProcessados, 'faixa15a19Masc'),
      faixa15a19Fem: somarColuna(metodosProcessados, 'faixa15a19Fem'),
      total: somarColuna(metodosProcessados, 'total'),
    },
  }
})
</script>

<style scoped>
.filtros-card {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--cor-texto-padrao);
}
.campo input[type='month'] {
  padding: 8px 12px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 6px;
  font-size: 1rem;
}
.secao-formulario {
  margin-top: 1.5rem;
}
.secao-titulo {
  font-size: 1.25rem;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.secao-descricao {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.tabela-container {
  overflow-x: auto;
}
.tabela-producao {
  width: 100%;
  white-space: nowrap;
}
.tabela-producao input[type='number'] {
  width: 60px;
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
}
.tabela-producao input[type='number']:focus {
  outline: 2px solid var(--cor-primaria);
  border-color: var(--cor-primaria);
}
.coluna-atendimento {
  text-align: left;
  min-width: 250px;
}
.coluna-numerica {
  text-align: center;
}
.coluna-separador {
  width: 20px;
  padding: 0;
  border: none;
}
.total-celula {
  font-weight: bold;
  text-align: center;
  background-color: #f1f5f9;
}
.total-invalido {
  background-color: #fee2e2;
  color: #991b1b;
  outline: 1px solid #ef4444;
}
tfoot td {
  font-weight: bold;
  background-color: #f8fafc;
  text-align: center;
}
tfoot td:first-child {
  text-align: left;
}
</style>
