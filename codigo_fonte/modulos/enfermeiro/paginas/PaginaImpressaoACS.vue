<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho">
        <h1>Impressão: Produção do Agente Comunitário de Saúde (ACS)</h1>
      </header>
      <div class="conteudo-card card-filtros">
        <div class="campo">
          <label for="competencia">Competência</label>
          <input type="month" id="competencia" v-model="competencia" class="input-padrao" />
        </div>

        <button
          class="botao botao-primario"
          @click="gerarRelatorio"
          :disabled="!competencia || buscando"
        >
          <FileSearch :size="18" /> {{ buscando ? 'Buscando...' : 'Gerar Relatório' }}
        </button>
        <button class="botao" @click="imprimirPagina" :disabled="!dadosRelatorio">
          <Printer :size="18" /> Imprimir
        </button>
      </div>
    </div>
  </div>

  <div v-if="erroBusca" class="no-print pagina-container mensagem-feedback erro">
    {{ erroBusca }}
  </div>

  <div v-if="dadosRelatorio" id="area-impressao">
    <div class="pagina-a4 borda-impressao">
      <header class="cabecalho-impressao">
        <LogoCabecalhoImpressao />
        <h3>RELATÓRIO DE PRODUÇÃO CONSOLIDADA - ACS</h3>
        <div class="info-cabecalho-grid">
          <span><strong>Equipe:</strong> {{ nomeEquipe }}</span>
          <span><strong>Competência:</strong> {{ competenciaFormatada }}</span>
          <span><strong>Data de Emissão:</strong> {{ dataAtualFormatada }}</span>
        </div>
      </header>

      <main class="corpo-impressao">
        <h4 class="titulo-secao-impressao">👤 IDENTIFICAÇÃO DO AGENTE</h4>
        <div class="grid-dados">
          <div>
            <strong>Nome do ACS:</strong> {{ dadosRelatorio.responsavelNome || 'Não informado' }}
          </div>
          <div><strong>Microárea:</strong> {{ dadosRelatorio.microarea || 'Não informada' }}</div>
        </div>

        <TabelaRelatorio titulo="👶 Puericultura" :itens="dadosPuericultura" />
        <TabelaRelatorio titulo="⚖️ Avaliação Antropométrica" :itens="dadosAntropometria" />
        <TabelaRelatorio titulo="🏡 Visitas Domiciliares do ACS" :itens="dadosVisitas" />
        <TabelaRelatorio titulo="💉 Situação Vacinal" :itens="dadosVacinas" />
        <TabelaRelatorio titulo="👶 Nascidos na Microárea" :itens="dadosNascidos" />

        <h4 class="titulo-secao-impressao">🗒️ OUTRAS INFORMAÇÕES</h4>
        <p class="texto-observacoes">
          <strong>Observações Gerais:</strong>
          {{ dadosRelatorio.outrasInformacoes.observacoesGerais || 'Nenhuma observação.' }}
        </p>
      </main>

      <footer class="rodape-impressao">
        <div class="assinatura">
          <p class="linha-assinatura">_________________________________________</p>
          <p>{{ dadosRelatorio.responsavelNome || 'Agente Comunitário de Saúde' }}</p>
        </div>
        <div class="assinatura">
          <p class="linha-assinatura">_________________________________________</p>
          <p>Enfermeiro(a) Responsável</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoProducaoACS } from '@/modulos/acs/servicos/servicoProducaoACS'
import { FileSearch, Printer } from 'lucide-vue-next'
import LogoCabecalhoImpressao from '@/nucleo/componentes_comuns/LogoCabecalhoImpressao.vue'
import TabelaRelatorio from '@/modulos/enfermeiro/componentes/TabelaRelatorio.vue' // Componente reutilizável

const storeUsuario = useStoreUsuario()

const buscando = ref(false)
const erroBusca = ref('')
const dadosRelatorio = ref(null)
const competencia = ref(new Date().toISOString().slice(0, 7))

// Obtém os dados da equipe do enfermeiro logado
const equipeId = computed(() => storeUsuario.usuario?.equipeId)
const nomeEquipe = computed(() => storeUsuario.equipe?.nome || 'Não identificada')

