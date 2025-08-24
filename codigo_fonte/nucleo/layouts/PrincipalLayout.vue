<template>
  <div class="layout-horizontal">
    <header class="cabecalho-principal no-print">
      <div class="container-cabecalho">
        <div class="logo-area">
          <img src="/logo.png" alt="Logo Sistema de Saúde" class="logo" />
          <span class="nome-sistema">{{ tituloPainel }}</span>
        </div>

        <NavegacaoPrincipal v-if="storeUsuario.estaLogado" />

        <div class="acoes-usuario" v-if="storeUsuario.estaLogado">
          <span class="boas-vindas">Olá, {{ storeUsuario.usuario?.nome || 'Usuário' }}</span>
          <div class="avatar">
            <User :size="20" />
          </div>
          <button class="botao-icone" title="Sair" @click="fazerLogout">
            <LogOut :size="20" />
          </button>
        </div>
      </div>
    </header>

    <main class="conteudo-principal">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import { User, LogOut } from 'lucide-vue-next'
import NavegacaoPrincipal from '@/nucleo/componentes_comuns/NavegacaoPrincipal.vue'

const storeUsuario = useStoreUsuario()
const router = useRouter()

/**
 * Título do painel que se adapta ao perfil do usuário logado.
 * @returns {string} O título apropriado para o painel.
 */
const tituloPainel = computed(() => {
  if (storeUsuario.ehAdmin) return 'Painel do Administrador'
  if (storeUsuario.ehEnfermeiro) return 'Painel do Enfermeiro'
  if (storeUsuario.ehGerente) return 'Painel do Gerente'
  return 'Painel de Controle' // Título padrão
})

/**
 * @async
 * Realiza o logout do usuário e o redireciona para a página de login.
 */
async function fazerLogout() {
  await storeUsuario.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
/* Estilos originais e estáveis que você forneceu */
.layout-horizontal {
  background-color: var(--cor-fundo-pagina);
  min-height: 100vh;
}

.cabecalho-principal {
  background-color: var(--cor-primaria);
  color: var(--cor-texto-primario);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--altura-cabecalho);
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.container-cabecalho {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 1.5rem;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: white;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo-area .logo {
  height: 32px;
  width: auto;
}

.logo-area .nome-sistema {
  color: var(--cor-primaria);
  font-weight: 600;
  font-size: 1.1rem;
}

.acoes-usuario {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cor-texto-primario);
}

.botao-icone {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--cor-texto-primario);
  padding: 8px;
  border-radius: 50%;
  display: flex;
}

.botao-icone:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.conteudo-principal {
  padding-top: calc(var(--altura-cabecalho) + 2rem);
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 2rem;
}

/* [REMOVIDO] Bloco @media print removido para centralizar no CSS global */
</style>
