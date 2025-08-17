<template>
  <aside class="sidebar">
    <div class="logo-container">
      <h1>Produção</h1>
      <span class="role-tag">Coordenador</span>
    </div>
    <nav class="navigation">
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
    </nav>
  </aside>
</template>

<script setup>
import SidebarLink from "@/components/layout/SidebarLink.vue";
import {
  LayoutDashboard,
  CalendarClock,
  FileText,
  FileClock,
} from "lucide-vue-next";
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
.logo-container h1 {
  margin: 0;
  font-size: 1.5rem;
}
.role-tag {
  font-size: 0.8rem;
  color: #1890ff;
  font-weight: bold;
}
.navigation {
  flex-grow: 1;
  overflow-y: auto;
  padding-top: 20px;
}
.menu-section-title {
  padding: 12px 24px;
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
