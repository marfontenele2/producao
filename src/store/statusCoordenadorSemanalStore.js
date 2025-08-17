// 📄 ARQUIVO GERADO: src/store/statusCoordenadorSemanalStore.js
import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";
import { useUserStore } from "./userStore";
import { coordenadorService } from "@/services/coordenadorService.js";
import { epidemiologicalWeekUtils } from "@/utils/epidemiologicalWeekUtils.js";

export const useStatusCoordenadorSemanalStore = defineStore(
  "statusCoordenadorSemanal",
  () => {
    const loading = ref(false);
    const ubsComStatus = ref([]);
    const semanasDisponiveis = ref([]);
    const semanasSelecionadas = ref([]);

    const modulos = coordenadorService.getModulosDeValidacaoSemanal();

    function inicializarSemanas() {
      const anoAtual = new Date().getFullYear();
      semanasDisponiveis.value = epidemiologicalWeekUtils.getCalendar(anoAtual);
      const semanaAtualInfo =
        epidemiologicalWeekUtils.getCurrentEpidemiologicalWeek();
      if (semanaAtualInfo) {
        semanasSelecionadas.value = [
          `${semanaAtualInfo.year}-W${String(semanaAtualInfo.week).padStart(
            2,
            "0"
          )}`,
        ];
      }
    }

    const listaTodasAsEquipes = computed(() => {
      return ubsComStatus.value
        .flatMap((ubs) => ubs.equipes.map((e) => ({ id: e.id, nome: e.nome })))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    });

    async function carregarStatusSemanal() {
      const userStore = useUserStore();
      if (
        loading.value ||
        !(userStore.isCoordenador || userStore.isAdmin) ||
        semanasSelecionadas.value.length === 0
      ) {
        return;
      }
      loading.value = true;
      try {
        ubsComStatus.value =
          await coordenadorService.getStatusProducaoSemanalGeral(
            semanasSelecionadas.value
          );
      } catch (error) {
        console.error("Erro ao carregar status semanal do coordenador:", error);
        ubsComStatus.value = [];
      } finally {
        loading.value = false;
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
          inicializarSemanas();
          carregarStatusSemanal();
        } else {
          ubsComStatus.value = [];
        }
      },
      { immediate: true }
    );

    watch(semanasSelecionadas, carregarStatusSemanal);

    return {
      loading,
      ubsComStatus,
      semanasDisponiveis,
      semanasSelecionadas,
      modulos,
      listaTodasAsEquipes,
      carregarStatusSemanal,
    };
  }
);
