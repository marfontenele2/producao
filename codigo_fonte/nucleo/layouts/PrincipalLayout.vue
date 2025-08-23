<template>
  <div class="layout-principal">
    <aside class="barra-lateral">
      <div class="logo-area">
        <img src="/logo.png" alt="Logo" class="logo" />
      </div>
      <nav>
        <p>Navegação Principal</p>
      </nav>
    </aside>
    <main class="conteudo-principal">
      <header class="cabecalho">
        <div></div>
        <div class="info-usuario">
          <span>Olá, {{ storeUsuario.usuario?.nome }}</span>
          <button @click="fazerLogout">Sair</button>
        </div>
      </header>
      <div class="area-da-pagina">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

const storeUsuario = useStoreUsuario()
const router = useRouter()

/**
 * Executa o logout e redireciona para a página de login.
 */
async function fazerLogout() {
  await storeUsuario.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.layout-principal {
  display: flex;
  height: 100vh;
}
.barra-lateral {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}
.logo-area {
  padding: 10px;
  text-align: center;
  background-color: #fff;
}
.logo {
  max-width: 100%;
  height: auto;
}
.conteudo-principal {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}
.area-da-pagina {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #f4f6f9;
}
</style>
