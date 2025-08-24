<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Acompanhamento Consolidado de Gestantes</h1>
    </header>
    <div class="conteudo-card">
      <div class="card-filtros">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label>
          <input type="month" id="competencia" v-model="competencia" @change="carregarDados" />
        </div>
        <div class="acoes-formulario" v-if="!formulario.finalizado && competencia">
          <button class="botao" type="button" @click="salvarRascunho" :disabled="salvando">
            <Save :size="18" /> {{ salvando ? 'Salvando...' : 'Salvar Rascunho' }}
          </button>
          <button
            class="botao botao-primario"
            type="button"
            @click="finalizar"
            :disabled="salvando"
          >
            <CheckCircle :size="18" /> {{ salvando ? 'Finalizando...' : 'Finalizar e Entregar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="carregando" class="conteudo-card secao-formulario">
      <p style="text-align: center">Carregando dados...</p>
    </div>

    <form v-if="!carregando && competencia" @submit.prevent="finalizar">
      <fieldset :disabled="formulario.finalizado" class="secao-formulario">
        <div v-if="formulario.finalizado" class="aviso-finalizado">
          Este relatório foi finalizado e não pode mais ser editado.
        </div>

        <CardRiscoGestacional titulo="Risco Habitual" :dados="formulario.riscoHabitual" />
        <CardRiscoGestacional titulo="Risco Intermediário" :dados="formulario.riscoIntermediario" />
        <CardRiscoGestacional titulo="Alto Risco" :dados="formulario.altoRisco" />
      </fieldset>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { useStoreNotificacoes } from '@/nucleo/notificacoes/storeNotificacoes'
import { servicoAcompanhamentoGestantes } from '@/modulos/enfermeiro/servicos/ServicoAcompanhamentoGestantes.js'
import CardRiscoGestacional from '@/modulos/enfermeiro/componentes/CardRiscoGestacional.vue'
import { Save, CheckCircle } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const storeNotificacoes = useStoreNotificacoes()

const competencia = ref('')
const carregando = ref(false)
const salvando = ref(false)
const formulario = ref(criarFormularioVazio())

function criarFormularioVazio() {
  const modeloRisco = { total: 0, branca: 0, parda: 0, preta: 0 }
  return {
    riscoHabitual: { ...modeloRisco },
    riscoIntermediario: { ...modeloRisco },
    altoRisco: { ...modeloRisco },
    finalizado: false,
  }
}

async function carregarDados() {
  if (!competencia.value) return
  carregando.value = true
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoAcompanhamentoGestantes.buscarDados(competencia.value, equipeId)
    formulario.value = dados ? dados : criarFormularioVazio()
  } catch (error) {
    console.error(error)
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'Falha ao carregar dados existentes.',
      tipo: 'erro',
    })
    formulario.value = criarFormularioVazio()
  } finally {
    carregando.value = false
  }
}

async function salvar(finalizarRelatorio = false) {
  // [ALTERADO] A validação agora apenas verifica se o total geral é maior que zero para finalizar.
  const totalGeral =
    formulario.value.riscoHabitual.total +
    formulario.value.riscoIntermediario.total +
    formulario.value.altoRisco.total
  if (finalizarRelatorio && totalGeral === 0) {
    storeNotificacoes.mostrarNotificacao({
      mensagem: 'É preciso preencher ao menos um campo para finalizar o relatório.',
      tipo: 'alerta',
    })
    return
  }

  salvando.value = true
  formulario.value.finalizado = finalizarRelatorio
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const usuarioId = storeUsuario.usuario.uid
    await servicoAcompanhamentoGestantes.salvarDados(
      competencia.value,
      equipeId,
      usuarioId,
      formulario.value,
    )

    const mensagem = finalizarRelatorio
      ? 'Relatório finalizado e entregue com sucesso!'
      : 'Rascunho salvo com sucesso!'
    storeNotificacoes.mostrarNotificacao({ mensagem, tipo: 'sucesso' })
  } catch (error) {
    console.error(error)
    formulario.value.finalizado = !finalizarRelatorio // Reverte o status em caso de erro
    storeNotificacoes.mostrarNotificacao({ mensagem: 'Falha ao salvar o registro.', tipo: 'erro' })
  } finally {
    salvando.value = false
  }
}

const salvarRascunho = () => salvar(false)
const finalizar = () => salvar(true)
</script>

<style scoped>
.secao-formulario {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card-filtros {
  /* Estilo já existente, mas garantindo que os botões se alinhem */
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}
.acoes-formulario {
  margin-left: auto; /* Empurra os botões para a direita */
  display: flex;
  gap: 1rem;
}
.aviso-finalizado {
  padding: 1rem;
  background-color: #fefce8;
  border: 1px solid #facc15;
  color: #a16207;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}
</style>
