// producao-nova/codigo_fonte/inicio.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Aplicacao from './Aplicacao.vue'
import router from './nucleo/rotas/principal.js'
import { useStoreUsuario } from './nucleo/autenticacao/storeUsuario'

const app = createApp(Aplicacao)
const pinia = createPinia()

app.use(pinia)

// Ponto crucial: Inicializa a store ANTES de montar o app.
// Isso garante que o estado de autenticação seja verificado antes dos guardas de rota rodarem.
const storeUsuario = useStoreUsuario()
storeUsuario.init().then(() => {
  app.use(router)
  app.mount('#app')
})
