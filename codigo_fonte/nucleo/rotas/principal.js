// codigo_fonte/nucleo/rotas/principal.js

import { createRouter, createWebHistory } from 'vue-router'
import PrincipalLayout from '@/nucleo/layouts/PrincipalLayout.vue'
import PaginaLogin from '@/nucleo/autenticacao/PaginaLogin.vue'
import { configurarGuardas } from './guardas'

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
import PaginaEntradaEstoque from '@/modulos/administrador/paginas/PaginaEntradaEstoque.vue'
import PaginaGerenciarSolicitacoes from '@/modulos/administrador/paginas/PaginaGerenciarSolicitacoes.vue'
import PaginaSaudeSistema from '@/modulos/administrador/paginas/PaginaSaudeSistema.vue'
import PaginaLogAtividades from '@/modulos/administrador/paginas/PaginaLogAtividades.vue'
import PaginaRelatorioSisloglab from '@/modulos/administrador/paginas/PaginaRelatorioSisloglab.vue'
import PaginaAcompanhamentoSemanal from '@/modulos/administrador/paginas/PaginaAcompanhamentoSemanal.vue'
import PaginaAcompanhamentoMensal from '@/modulos/administrador/paginas/PaginaAcompanhamentoMensal.vue'
import PaginaImpressoesAdmin from '@/modulos/administrador/paginas/PaginaImpressoesAdmin.vue'
import PaginaImpressaoMDDAAdmin from '@/modulos/administrador/paginas/PaginaImpressaoMDDAAdmin.vue'
import PaginaImpressaoNotificacaoAdmin from '@/modulos/administrador/paginas/PaginaImpressaoNotificacaoAdmin.vue'
import PaginaImpressaoSarampoAdmin from '@/modulos/administrador/paginas/PaginaImpressaoSarampoAdmin.vue'
import PaginaImpressaoSCNESAdmin from '@/modulos/administrador/paginas/PaginaImpressaoSCNESAdmin.vue'

// Import das páginas do Gerente
import PaginaProducaoGerente from '@/modulos/gerente/paginas/PaginaProducaoGerente.vue'
import PaginaGerenciarSCNES from '@/modulos/gerente/paginas/PaginaGerenciarSCNES.vue'
import PaginaSaudeMental from '@/modulos/gerente/paginas/PaginaSaudeMental.vue'
import PaginaImpressoesGerente from '@/modulos/gerente/paginas/PaginaImpressoesGerente.vue'
import PaginaImpressaoSCNES from '@/modulos/gerente/paginas/PaginaImpressaoSCNES.vue'
import PaginaImpressaoSaudeMental from '@/modulos/gerente/paginas/PaginaImpressaoSaudeMental.vue'
import PaginaImpressaoSaudeMentalAdmin from '@/modulos/administrador/paginas/PaginaImpressaoSaudeMentalAdmin.vue'

// Import das páginas do Enfermeiro
const PaginaEmConstrucao = () => import('@/modulos/enfermeiro/paginas/PaginaEmConstrucao.vue')
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
const PaginaBpa = () => import('@/modulos/enfermeiro/paginas/PaginaBpa.vue')
const PaginaImpressaoBpa = () => import('@/modulos/enfermeiro/paginas/PaginaImpressaoBpa.vue')
const PaginaEducacaoPermanente = () =>
  import('@/modulos/enfermeiro/paginas/PaginaEducacaoPermanente.vue')
const PaginaImpressaoEducacaoPermanente = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoEducacaoPermanente.vue')
const PaginaAcompanhamentoGestantes = () =>
  import('@/modulos/enfermeiro/paginas/PaginaAcompanhamentoGestantes.vue')
const PaginaImpressaoGestantes = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoGestantes.vue')
const PaginaBoletim = () => import('@/modulos/enfermeiro/paginas/PaginaBoletim.vue')
const PaginaPreencherBoletim = () =>
  import('@/modulos/enfermeiro/paginas/PaginaPreencherBoletim.vue')
const PaginaImpressaoBoletim = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoBoletim.vue')
const PaginaSolicitarInsumos = () =>
  import('@/modulos/enfermeiro/paginas/PaginaSolicitarInsumos.vue')
const PaginaMDDA = () => import('@/modulos/enfermeiro/paginas/PaginaMDDA.vue')
const PaginaNotificacaoSemanal = () =>
  import('@/modulos/enfermeiro/paginas/PaginaNotificacaoSemanal.vue')
