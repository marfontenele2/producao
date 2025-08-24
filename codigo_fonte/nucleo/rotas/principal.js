import { createRouter, createWebHistory } from 'vue-router'
import PrincipalLayout from '@/nucleo/layouts/PrincipalLayout.vue'
import PaginaLogin from '@/nucleo/autenticacao/PaginaLogin.vue'
import { configurarGuardas } from './guardas'

// --- ADIÇÃO CIRÚRGICA ---
import PaginaCarregando from '@/nucleo/componentes_comuns/PaginaCarregando.vue'

// Import das páginas do Administrador
import DashboardAdmin from '@/modulos/administrador/paginas/DashboardAdmin.vue'
import GerenciarUbsPage from '@/modulos/administrador/paginas/GerenciarUbsPage.vue'
import PaginaGerenciarUsuarios from '@/modulos/administrador/paginas/PaginaGerenciarUsuarios.vue'
import PaginaGerenciarEquipes from '@/modulos/administrador/paginas/PaginaGerenciarEquipes.vue'
import PaginaControlePrazos from '@/modulos/administrador/paginas/PaginaControlePrazos.vue'
import PaginaGerenciarTestes from '@/modulos/administrador/paginas/PaginaGerenciarTestes.vue'
import PaginaGerenciarLiberacoes from '@/modulos/administrador/paginas/PaginaGerenciarLiberacoes.vue'
import PaginaRelatoriosBoletim from '@/modulos/administrador/paginas/PaginaRelatoriosBoletim.vue'
import PaginaControleEstoque from '@/modulos/administrador/paginas/PaginaControleEstoque.vue'
import PaginaSaudeSistema from '@/modulos/administrador/paginas/PaginaSaudeSistema.vue'
import PaginaLogAtividades from '@/modulos/administrador/paginas/PaginaLogAtividades.vue'

// Import das páginas do Enfermeiro
const PaginaDiagnosticoPrazos = () =>
  import('@/modulos/enfermeiro/paginas/PaginaDiagnosticoPrazos.vue')
const PaginaProducaoMensal = () => import('@/modulos/enfermeiro/paginas/PaginaProducaoMensal.vue')
const PaginaProducaoSemanal = () => import('@/modulos/enfermeiro/paginas/PaginaProducaoSemanal.vue')
const PaginaSaudeAdolescente = () =>
  import('@/modulos/enfermeiro/paginas/PaginaSaudeAdolescente.vue')
const PaginaImpressoes = () => import('@/modulos/enfermeiro/paginas/PaginaImpressoes.vue')
const PaginaImpressaoAdolescente = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoAdolescente.vue')
const PaginaSuplementos = () => import('@/modulos/enfermeiro/paginas/PaginaSuplementos.vue')
const PaginaImpressaoSuplementos = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoSuplementos.vue')

const PaginaEmConstrucao = () => import('@/modulos/enfermeiro/paginas/PaginaEmConstrucao.vue')
const PaginaBpa = () => import('@/modulos/enfermeiro/paginas/PaginaBpa.vue')
const PaginaImpressaoBpa = () => import('@/modulos/enfermeiro/paginas/PaginaImpressaoBpa.vue')

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
        // --- CORREÇÃO APLICADA ---
        component: PaginaCarregando,
      },
      // ... resto das suas rotas ...
      {
        path: 'admin/dashboard',
        name: 'DashboardAdmin',
        component: DashboardAdmin,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/ubs',
        name: 'AdminGerenciarUbs',
        component: GerenciarUbsPage,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/usuarios',
        name: 'AdminGerenciarUsuarios',
        component: PaginaGerenciarUsuarios,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/equipes',
        name: 'AdminGerenciarEquipes',
        component: PaginaGerenciarEquipes,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/prazos',
        name: 'AdminControlePrazos',
        component: PaginaControlePrazos,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/boletim/testes',
        name: 'AdminGerenciarTestes',
        component: PaginaGerenciarTestes,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/boletim/liberacoes',
        name: 'AdminGerenciarLiberacoes',
        component: PaginaGerenciarLiberacoes,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/boletim/relatorios',
        name: 'AdminRelatoriosBoletim',
        component: PaginaRelatoriosBoletim,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/estoque',
        name: 'AdminControleEstoque',
        component: PaginaControleEstoque,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/saude-sistema',
        name: 'AdminSaudeSistema',
        component: PaginaSaudeSistema,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/logs',
        name: 'AdminLogAtividades',
        component: PaginaLogAtividades,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'enfermeiro/producao-mensal',
        name: 'EnfermeiroProducaoMensal',
        component: PaginaProducaoMensal,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-semanal',
        name: 'EnfermeiroProducaoSemanal',
        component: PaginaProducaoSemanal,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/saude-adolescente',
        name: 'EnfermeiroSaudeAdolescente',
        component: PaginaSaudeAdolescente,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/suplementos',
        name: 'EnfermeiroSuplementos',
        component: PaginaSuplementos,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/bpa',
        name: 'EnfermeiroBpa',
        component: PaginaBpa,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes',
        name: 'EnfermeiroImpressoes',
        component: PaginaImpressoes,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes/adolescente',
        name: 'EnfermeiroImpressaoAdolescente',
        component: PaginaImpressaoAdolescente,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes/suplementos',
        name: 'EnfermeiroImpressaoSuplementos',
        component: PaginaImpressaoSuplementos,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes/bpa',
        name: 'EnfermeiroImpressaoBpa',
        component: PaginaImpressaoBpa,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/educacao-permanente',
        name: 'EnfermeiroEducacaoPermanente',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/gestantes',
        name: 'EnfermeiroAcompanhamentoGestantes',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/boletim',
        name: 'EnfermeiroBoletim',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-semanal/mdda',
        name: 'EnfermeiroMDDA',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-semanal/notificacao',
        name: 'EnfermeiroNotificacaoSemanal',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-semanal/sarampo',
        name: 'EnfermeiroSarampo',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/mural',
        name: 'EnfermeiroMural',
        component: PaginaEmConstrucao,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'diagnostico/prazos',
        name: 'DiagnosticoPrazos',
        component: PaginaDiagnosticoPrazos,
        meta: { roles: ['Administrador', 'Enfermeiro'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

configurarGuardas(router)

export default router
