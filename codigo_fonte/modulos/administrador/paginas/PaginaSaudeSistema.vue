<template>
  <div class="pagina-container">
    <header class="pagina-cabecalho">
      <h1>Saúde do Sistema</h1>
      <button class="botao botao-primario" @click="verificar" :disabled="carregando">
        <RefreshCw :size="18" class="icone-giratorio" v-if="carregando" />
        <span v-else>Verificar Integridade dos Dados</span>
      </button>
    </header>

    <div v-if="!resultado" class="mensagem-inicial">
      <p>
        Clique no botão acima para iniciar uma verificação completa da integridade dos dados do
        sistema.
      </p>
      <p>
        A verificação procura por inconsistências como usuários ou equipes vinculados a registros
        que não existem mais.
      </p>
    </div>

    <div v-if="resultado" class="grid-diagnostico">
      <div class="conteudo-card">
        <h3>Resumo Geral</h3>
        <ul class="lista-resumo">
          <li><strong>Usuários Cadastrados:</strong> {{ resultado.totalUsuarios }}</li>
          <li><strong>Equipes Cadastradas:</strong> {{ resultado.totalEquipes }}</li>
          <li><strong>UBS Cadastradas:</strong> {{ resultado.totalUbs }}</li>
        </ul>
      </div>

      <div class="conteudo-card">
        <h3>Usuários com Vínculos Quebrados (Órfãos)</h3>
        <p v-if="resultado.usuariosOrfaos.length === 0" class="sem-problemas">
          <CheckCircle2 :size="18" /> Nenhum problema encontrado.
        </p>
        <table v-else class="tabela-padrao">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Vínculo Quebrado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in resultado.usuariosOrfaos" :key="user.id">
              <td>{{ user.nome }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span v-if="user.ubsId_invalido">UBS ID: {{ user.ubsId_invalido }}</span>
                <span v-if="user.equipeId_invalido">Equipe ID: {{ user.equipeId_invalido }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="conteudo-card">
        <h3>Equipes Vinculadas a UBS Inexistentes</h3>
        <p v-if="resultado.equipesOrfas.length === 0" class="sem-problemas">
          <CheckCircle2 :size="18" /> Nenhum problema encontrado.
        </p>
        <table v-else class="tabela-padrao">
          <thead>
            <tr>
              <th>Nome da Equipe</th>
              <th>ID da UBS Inválido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipe in resultado.equipesOrfas" :key="equipe.id">
              <td>{{ equipe.nome }}</td>
              <td>{{ equipe.ubsId_invalido }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { servicoDiagnostico } from '../servicos/servicoDiagnostico.js'
import { RefreshCw, CheckCircle2 } from 'lucide-vue-next'

const carregando = ref(false)
const resultado = ref(null)

async function verificar() {
  carregando.value = true
  resultado.value = null
  try {
    resultado.value = await servicoDiagnostico.verificarIntegridade()
  } catch (error) {
    console.error('Falha ao verificar saúde do sistema:', error)
    alert('Não foi possível completar a verificação.')
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.mensagem-inicial {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: #475569;
}
.grid-diagnostico {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
.lista-resumo {
  list-style: none;
  padding: 0;
}
.lista-resumo li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--cor-borda-suave);
}
.lista-resumo li:last-child {
  border-bottom: none;
}
.sem-problemas {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #16a34a; /* Verde */
  font-weight: 500;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.icone-giratorio {
  animation: spin 1s linear infinite;
}
</style>