// Formatação de dados para o template
const competenciaFormatada = computed(() => {
  if (!competencia.value) return ''
  const [ano, mes] = competencia.value.split('-')
  return `${mes}/${ano}`
})
const dataAtualFormatada = computed(() => new Date().toLocaleDateString('pt-BR'))

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    if (!equipeId.value) {
      throw new Error('Usuário não está associado a uma equipe.')
    }
    const dados = await servicoProducaoACS.buscarProducao(competencia.value, equipeId.value)
    if (!dados) {
      erroBusca.value = `Nenhuma produção de ACS encontrada para a equipe na competência ${competenciaFormatada.value}.`
      return
    }
    dadosRelatorio.value = dados
  } catch (error) {
    console.error('Erro ao gerar relatório de produção ACS:', error)
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}

// Mapeamento dos dados para o componente TabelaRelatorio
const dadosPuericultura = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.puericultura
  return [
    { item: 'Crianças Acompanhadas', valor: d.criancasAcompanhadas },
    { item: '1ª Consulta até 30 dias', valor: d.primeiraConsulta30dias },
    { item: 'Consultas no Mês', valor: d.consultasNoMes },
    { item: 'Consultas em Dia', valor: d.consultasEmDia },
  ]
})
const dadosAntropometria = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.avaliacaoAntropometrica
  return [
    { item: '1ª Verificação até 30 dias', valor: d.primeiraVerificacao30dias },
    { item: 'Verificações no Mês', valor: d.verificacoesNoMes },
    { item: 'Medições em Dia', valor: d.medicoesEmDia },
  ]
})
const dadosVisitas = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.visitasDomiciliares
  return [
    { item: '1ª Visita até 30 dias', valor: d.primeiraVisita30dias },
    { item: '2ª Visita Realizada', valor: d.segundaVisitaRealizada },
    { item: 'Visitas no Mês', valor: d.visitasNoMes },
  ]
})
const dadosVacinas = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.situacaoVacinal
  return [
    { item: 'Vacinação em Dia', valor: d.vacinacaoEmDia },
    { item: 'Vacinação Atrasada', valor: d.vacinacaoAtrasada },
    { item: 'Sem Informação', valor: d.semInformacao },
  ]
})
const dadosNascidos = computed(() => {
  if (!dadosRelatorio.value) return []
  const d = dadosRelatorio.value.nascidosNaMicroarea
  return [
    { item: 'Total de Nascidos', valor: d.total },
    { item: 'Com Cartão SUS', valor: d.comCartaoSus },
    { item: 'Sem Cartão SUS', valor: d.semCartaoSus },
    { item: 'Não Informado', valor: d.naoInformado },
  ]
})
</script>

<style scoped>
/* Estilos importados e adaptados de 'PaginaImpressaoSCNESAdmin.vue' */
@page {
  size: A4 portrait;
  margin: 1.5cm;
}
.conteudo-card.card-filtros {
  padding: 1.5rem;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
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
  min-width: 220px;
  height: 42px;
}
.pagina-a4 {
  background: white;
  width: 21cm;
  min-height: 29.7cm;
  padding: 1.5cm;
  margin: 2rem auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.borda-impressao {
  border: 1px solid #333;
}
.cabecalho-impressao {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
}
.cabecalho-impressao h3 {
  margin-top: 1rem;
  font-size: 12pt;
}
.info-cabecalho-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  text-align: left;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 9pt;
}
.corpo-impressao {
  padding-top: 1rem;
  flex: 1;
}
.titulo-secao-impressao {
  font-size: 10pt;
  text-align: left;
  margin: 1.5rem 0 0.5rem 0;
  font-weight: bold;
  background-color: #f2f2f2;
  padding: 4px;
  border: 1px solid #ccc;
}
.titulo-secao-impressao:first-of-type {
  margin-top: 0;
}
.grid-dados {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 9pt;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-top: none;
}
.texto-observacoes {
  font-size: 9pt;
  min-height: 50px;
  border: 1px solid #eee;
  padding: 0.5rem;
}
.rodape-impressao {
  display: flex;
  justify-content: space-around;
  padding-top: 3rem;
  font-size: 10pt;
  margin-top: auto;
}
.assinatura {
  text-align: center;
  width: 45%;
}
.linha-assinatura {
  margin-bottom: 2px;
}
.mensagem-feedback.erro {
  color: #b91c1c;
  background-color: #fee2e2;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background-color: #fff;
  }
  .pagina-a4 {
    margin: 0;
    box-shadow: none;
    border: none;
  }
}
</style>
