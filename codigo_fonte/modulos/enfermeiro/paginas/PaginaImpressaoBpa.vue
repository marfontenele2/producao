<template>
  <div class="no-print">
    <div class="pagina-container">
      <header class="pagina-cabecalho"><h1>Impressão: Boletim de Produção (BPA)</h1></header>
      <div class="card-filtros">
        <div class="campo">
          <label for="competencia">Selecione a Competência</label
          ><input type="month" id="competencia" v-model="competencia" />
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

  <div v-if="dadosRelatorio && storeUsuario.usuario" id="area-impressao">
    <div v-for="pagina in paginas" :key="`pagina-${pagina.numero}`" class="pagina-a4">
      <header class="cabecalho-bpa">
        <img src="/logo.png" alt="Logo Granja" class="logo-impressao" />
        <div class="titulo-bpa">
          <p>SISTEMA ÚNICO DE SAÚDE</p>
          <p>SISTEMA DE INFORMAÇÃO AMBULATORIAL - SIA/SUS</p>
          <h3>BOLETIM DE PRODUÇÃO AMBULATORIAL (INDIVIDUALIZADO)</h3>
        </div>
        <div class="folha-info">
          <p>FOLHA</p>
          <span>{{ pagina.numero }} / {{ totalPaginas }}</span>
        </div>
      </header>
      <section class="dados-operacionais">
        <div class="campo-operacional w-100">
          <strong>NOME DO ESTABELECIMENTO DE SAÚDE:</strong> {{ dadosCabecalho.nomeUbs }}
        </div>
        <div class="campo-operacional">
          <strong>EQUIPE:</strong> {{ dadosCabecalho.nomeEquipe }}
        </div>
        <div class="campo-operacional"><strong>CBO:</strong> {{ dadosCabecalho.cbo }}</div>
        <div class="campo-operacional w-100">
          <strong>COMPETÊNCIA:</strong> {{ competenciaFormatada }}
        </div>
      </section>
      <main class="corpo-bpa">
        <div
          v-for="(registro, index) in pagina.registros"
          :key="registro.id"
          class="bloco-registro-bpa"
        >
          <div class="campo-bpa seq">
            <strong>SEQ:</strong> {{ String((pagina.numero - 1) * 5 + index + 1).padStart(2, '0') }}
          </div>
          <div class="campo-bpa cns">
            <strong>NÚMERO DO CNS DO USUÁRIO:</strong> {{ registro.cnsPaciente }}
          </div>
          <div class="campo-bpa nome">
            <strong>NOME DO PACIENTE:</strong> {{ registro.nomePaciente }}
          </div>
          <div class="campo-bpa dt-nasc">
            <strong>DATA NASCIMENTO:</strong> {{ formatarData(registro.dataNascimento) }}
          </div>
          <div class="campo-bpa sexo"><strong>SEXO:</strong> {{ formatarSexo(registro.sexo) }}</div>
          <div class="campo-bpa ibge"><strong>COD. IBGE MUNIC. RESIDÊNCIA:</strong> 2304707</div>
          <div class="campo-bpa dt-atend">
            <strong>DATA DO ATENDIMENTO:</strong> {{ formatarData(registro.dataAtendimento) }}
          </div>
          <div class="campo-bpa proc">
            <strong>CÓDIGO PROCEDIMENTO:</strong> {{ obterCodigoProcedimento(registro) }}
          </div>
          <div class="campo-bpa qtd"><strong>QTD:</strong> 1</div>
          <div class="campo-bpa cid"><strong>CID-10:</strong> ---</div>
          <div class="campo-bpa car-atend"><strong>CAR. ATEND:</strong> 01</div>
          <div class="campo-bpa raca"><strong>RAÇA/COR:</strong> {{ registro.racaCor }}</div>
          <div class="campo-bpa autorizacao"><strong>NÚMERO DA AUTORIZAÇÃO:</strong> ---</div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { servicoBpa } from '@/modulos/enfermeiro/servicos/servicoBpa.js'
import { FileSearch, Printer } from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const competencia = ref('')
const buscando = ref(false)
const dadosRelatorio = ref(null)
const erroBusca = ref('')

const dadosCabecalho = computed(() => ({
  nomeUbs: storeUsuario.usuario?.nomeUbs || 'Não encontrado',
  nomeEquipe: storeUsuario.usuario?.nomeEquipe || 'Não encontrada',
  cbo: storeUsuario.usuario?.cbo || '223505 - ENFERMEIRO',
}))

const competenciaFormatada = computed(() => {
  if (!competencia.value) return '--/----'
  const [ano, mes] = competencia.value.split('-')
  return `${mes}/${ano}`
})