const PaginaSarampo = () => import('@/modulos/enfermeiro/paginas/PaginaSarampo.vue')
const PaginaImpressaoMDDA = () => import('@/modulos/enfermeiro/paginas/PaginaImpressaoMDDA.vue')
const PaginaImpressaoNotificacao = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoNotificacao.vue')
const PaginaImpressaoSarampo = () =>
  import('@/modulos/enfermeiro/paginas/PaginaImpressaoSarampo.vue')

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
      { path: '', name: 'Home', component: PaginaCarregando },

      // --- ROTAS DO ADMINISTRADOR E COORDENADOR ---
      {
        path: 'admin/dashboard',
        name: 'DashboardAdmin',
        component: DashboardAdmin,
        meta: { roles: ['Administrador'] },
      },
      {
        path: 'admin/producao/acompanhamento-semanal',
        name: 'AdminAcompanhamentoSemanal',
        component: PaginaAcompanhamentoSemanal,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Acompanhamento Semanal',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/producao/acompanhamento-mensal',
        name: 'AdminAcompanhamentoMensal',
        component: PaginaAcompanhamentoMensal,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Acompanhamento Mensal',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/producao/impressoes',
        name: 'AdminImpressoes',
        component: PaginaImpressoesAdmin,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Central de Impressões (Admin)',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/producao/impressoes/mdda',
        name: 'AdminImpressaoMDDA',
        component: PaginaImpressaoMDDAAdmin,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Impressão Consolidada - MDDA',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/impressoes/scnes',
        name: 'AdminImpressaoSCNES',
        component: PaginaImpressaoSCNESAdmin,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Impressão Consolidada - SCNES',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/impressoes/saude-mental',
        name: 'AdminImpressaoSaudeMental',
        component: PaginaImpressaoSaudeMentalAdmin,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Impressão Consolidada - Saúde Mental',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/ubs',
        name: 'AdminGerenciarUbs',
        component: GerenciarUbsPage,
        meta: { roles: ['Administrador'], menuPai: 'cadastros' },
      },
      {
        path: 'admin/equipes',
        name: 'AdminGerenciarEquipes',
        component: PaginaGerenciarEquipes,
        meta: { roles: ['Administrador'], menuPai: 'cadastros' },
      },
      {
        path: 'admin/usuarios',
        name: 'AdminGerenciarUsuarios',
        component: PaginaGerenciarUsuarios,
        meta: { roles: ['Administrador'], menuPai: 'cadastros' },
      },
      {
        path: 'admin/boletim/testes',
        name: 'AdminGerenciarTestes',
        component: PaginaGerenciarTestes,
        meta: { roles: ['Administrador'], menuPai: 'testes' },
      },
      {
        path: 'admin/boletim/liberacoes',
        name: 'AdminGerenciarLiberacoes',
        component: PaginaGerenciarLiberacoes,
        meta: { roles: ['Administrador'], menuPai: 'testes' },
      },
      {
        path: 'admin/boletim/relatorios',
        name: 'AdminRelatoriosBoletim',
        component: PaginaRelatoriosBoletim,
        meta: { roles: ['Administrador'], menuPai: 'testes' },
      },
      {
        path: 'admin/relatorios/sisloglab',
        name: 'AdminRelatorioSisloglab',
        component: PaginaRelatorioSisloglab,
        meta: {
          roles: ['Administrador'],
          titulo: 'Relatório Consolidado SISLOGLAB',
          menuPai: 'testes',
        },
      },
      {
        path: 'admin/estoque',
        name: 'AdminControleEstoque',
        component: PaginaControleEstoque,
        meta: { roles: ['Administrador'], menuPai: 'estoque' },
      },
      {
        path: 'admin/estoque/entrada',
        name: 'AdminEntradaEstoque',
        component: PaginaEntradaEstoque,
        meta: {
          roles: ['Administrador'],
          titulo: 'Entrada de Lote no Estoque',
          menuPai: 'estoque',
        },
      },
      {
        path: 'admin/estoque/solicitacoes',
        name: 'AdminGerenciarSolicitacoes',
        component: PaginaGerenciarSolicitacoes,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Gerenciar Solicitações',
          menuPai: 'estoque',
        },
      },
      {
        path: 'admin/saude-sistema',
        name: 'AdminSaudeSistema',
        component: PaginaSaudeSistema,
        meta: { roles: ['Administrador'], menuPai: 'manutencao' },
      },
      {
        path: 'admin/logs',
        name: 'AdminLogAtividades',
        component: PaginaLogAtividades,
        meta: { roles: ['Administrador'], menuPai: 'manutencao' },
      },
      {
        path: 'admin/prazos',
        name: 'AdminControlePrazos',
        component: PaginaControlePrazos,
        meta: { roles: ['Administrador'], menuPai: 'configuracoes' },
      },
      {
        path: 'admin/producao/impressoes/notificacao-semanal',
        name: 'AdminImpressaoNotificacao',
        component: PaginaImpressaoNotificacaoAdmin,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Impressão Consolidada - Notificação',
          menuPai: 'producao',
        },
      },
      {
        path: 'admin/producao/impressoes/sarampo',
        name: 'AdminImpressaoSarampo',
        component: PaginaImpressaoSarampoAdmin,
        meta: {
          roles: ['Administrador', 'Coordenador'],
          titulo: 'Impressão Consolidada - Sarampo',
          menuPai: 'producao',
        },
      },

      // --- ROTAS DO GERENTE ---
      {
        path: 'gerente/producao',
        name: 'GerenteProducao',
        component: PaginaProducaoGerente,
        meta: { roles: ['Gerente'], titulo: 'Painel de Produção', menuPai: 'producao' },
      },
      {
        path: 'gerente/scnes',
        name: 'GerenteGerenciarSCNES',
        component: PaginaGerenciarSCNES,
        meta: { roles: ['Gerente'], titulo: 'Gerenciar Profissionais SCNES', menuPai: 'producao' },
      },
      {
        path: 'gerente/saude-mental',
        name: 'GerenteSaudeMental',
        component: PaginaSaudeMental,
        meta: { roles: ['Gerente'], titulo: 'Acompanhamento de Saúde Mental', menuPai: 'producao' },
      },
      {
        path: 'gerente/impressoes',
        name: 'GerenteImpressoes',
        component: PaginaImpressoesGerente,
        meta: { roles: ['Gerente'], titulo: 'Central de Impressões', menuPai: 'impressoes' },
      },
      {
        path: 'gerente/impressoes/scnes',
        name: 'GerenteImpressaoSCNES',
        component: PaginaImpressaoSCNES,
        meta: { roles: ['Gerente'], titulo: 'Impressão do Relatório SCNES', menuPai: 'impressoes' },
      },
      {
        path: 'gerente/impressoes/saude-mental',
        name: 'GerenteImpressaoSaudeMental',
        component: PaginaImpressaoSaudeMental,
        meta: { roles: ['Gerente'], titulo: 'Impressão - Saúde Mental', menuPai: 'impressoes' },
      },
      // --- ROTAS DO ENFERMEIRO ---
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
        path: 'enfermeiro/producao-mensal/educacao-permanente',
        name: 'EnfermeiroEducacaoPermanente',
        component: PaginaEducacaoPermanente,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-mensal/gestantes',
        name: 'EnfermeiroAcompanhamentoGestantes',
        component: PaginaAcompanhamentoGestantes,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes',
        name: 'EnfermeiroImpressoes',
        component: PaginaImpressoes,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes/boletim-testes-rapidos',
        name: 'EnfermeiroImpressaoBoletim',
        component: PaginaImpressaoBoletim,
        meta: { roles: ['Enfermeiro'], titulo: 'Impressão do Boletim de Testes' },
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
        path: 'enfermeiro/impressoes/educacao-permanente',
        name: 'EnfermeiroImpressaoEducacaoPermanente',
        component: PaginaImpressaoEducacaoPermanente,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes/gestantes',
        name: 'EnfermeiroImpressaoGestantes',
        component: PaginaImpressaoGestantes,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/impressoes/mdda',
        name: 'EnfermeiroImpressaoMDDA',
        component: PaginaImpressaoMDDA,
        meta: { roles: ['Enfermeiro'], titulo: 'Impressão do Relatório MDDA' },
      },
      {
        path: 'enfermeiro/impressoes/notificacao-semanal',
        name: 'EnfermeiroImpressaoNotificacao',
        component: PaginaImpressaoNotificacao,
        meta: { roles: ['Enfermeiro'], titulo: 'Impressão da Notificação Semanal' },
      },
      {
        path: 'enfermeiro/impressoes/sarampo',
        name: 'EnfermeiroImpressaoSarampo',
        component: PaginaImpressaoSarampo,
        meta: { roles: ['Enfermeiro'], titulo: 'Impressão do Controle de Sarampo' },
      },
      {
        path: 'enfermeiro/producao-mensal/boletim',
        name: 'EnfermeiroBoletim',
        component: PaginaBoletim,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/producao-semanal/mdda',
        name: 'EnfermeiroMDDA',
        component: PaginaMDDA,
        meta: { roles: ['Enfermeiro'], titulo: 'Produção MDDA' },
      },
      {
        path: 'enfermeiro/producao-semanal/notificacao',
        name: 'EnfermeiroNotificacaoSemanal',
        component: PaginaNotificacaoSemanal,
        meta: { roles: ['Enfermeiro'], titulo: 'Notificação Semanal' },
      },
      {
        path: 'enfermeiro/producao-semanal/sarampo',
        name: 'EnfermeiroSarampo',
        component: PaginaSarampo,
        meta: { roles: ['Enfermeiro'], titulo: 'Controle de Sarampo/Rubéola' },
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
      {
        path: 'enfermeiro/producao-mensal/boletim/:competencia/:testeId',
        name: 'EnfermeiroPreencherBoletim',
        component: PaginaPreencherBoletim,
        meta: { roles: ['Enfermeiro'] },
      },
      {
        path: 'enfermeiro/insumos/solicitar',
        name: 'EnfermeiroSolicitarInsumos',
        component: PaginaSolicitarInsumos,
        meta: { roles: ['Enfermeiro'], titulo: 'Solicitar Insumos' },
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
