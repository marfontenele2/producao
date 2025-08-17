import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useStatusProducaoStore } from "@/store/statusProducaoStore";
import { useNotificationStore } from "@/store/notificationStore";
import MainLayout from "@/layouts/MainLayout.vue";
import PrintLayout from "@/layouts/PrintLayout.vue";
import LoginPage from "@/pages/Auth/LoginPage.vue";

const rotasDeProducao = {
  Cronograma: "cronograma",
  Boletim: "boletim",
  GerenciarSCNES: "scnes",
  SaudeMental: "saudeMental",
  ProducaoAcs: "producaoAcs",
  Suplementos: "suplementos",
  EducacaoPermanente: "educacaoPermanente",
  Adolescente: "adolescente",
  Gestantes: "gestantes",
  Mdda: "mdda",
  NotificacaoSemanal: "notificacaoSemanal",
  Sarampo: "sarampo",
};

const routes = [
  { path: "/login", name: "Login", component: LoginPage },
  {
    path: "/imprimir",
    component: PrintLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "producao-acs/:competencia/:equipeId",
        name: "ProducaoAcsConsolidadoPrint",
        component: () =>
          import("@/pages/Imprimir/ProducaoConsolidadaAcsPrintPage.vue"),
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "suplementos/:competencia/:equipeId",
        name: "RelatorioSuplementosPrint",
        component: () =>
          import("@/pages/Imprimir/RelatorioSuplementosPrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "educacao-permanente/:competencia/:equipeId",
        name: "EducacaoPermanentePrint",
        component: () =>
          import("@/pages/Imprimir/EducacaoPermanentePrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "adolescente/:competencia/:equipeId",
        name: "AdolescentePrint",
        component: () => import("@/pages/Imprimir/AdolescentePrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "gestantes/:competencia/:equipeId",
        name: "GestantesPrint",
        component: () => import("@/pages/Imprimir/GestantesPrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "scnes/:competencia/:equipeId",
        name: "ScnesPrint",
        component: () => import("@/pages/Imprimir/ScnesPrintPage.vue"),
        props: true,
        meta: { roles: ["Gerente", "Administrador", "Coordenador"] },
      },
      {
        path: "saude-mental/:competencia/:equipeId",
        name: "SaudeMentalPrint",
        component: () => import("@/pages/Imprimir/SaudeMentalPrintPage.vue"),
        props: true,
        meta: { roles: ["Gerente", "Administrador", "Coordenador"] },
      },
      {
        path: "mdda/:competencia/:equipeId",
        name: "MddaPrint",
        component: () => import("@/pages/Imprimir/MddaPrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "notificacao-semanal/:competencia/:equipeId",
        name: "NotificacaoSemanalPrint",
        component: () =>
          import("@/pages/Imprimir/NotificacaoSemanalPrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      {
        path: "sarampo/:competencia/:equipeId",
        name: "SarampoPrint",
        component: () => import("@/pages/Imprimir/SarampoPrintPage.vue"),
        props: true,
        meta: {
          roles: ["Enfermeiro", "Gerente", "Administrador", "Coordenador"],
        },
      },
      // ROTAS DE IMPRESSÃO DO COORDENADOR
      {
        path: "coordenador/scnes",
        name: "CoordenadorScnesPrint",
        component: () =>
          import("@/pages/Imprimir/CoordenadorScnesPrintPage.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      {
        path: "coordenador/saude-mental",
        name: "CoordenadorSaudeMentalPrint",
        component: () =>
          import("@/pages/Imprimir/CoordenadorSaudeMentalPrintPage.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      {
        path: "coordenador/adolescente",
        name: "CoordenadorAdolescentePrint",
        component: () =>
          import("@/pages/Imprimir/CoordenadorAdolescentePrintPage.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
    ],
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "Home", component: { template: "<div></div>" } },
      {
        path: "dashboard/admin",
        name: "AdminDashboard",
        component: () => import("@/pages/Dashboards/AdminDashboard.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "dashboard/gerente",
        name: "GerenteDashboard",
        component: () => import("@/pages/Dashboards/GerenteDashboard.vue"),
        meta: { roles: ["Gerente", "Administrador"] },
      },
      {
        path: "dashboard/enfermeiro",
        name: "EnfermeiroDashboard",
        component: () => import("@/pages/Dashboards/EnfermeiroDashboard.vue"),
        meta: { roles: ["Enfermeiro"] },
      },
      // ✅ ROTA DO COORDENADOR NO LOCAL CORRETO
      {
        path: "dashboard/coordenador",
        name: "CoordenadorDashboard",
        component: () => import("@/pages/Dashboards/CoordenadorDashboard.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      // ROTAS ADICIONADAS PARA O COORDENADOR
      {
        path: "dashboard/coordenador/semanal",
        name: "CoordenadorDashboardSemanal",
        component: () =>
          import("@/pages/Dashboards/CoordenadorDashboardSemanal.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      {
        path: "coordenador/relatorios/mensal",
        name: "HubProducaoMensal",
        component: () => import("@/pages/Coordenador/HubProducaoMensal.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      {
        path: "coordenador/relatorios/semanal",
        name: "HubProducaoSemanal",
        component: () => import("@/pages/Coordenador/HubProducaoSemanal.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      // ... (demais rotas de admin, gerente e enfermeiro permanecem aqui)
      {
        path: "admin/ubs",
        name: "GerenciarUBS",
        component: () => import("@/pages/Admin/GerenciarUbsPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "admin/equipes",
        name: "GerenciarEquipes",
        component: () => import("@/pages/Admin/GerenciarEquipesPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "admin/usuarios",
        name: "GerenciarUsuarios",
        component: () => import("@/pages/Admin/GerenciarUsuariosPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "admin/prazos",
        name: "ControlePrazos",
        component: () => import("@/pages/Admin/ControlePrazosPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "admin/boletim/testes",
        name: "GerenciarTestesBoletim",
        component: () => import("@/pages/Admin/GerenciarTestesPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "admin/boletim/liberacoes",
        name: "GerenciarLiberacoesBoletim",
        component: () => import("@/pages/Admin/GerenciarLiberacoesPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "admin/boletim/relatorios",
        name: "BoletimRelatorios",
        component: () => import("@/pages/Admin/BoletimRelatoriosPage.vue"),
        meta: { roles: ["Administrador"] },
      },
      {
        path: "gerente/scnes",
        name: "GerenciarSCNES",
        component: () => import("@/pages/Gerente/SCNESPage.vue"),
        meta: { roles: ["Gerente", "Administrador"] },
      },
      {
        path: "gerente/saude-mental",
        name: "SaudeMental",
        component: () => import("@/pages/Gerente/SaudeMentalPage.vue"),
        meta: { roles: ["Gerente", "Administrador"] },
      },
      {
        path: "gerente/validacao-acs",
        name: "ValidacaoAcs",
        component: () => import("@/pages/Gerente/ValidacaoAcsPage.vue"),
        meta: { roles: ["Gerente", "Administrador"] },
      },
      {
        path: "cronograma",
        name: "Cronograma",
        component: () => import("@/pages/Enfermeiro/Gestao/CronogramaPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "boletim",
        name: "Boletim",
        component: () => import("@/pages/Enfermeiro/Boletim/BoletimPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "boletim/preencher/:testeId",
        name: "PreencherBoletim",
        component: () =>
          import("@/pages/Enfermeiro/Boletim/PreencherBoletimPage.vue"),
        props: true,
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/mensal/acs",
        name: "ProducaoAcs",
        component: () =>
          import("@/pages/Enfermeiro/ProducaoAcs/ProducaoAcsHubPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/mensal/acs/registrar",
        name: "ProducaoAcsRegistrar",
        component: () =>
          import("@/pages/Enfermeiro/ProducaoAcs/RegistrarProducaoAcsPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/mensal/acs/consolidar",
        name: "ProducaoAcsConsolidar",
        component: () =>
          import(
            "@/pages/Enfermeiro/ProducaoAcs/ConsolidarProducaoEquipePage.vue"
          ),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/suplementos",
        name: "Suplementos",
        component: () =>
          import("@/pages/Enfermeiro/Producao/SuplementosPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/educacao-permanente",
        name: "EducacaoPermanente",
        component: () =>
          import("@/pages/Enfermeiro/Producao/EducacaoPermanentePage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/adolescente",
        name: "Adolescente",
        component: () =>
          import("@/pages/Enfermeiro/Producao/AdolescentePage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/gestantes",
        name: "Gestantes",
        component: () =>
          import("@/pages/Enfermeiro/Producao/GestantesPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/semanal",
        name: "ProducaoSemanal",
        component: () =>
          import(
            "@/pages/Enfermeiro/ProducaoSemanal/ProducaoSemanalHubPage.vue"
          ),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/semanal/mdda",
        name: "Mdda",
        component: () =>
          import("@/pages/Enfermeiro/ProducaoSemanal/mdda/MddaPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/semanal/notificacao",
        name: "NotificacaoSemanal",
        component: () =>
          import(
            "@/pages/Enfermeiro/ProducaoSemanal/notificacao/NotificacaoSemanalPage.vue"
          ),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      {
        path: "producao/semanal/sarampo",
        name: "Sarampo",
        component: () =>
          import("@/pages/Enfermeiro/ProducaoSemanal/sarampo/SarampoPage.vue"),
        meta: { roles: ["Enfermeiro", "Administrador"] },
      },
      // ROTAS PARA OS RELATÓRIOS DETALHADOS
      {
        path: "coordenador/relatorios/scnes",
        name: "RelatorioScnes",
        component: () => import("@/pages/Coordenador/RelatorioScnesPage.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      {
        path: "coordenador/relatorios/saude-mental",
        name: "RelatorioSaudeMental",
        component: () =>
          import("@/pages/Coordenador/RelatorioSaudeMentalPage.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
      {
        path: "coordenador/relatorios/adolescente",
        name: "RelatorioAdolescente",
        component: () =>
          import("@/pages/Coordenador/RelatorioAdolescentePage.vue"),
        meta: { roles: ["Coordenador", "Administrador"] },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn && to.name !== "Login") {
    return next({ name: "Login" });
  }
  if (to.name === "Login" && userStore.isLoggedIn) {
    return next({ name: "Home" });
  }
  if (to.name === "Home" && userStore.isLoggedIn) {
    const userRole = userStore.user?.role;
    if (userRole === "Administrador")
      return next({ name: "AdminDashboard", replace: true });
    if (userRole === "Gerente")
      return next({ name: "GerenteDashboard", replace: true });
    if (userRole === "Enfermeiro")
      return next({ name: "EnfermeiroDashboard", replace: true });
    if (userRole === "Coordenador")
      return next({ name: "CoordenadorDashboard", replace: true });
  }
  const moduloId = rotasDeProducao[to.name];
  if (userStore.user && moduloId) {
    const statusStore = useStatusProducaoStore();
    const notificationStore = useNotificationStore();
    const statusInfo = statusStore.getStatus(moduloId).value;
    if (userStore.isEnfermeiro && !statusInfo.isAberto) {
      notificationStore.showNotification(
        `O acesso a esta produção está ${statusInfo.texto.toLowerCase()}.`,
        "warning"
      );
      return next(from.name ? false : { name: "EnfermeiroDashboard" });
    }
  }
  next();
});

export default router;
