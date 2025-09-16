import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'

export function configurarGuardas(router) {
  router.beforeEach((to, from, next) => {
    const storeUsuario = useStoreUsuario()
    const requerAutenticacao = to.matched.some((record) => record.meta.requerAutenticacao)

    if (requerAutenticacao && !storeUsuario.estaLogado) {
      next({ name: 'Login' })
    } else if (to.name === 'Login' && storeUsuario.estaLogado) {
      next({ name: 'Home' })
    } else if (to.name === 'Home' && storeUsuario.estaLogado) {
      const perfil = storeUsuario.usuario?.role

      if (perfil === 'Administrador') {
        return next({ name: 'AdminAcompanhamentoSemanal', replace: true })
      }
      // ADICIONADO: Redirecionamento para o perfil de Coordenador
      else if (perfil === 'Coordenador') {
        // Direciona para a mesma página inicial do Admin
        return next({ name: 'AdminAcompanhamentoSemanal', replace: true })
      } else if (perfil === 'Enfermeiro') {
        return next({ name: 'EnfermeiroProducaoSemanal', replace: true })
      } else if (perfil === 'Gerente') {
        return next({ name: 'GerenteProducao', replace: true })
      }

      next()
    } else {
      next()
    }
  })
}
