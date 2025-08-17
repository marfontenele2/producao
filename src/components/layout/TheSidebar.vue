<template>
  <aside class="sidebar">
    <div class="logo-container">
      <img v-if="logoExists" src="@/assets/logo.png" alt="Logo" class="logo" />
      <h1 v-else>Produção</h1>
    </div>
    <nav class="navigation">
      <div v-if="userStore.isAdmin">
        <SidebarLink
          to="/dashboard/admin"
          label="Dashboard"
          :icon="BarChart3"
        />
        <SidebarLink to="/admin/ubs" label="Gerir UBS" :icon="Building" />
        <SidebarLink to="/admin/equipes" label="Gerir Equipes" :icon="Users" />
        <SidebarLink
          to="/admin/usuarios"
          label="Gerir Usuários"
          :icon="UserCog"
        />
        <SidebarLink
          to="/admin/prazos"
          label="Controle de Prazos"
          :icon="CalendarClock"
        />
        <SidebarLink
          to="/admin/boletim/testes"
          label="Boletim: Testes e Marcas"
          :icon="List"
        />
        <SidebarLink
          to="/admin/boletim/liberacoes"
          label="Boletim: Liberações"
          :icon="Send"
        />
        <SidebarLink
          to="/admin/boletim/relatorios"
          label="Boletim: Relatórios"
          :icon="FileText"
        />
      </div>

      <div v-if="userStore.isGerente">
        <SidebarLink
          to="/dashboard/gerente"
          label="Dashboard"
          :icon="BarChart3"
        />
        <SidebarLink
          to="/gerente/scnes"
          label="Gerir SCNES"
          :icon="ClipboardPaste"
          :status="scnesStatus"
        />
        <SidebarLink
          to="/gerente/saude-mental"
          label="Saúde Mental"
          :icon="BrainCircuit"
          :status="saudeMentalStatus"
        />
        <SidebarLink
          to="/gerente/validacao-acs"
          label="Validar Produção ACS"
          :icon="CheckCheck"
        />
      </div>

      <div v-if="userStore.isEnfermeiro">
        <SidebarLink
          to="/dashboard/enfermeiro"
          label="Painel"
          :icon="LayoutDashboard"
        />
        <SidebarLink
          to="/producao/semanal"
          label="Produção Semanal"
          :icon="CalendarPlus"
          :status="producaoSemanalStatus"
        />
        <SidebarLink
          to="/producao/mensal/acs"
          label="Produção ACS"
          :icon="ClipboardPenLine"
          :status="producaoAcsStatus"
        />
        <SidebarLink
          to="/cronograma"
          label="Cronograma"
          :icon="CalendarDays"
          :status="cronogramaStatus"
        />
        <SidebarLink
          to="/boletim"
          label="Boletim Testes"
          :icon="Beaker"
          :status="boletimStatus"
        />
        <SidebarLink
          to="/producao/suplementos"
          label="Suplementos"
          :icon="Pill"
          :status="suplementosStatus"
        />
        <SidebarLink
          to="/producao/educacao-permanente"
          label="Educação Permanente"
          :icon="Presentation"
          :status="educacaoPermanenteStatus"
        />
        <SidebarLink
          to="/producao/adolescente"
          label="Adolescente"
          :icon="Baby"
          :status="adolescenteStatus"
        />
        <SidebarLink
          to="/producao/gestantes"
          label="Gestantes"
          :icon="FileHeart"
          :status="gestantesStatus"
        />
      </div>

      <div v-if="userStore.isCoordenador">
        <div class="menu-section-title">PAINÉIS DE ENTREGA</div>
        <SidebarLink
          to="/dashboard/coordenador"
          label="Produção Mensal"
          :icon="LayoutDashboard"
        />
        <SidebarLink
          to="/dashboard/coordenador/semanal"
          label="Produção Semanal"
          :icon="CalendarClock"
        />
        <div class="menu-section-title">RELATÓRIOS</div>
        <SidebarLink
          to="/coordenador/relatorios/mensal"
          label="Relatórios Mensais"
          :icon="FileText"
        />
        <SidebarLink
          to="/coordenador/relatorios/semanal"
          label="Relatórios Semanais"
          :icon="FileClock"
        />
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { useStatusProducaoStore } from "@/store/statusProducaoStore";
import SidebarLink from "./SidebarLink.vue";
import {
  BarChart3,
  Building,
  Users,
  UserCog,
  CalendarClock,
  ClipboardPaste,
  LayoutDashboard,
  ClipboardPenLine,
  CalendarDays,
  BrainCircuit,
  CheckCheck,
  List,
  Send,
  Beaker,
  FileText,
  Pill,
  Presentation,
  Baby,
  FileHeart,
  CalendarPlus,
  FileClock, // ✅ ÍCONE ADICIONADO
} from "lucide-vue-next";

const userStore = useUserStore();
const statusStore = useStatusProducaoStore();

const scnesStatus = computed(() => statusStore.getStatus("scnes").value);
const saudeMentalStatus = computed(
  () => statusStore.getStatus("saudeMental").value
);
const producaoAcsStatus = computed(
  () => statusStore.getStatus("producaoAcs").value
);
const cronogramaStatus = computed(
  () => statusStore.getStatus("cronograma").value
);
const boletimStatus = computed(() => statusStore.getStatus("boletim").value);
const suplementosStatus = computed(
  () => statusStore.getStatus("suplementos").value
);
const educacaoPermanenteStatus = computed(
  () => statusStore.getStatus("educacaoPermanente").value
);
const adolescenteStatus = computed(
  () => statusStore.getStatus("adolescente").value
);
const gestantesStatus = computed(
  () => statusStore.getStatus("gestantes").value
);
const mddaStatus = computed(() => statusStore.getStatus("mdda").value);
const notificacaoSemanalStatus = computed(
  () => statusStore.getStatus("notificacaoSemanal").value
);
const sarampoStatus = computed(() => statusStore.getStatus("sarampo").value);

const producaoSemanalStatus = computed(() => {
  const modulos = [
    mddaStatus.value,
    notificacaoSemanalStatus.value,
    sarampoStatus.value,
  ];
  const todosEntregues = modulos.every((m) => m && m.texto === "ENTREGUE");
  if (todosEntregues) {
    return { cor: "#28a745", texto: "ENTREGUE", isAberto: true, prazoInfo: "" };
  }
  return (
    modulos[0] || {
      cor: "#6c757d",
      texto: "Fechado",
      isAberto: false,
      prazoInfo: "(Prazo: N/D)",
    }
  );
});

const logoExists = ref(true);
try {
  require("@/assets/logo.png");
} catch (e) {
  logoExists.value = false;
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 300px;
  background-color: #001529;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.logo-container {
  padding: 16px;
  text-align: center;
  background: linear-gradient(145deg, #00274d, #001529);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.logo {
  max-width: 80%;
  height: auto;
}
.navigation {
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 20px;
}
/* ✅ ESTILO ADICIONADO PARA OS TÍTULOS DE SEÇÃO DO MENU */
.menu-section-title {
  padding: 10px 24px 4px;
  font-size: 0.7rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 16px;
}
:deep(.nav-item svg) {
  flex-shrink: 0;
  width: 20px;
}
</style>