const paginas = computed(() => {
  if (!dadosRelatorio.value) return []
  const registrosPorPagina = 5
  const resultado = []
  for (let i = 0; i < dadosRelatorio.value.length; i += registrosPorPagina) {
    resultado.push({
      numero: i / registrosPorPagina + 1,
      registros: dadosRelatorio.value.slice(i, i + registrosPorPagina),
    })
  }
  return resultado
})

const totalPaginas = computed(() => paginas.value.length)

const mapaCodigos = {
  hiv: { gestante: '02.02.05.003-9', naoGestante: '02.02.05.004-7' },
  sifilis: { gestante: '02.02.05.005-5', naoGestante: '02.02.05.006-3' },
  hepB: { gestante: '02.02.05.007-1', naoGestante: '02.02.05.008-0' },
  hepC: { gestante: '02.02.05.009-8', naoGestante: '02.02.05.010-1' },
}

function obterCodigoProcedimento(registro) {
  if (!registro.tipoExame) return ''
  const tipo = registro.isGestante ? 'gestante' : 'naoGestante'
  return mapaCodigos[registro.tipoExame][tipo]
}

function formatarData(dataString) {
  if (!dataString) return '--/--/----'
  const [ano, mes, dia] = dataString.split('-')
  return `${dia}/${mes}/${ano}`
}

function formatarSexo(sexo) {
  if (sexo === 'M') return 'M (X) F ( )'
  if (sexo === 'F') return 'M ( ) F (X)'
  return 'M ( ) F ( )'
}

async function gerarRelatorio() {
  buscando.value = true
  erroBusca.value = ''
  dadosRelatorio.value = null
  try {
    const equipeId = storeUsuario.usuario.equipeId
    const dados = await servicoBpa.buscarDados(competencia.value, equipeId)
    if (dados && dados.length > 0) {
      dadosRelatorio.value = dados
    } else {
      erroBusca.value = `Nenhum registro de BPA encontrado para a competência selecionada.`
    }
  } catch (error) {
    console.error(error)
    erroBusca.value = 'Ocorreu um erro ao buscar os dados do relatório.'
  } finally {
    buscando.value = false
  }
}

function imprimirPagina() {
  window.print()
}
</script>

<style scoped>
/* ESTILOS DE IMPRESSÃO SEGUROS */
@media print {
  @page {
    size: landscape;
    margin: 0.5cm;
  }
}
.pagina-a4 {
  background: white;
  width: 29.7cm;
  height: auto;
  min-height: 18cm;
  padding: 1cm;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: black;
  box-sizing: border-box;
  font-family: 'Times New Roman', Times, serif;
  font-size: 9pt;
}
.corpo-bpa {
  flex-grow: 1;
}
/* Estilos restantes... */
.mensagem-feedback {
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  font-weight: 500;
  border-radius: 8px;
}
.erro {
  color: #b91c1c;
  background-color: #fee2e2;
}
.cabecalho-bpa {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 2px solid #000;
  padding-bottom: 0.5rem;
}
.logo-impressao {
  height: 50px;
}
.titulo-bpa {
  flex-grow: 1;
  text-align: center;
}
.titulo-bpa p {
  margin: 2px 0;
  font-size: 10pt;
}
.titulo-bpa h3 {
  margin: 4px 0;
  font-size: 11pt;
  font-weight: bold;
}
.folha-info {
  border: 1px solid #000;
  text-align: center;
  padding: 4px;
}
.folha-info p {
  margin: 0;
  font-size: 8pt;
}
.folha-info span {
  font-size: 12pt;
  font-weight: bold;
}
.dados-operacionais {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem 1rem;
  border-bottom: 2px solid #000;
  padding: 0.5rem 0;
}
.campo-operacional {
  font-size: 9pt;
}
.campo-operacional.w-100 {
  grid-column: 1 / -1;
}
.bloco-registro-bpa {
  border: 1px solid #333;
  margin-bottom: 0.5rem;
  padding: 0.25rem;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto;
  gap: 0 0.5rem;
  page-break-inside: avoid;
}
.campo-bpa {
  border-right: 1px solid #ccc;
  padding: 2px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.campo-bpa:last-child {
  border-right: none;
}
.campo-bpa strong {
  font-size: 7pt;
  display: block;
  color: #555;
}
.seq {
  grid-column: span 1;
}
.cns {
  grid-column: span 4;
}
.nome {
  grid-column: span 7;
  border-right: none;
}
.dt-nasc {
  grid-column: span 2;
}
.sexo {
  grid-column: span 2;
}
.ibge {
  grid-column: span 2;
}
.dt-atend {
  grid-column: span 2;
}
.proc {
  grid-column: span 2;
}
.qtd {
  grid-column: span 1;
  text-align: center;
}
.cid {
  grid-column: span 1;
}
.car-atend {
  grid-column: span 2;
}
.raca {
  grid-column: span 2;
}
.autorizacao {
  grid-column: span 6;
  border-right: none;
}
</style>
