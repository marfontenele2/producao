// 📄 ARQUIVO: src/store/statusGerencialStore.js (Com Depurador)
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useUserStore } from "./userStore";
import { validacaoStatusService } from "@/services/validacaoStatusService.js";

export const useStatusGerencialStore = defineStore("statusGerencial", () => {
  const loading = ref(false);
  const equipesComStatus = ref([]);
  const competenciaAtual = ref(new Date().toISOString().slice(0, 7));
  const modulos = validacaoStatusService.getModulosDeValidacao();

  async function carregarStatus() {
    if (loading.value) return;

    const userStore = useUserStore();

    // ✅ INÍCIO DO DEPURADOR
    console.group(
      "[DEPURADOR] Verificando permissões para o Dashboard Gerencial"
    );
    console.log("Usuário está logado:", userStore.isLoggedIn);
    console.log("Perfil do usuário:", userStore.user?.role || "Nenhum");
    console.log("ID da UBS para consulta:", userStore.user?.ubsId || "Nenhum");
    console.log("Competência para consulta:", competenciaAtual.value);
    console.groupEnd();
    // ✅ FIM DO DEPURADOR

    if (!userStore.isGerente || !userStore.user?.ubsId) {
      equipesComStatus.value = [];
      return;
    }

    loading.value = true;
    try {
      equipesComStatus.value =
        await validacaoStatusService.getStatusProducaoEquipes(
          competenciaAtual.value,
          userStore.user.ubsId
        );
    } catch (error) {
      console.error("Erro ao carregar status gerencial:", error); // Este é o erro que estamos vendo
      equipesComStatus.value = [];
    } finally {
      loading.value = false;
    }
  }

  // ... o resto do arquivo permanece o mesmo ...
  function setCompetencia(novaCompetencia) {
    if (novaCompetencia !== competenciaAtual.value) {
      competenciaAtual.value = novaCompetencia;
      carregarStatus();
    }
  }
  const userStoreInstance = useUserStore();
  watch(
    () => userStoreInstance.user,
    (newUser) => {
      if (newUser && userStoreInstance.isGerente) {
        carregarStatus();
      } else {
        equipesComStatus.value = [];
      }
    },
    { immediate: true }
  );

  return {
    loading,
    equipesComStatus,
    competenciaAtual,
    modulos,
    setCompetencia,
    carregarStatus,
  };
});
