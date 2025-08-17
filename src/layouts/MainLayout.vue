<template>
  <div class="main-layout">
    <CoordenadorMenu v-if="userStore.isCoordenador" />
    <TheSidebar v-else />

    <div class="content-wrapper">
      <TheHeader />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <AppNotification />
  </div>
</template>

<script setup>
import TheHeader from "@/components/layout/TheHeader.vue";
import TheSidebar from "@/components/layout/TheSidebar.vue";
import AppNotification from "@/components/shared/AppNotification.vue";
// ✅ NOVAS IMPORTAÇÕES PARA A LÓGICA CONDICIONAL
import CoordenadorMenu from "@/components/coordenador/CoordenadorMenu.vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
</script>

<style lang="scss">
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
}
.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-content {
  flex-grow: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
