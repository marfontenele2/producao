<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Acompanhamento de Suplementos</h1>
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

    <form v-if="!carregando && dados" @submit.prevent="salvarDados">
      <div class="conteudo-card secao-formulario">
        <h3 class="titulo-secao">1- Crianças de 4 a 24 meses</h3>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>1ª Entrega</th>
              <th>2ª Entrega</th>
              <th>3ª Entrega</th>
              <th>4ª Entrega</th>
              <th>5ª Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.criancas.xaropeFerroso.entrega1"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.criancas.xaropeFerroso.entrega2"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.criancas.xaropeFerroso.entrega3"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.criancas.xaropeFerroso.entrega4"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.criancas.xaropeFerroso.entrega5"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="conteudo-card secao-formulario">
        <h3 class="titulo-secao">2- Gestantes a partir da 20ª semana</h3>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>1ª Entrega</th>
              <th>2ª Entrega</th>
              <th>3ª Entrega</th>
              <th>4ª Entrega</th>
              <th>5ª Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.xaropeFerroso.entrega1"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.xaropeFerroso.entrega2"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.xaropeFerroso.entrega3"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.xaropeFerroso.entrega4"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.xaropeFerroso.entrega5"
                />
              </td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.comprimidoFerroso.entrega1"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.comprimidoFerroso.entrega2"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.comprimidoFerroso.entrega3"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.comprimidoFerroso.entrega4"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.comprimidoFerroso.entrega5"
                />
              </td>
            </tr>
            <tr>
              <td>Comprimido de Ácido Fólico</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.acidoFolico.entrega1"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.acidoFolico.entrega2"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.acidoFolico.entrega3"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.acidoFolico.entrega4"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.gestantes.acidoFolico.entrega5"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="conteudo-card secao-formulario">
        <h3 class="titulo-secao">3- Mulheres até o 3º mês Pós-Parto e Pós-Aborto</h3>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>1ª Entrega</th>
              <th>2ª Entrega</th>
              <th>3ª Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.posParto.xaropeFerroso.entrega1"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.posParto.xaropeFerroso.entrega2"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.posParto.xaropeFerroso.entrega3"
                />
              </td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.posParto.comprimidoFerroso.entrega1"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.posParto.comprimidoFerroso.entrega2"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.posParto.comprimidoFerroso.entrega3"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="conteudo-card secao-formulario">
        <h3 class="titulo-secao">4- Controle de Perdas</h3>
        <table class="tabela-padrao">
          <thead>
            <tr>
              <th>Tipo de Suplemento</th>
              <th>Vencimento</th>
              <th>Extravio</th>
              <th>Danificado</th>
              <th>Outros</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Xarope de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.perdas.xaropeFerroso.vencimento"
                />
              </td>
              <td class="celula-input">
                <input type="number" min="0" v-model.number="dados.perdas.xaropeFerroso.extravio" />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.perdas.xaropeFerroso.danificado"
                />
              </td>
              <td class="celula-input">
                <input type="number" min="0" v-model.number="dados.perdas.xaropeFerroso.outros" />
              </td>
            </tr>
            <tr>
              <td>Comprimido de Sulfato Ferroso</td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.perdas.comprimidoFerroso.vencimento"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.perdas.comprimidoFerroso.extravio"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.perdas.comprimidoFerroso.danificado"
                />
              </td>
              <td class="celula-input">
                <input
                  type="number"
                  min="0"
                  v-model.number="dados.perdas.comprimidoFerroso.outros"
                />
              </td>
            </tr>
            <tr>
              <td>Comprimido de Ácido Fólico</td>
              <td class="celula-input">
                <input type="number" min="0" v-model.number="dados.perdas.acidoFolico.vencimento" />
              </td>
              <td class="celula-input">
                <input type="number" min="0" v-model.number="dados.perdas.acidoFolico.extravio" />
              </td>
              <td class="celula-input">
                <input type="number" min="0" v-model.number="dados.perdas.acidoFolico.danificado" />
              </td>
              <td class="celula-input">
                <input type="number" min="0" v-model.number="dados.perdas.acidoFolico.outros" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoSuplementos } from '@/modulos/enfermeiro/servicos/servicoSuplementos'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { Save } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const competencia = ref('')
// MODIFICADO: 'dados' agora começa com um objeto válido e não mais 'null'
const dados = ref(null)
const carregando = ref(false)
const salvando = ref(false)

// ADICIONADO: Função para criar a estrutura de dados vazia
const criarEstadoInicial = () => ({
  criancas: {
    xaropeFerroso: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
  },
  gestantes: {
    xaropeFerroso: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
    comprimidoFerroso: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
    acidoFolico: { entrega1: 0, entrega2: 0, entrega3: 0, entrega4: 0, entrega5: 0 },
  },
  posParto: {
    xaropeFerroso: { entrega1: 0, entrega2: 0, entrega3: 0 },
    comprimidoFerroso: { entrega1: 0, entrega2: 0, entrega3: 0 },
  },
  perdas: {
    xaropeFerroso: { vencimento: 0, extravio: 0, danificado: 0, outros: 0 },
    comprimidoFerroso: { vencimento: 0, extravio: 0, danificado: 0, outros: 0 },
    acidoFolico: { vencimento: 0, extravio: 0, danificado: 0, outros: 0 },
  },
})

// MODIFICADO: Função 'buscarDados' agora usa a estrutura inicial
async function buscarDados() {
  if (!competencia.value) {
    dados.value = null
    return
  }
  carregando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dadosSalvos = await servicoSuplementos.buscarDados(competencia.value, equipeId)
    // Se encontrar dados salvos, usa. Senão, cria um novo a partir do modelo.
    dados.value = dadosSalvos ? dadosSalvos : criarEstadoInicial()
  } catch (error) {
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Erro ao buscar dados.', tipo: 'erro' })
    console.error(error)
    dados.value = criarEstadoInicial() // Garante que não ficará nulo em caso de erro
  } finally {
    carregando.value = false
  }
}

async function salvarDados() {
  if (!competencia.value || !dados.value) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Selecione uma competência e preencha os dados.',
      tipo: 'alerta',
    })
    return
  }
  salvando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const usuarioId = storeUsuario.usuario.uid
    await servicoSuplementos.salvarDados(competencia.value, equipeId, usuarioId, dados.value)
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Dados salvos com sucesso!', tipo: 'sucesso' })
  } catch (error) {
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Erro ao salvar os dados.', tipo: 'erro' })
    console.error(error)
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
/* Estilos permanecem os mesmos */
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

.titulo-secao {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 1px solid var(--cor-borda-suave);
  padding-bottom: 0.5rem;
}

.tabela-padrao td:first-child {
  font-weight: 500;
  background-color: #f8fafc;
  width: 25%;
}

.celula-input {
  padding: 6px !important;
}

.celula-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--cor-borda-suave);
  border-radius: 4px;
  text-align: center;
  box-sizing: border-box;
  font-size: 0.9rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.celula-input input:focus {
  outline: none;
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 2px rgba(13, 71, 161, 0.2);
}

/* Remove as setas dos inputs de número */
.celula-input input[type='number']::-webkit-inner-spin-button,
.celula-input input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.celula-input input[type='number'] {
  -moz-appearance: textfield;
}
</style>
