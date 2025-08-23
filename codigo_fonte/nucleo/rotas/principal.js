// producao-nova/codigo_fonte/nucleo/rotas/principal.js
import { createRouter, createWebHistory } from 'vue-router'
import PrincipalLayout from '@/nucleo/layouts/PrincipalLayout.vue'
import PaginaLogin from '@/nucleo/autenticacao/PaginaLogin.vue'
import { configurarGuardas } from './guardas'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: PaginaLogin,
  },
  {
    path: '/',
    component: PrincipalLayout,
    meta: { requerAutenticacao: true },
    children: [
      {
        path: '',
        name: 'Home',
        // Componente temporário, o guarda de rotas irá redirecionar
        component: { template: '<div>Carregando...</div>' },
      },
      // As rotas dos módulos (Admin, Gerente, etc.) serão adicionadas aqui depois.
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Configura os guardas de navegação
configurarGuardas(router)

export default router
