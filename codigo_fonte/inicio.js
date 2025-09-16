// producao-nova/codigo_fonte/inicio.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Aplicacao from './Aplicacao.vue'
import router from './nucleo/rotas/principal.js'
import { useStoreUsuario } from './nucleo/autenticacao/storeUsuario'

import './nucleo/estilos/principal.css'
import './nucleo/estilos/elementos-comuns.css'

const app = createApp(Aplicacao)
const pinia = createPinia()

app.use(pinia)

const storeUsuario = useStoreUsuario()

// MODIFICADO: A função init() agora recebe o 'router' como parâmetro
storeUsuario.init(router).then(() => {
  app.use(router)
  app.mount('#app')
})
