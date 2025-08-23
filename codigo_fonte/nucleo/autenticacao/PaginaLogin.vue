<template>
  <div class="login-container">
    <div class="login-box">
      <img src="/logo.png" alt="Logo" class="logo" />
      <h2>Controle de Produção</h2>
      <form @submit.prevent="fazerLogin">
        <div class="input-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="senha" required />
        </div>
        <p v-if="erro" class="error-message">{{ erro }}</p>
        <button type="submit" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const storeUsuario = useStoreUsuario()
const router = useRouter()

/**
 * Tenta autenticar o usuário e redireciona em caso de sucesso.
 */
async function fazerLogin() {
  erro.value = ''
  carregando.value = true
  try {
    await storeUsuario.login(email.value, senha.value)
    router.push('/')
  } catch (e) {
    erro.value = 'E-mail ou senha inválidos.'
    console.error('Erro de login:', e)
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f4f4;
}
.login-box {
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}
.logo {
  max-width: 150px;
  margin-bottom: 20px;
}
.input-group {
  margin-bottom: 20px;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:disabled {
  background-color: #a0c3e6;
}
.error-message {
  color: #dc3545;
  margin-bottom: 15px;
}
</style>
