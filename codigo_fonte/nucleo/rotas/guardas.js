// producao-nova/codigo_fonte/nucleo/rotas/guardas.js
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

/**
 * Configura os guardas de navegação globais para o roteador.
 * @param {import('vue-router').Router} router - A instância do Vue Router.
 */
export function configurarGuardas(router) {
  router.beforeEach((to, from, next) => {
    const storeUsuario = useStoreUsuario()

    const requerAutenticacao = to.matched.some((record) => record.meta.requerAutenticacao)

    if (requerAutenticacao && !storeUsuario.estaLogado) {
      // Se a rota exige login e o usuário não está logado, redireciona para o login
      next({ name: 'Login' })
    } else if (to.name === 'Login' && storeUsuario.estaLogado) {
      // Se o usuário já está logado e tenta acessar o login, redireciona para a home
      next({ name: 'Home' })
    } else if (to.name === 'Home' && storeUsuario.estaLogado) {
      // Redireciona da Home para o dashboard correto com base no perfil
      const perfil = storeUsuario.usuario?.role
      if (perfil === 'Administrador') return next({ name: 'DashboardAdmin', replace: true })
      // Adicionar outros perfis aqui no futuro...
      // if (perfil === 'Gerente') return next({ name: 'DashboardGerente', replace: true });

      // Fallback caso não tenha um dashboard definido
      next()
    } else {
      // Em todos os outros casos, permite a navegação
      next()
    }
  })
}
