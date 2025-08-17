// 📄 ARQUIVO: src/main.js (Versão Definitiva)
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { useUserStore } from "./store/userStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// A store precisa ser inicializada ANTES do router,
// para que a guarda de navegação (beforeEach) já encontre o estado do usuário.
const userStore = useUserStore();
userStore.init().then(() => {
  // Só depois que o estado inicial do usuário for conhecido,
  // nós usamos o router e montamos a aplicação.
  app.use(router);
  app.mount("#app");
});
