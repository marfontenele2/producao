// 📄 ARQUIVO CORRIGIDO: src/store/statusCoordenadorStore.js
import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";
import { useUserStore } from "./userStore";
import { coordenadorService } from "@/services/coordenadorService.js";
import { validacaoStatusService } from "@/services/validacaoStatusService.js";

export const useStatusCoordenadorStore = defineStore(
  "statusCoordenador",
  () => {
    const loading = ref(false);
    const ubsComStatus = ref([]);
    const competenciaAtual = ref(new Date().toISOString().slice(0, 7));
    const modulos = validacaoStatusService.getModulosDeValidacao();

    const listaTodasAsEquipes = computed(() => {
      return ubsComStatus.value
        .flatMap((ubs) => ubs.equipes.map((e) => ({ id: e.id, nome: e.nome })))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    });

    async function carregarStatusGeral() {
      const userStore = useUserStore();
      if (loading.value || !(userStore.isCoordenador || userStore.isAdmin)) {
        return;
      }
      loading.value = true;
      try {
        ubsComStatus.value = await coordenadorService.getStatusProducaoGeral(
          competenciaAtual.value
        );
      } catch (error) {
        console.error("Erro ao carregar status geral do coordenador:", error);
        ubsComStatus.value = [];
      } finally {
        loading.value = false;
      }
    }

    function setCompetencia(novaCompetencia) {
      if (novaCompetencia !== competenciaAtual.value) {
        competenciaAtual.value = novaCompetencia;
        carregarStatusGeral();
      }
    }

    const userStoreInstance = useUserStore();
    watch(
      () => userStoreInstance.user,
      (newUser) => {
        if (
          newUser &&
          (userStoreInstance.isCoordenador || userStoreInstance.isAdmin)
        ) {
          carregarStatusGeral();
        } else {
          ubsComStatus.value = [];
        }
      },
      { immediate: true }
    );

    return {
      loading,
      ubsComStatus,
      competenciaAtual,
      modulos,
      listaTodasAsEquipes,
      setCompetencia,
      carregarStatusGeral,
    };
  }
);
