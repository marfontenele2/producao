<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login do Sistema</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" v-model="email" id="email" required />
        </div>
        <div class="input-group">
          <label for="password">Senha</label>
          <input type="password" v-model="password" id="password" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useNotificationStore } from '@/store/notificationStore';

const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();
const notification = useNotificationStore();

const handleLogin = async () => {
  loading.value = true;
  try {
    await userStore.login(email.value, password.value);
    notification.showNotification('Login realizado com sucesso!', 'success');
    router.push('/');
  } catch (error) {
    console.error("Erro de login:", error.code);
    const message = error.code === 'auth/invalid-credential' 
      ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
      : 'Ocorreu um erro ao tentar fazer login.';
    notification.showNotification(message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-box {
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h2 {
  margin-bottom: 24px;
}
.input-group {
  margin-bottom: 20px;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #001529;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  &:hover {
    background-color: #002140;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
</style>
