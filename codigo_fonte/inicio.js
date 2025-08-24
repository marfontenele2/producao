// producao-nova/codigo_fonte/inicio.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Aplicacao from './Aplicacao.vue'
import router from './nucleo/rotas/principal.js'
import { useStoreUsuario } from './nucleo/autenticacao/storeUsuario'

import './nucleo/estilos/principal.css'
// --- ADIÇÃO CIRÚRGICA ABAIXO ---
import './nucleo/estilos/elementos-comuns.css'
// -------------------------

const app = createApp(Aplicacao)
const pinia = createPinia()

app.use(pinia)

const storeUsuario = useStoreUsuario()
storeUsuario.init().then(() => {
  app.use(router)
  app.mount('#app')
})
