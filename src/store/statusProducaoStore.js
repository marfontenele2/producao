import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useUserStore } from "./userStore";
import { prazosService } from "@/services/prazosService";
import { prazosSemanaisService } from "@/services/prazosSemanaisService";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { epidemiologicalWeekUtils } from "@/utils/epidemiologicalWeekUtils.js";

const modulosMonitorados = [
  // Módulos Enfermeiro (Mensal)
  {
    id: "producaoAcs",
    prazoKey: "producaoAcs",
    collection: "producaoAcs",
    tipoEntrega: "consolidado",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },
  {
    id: "cronograma",
    prazoKey: "cronograma",
    collection: "cronogramas",
    tipoEntrega: "existencia",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },
  {
    id: "boletim",
    prazoKey: "boletimTestesRapidos",
    collection: "boletimDados",
    tipoEntrega: "finalizado",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },
  {
    id: "suplementos",
    prazoKey: "suplementos",
    collection: "producaoSuplementos",
    tipoEntrega: "finalizado",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },
  {
    id: "educacaoPermanente",
    prazoKey: "educacaoPermanente",
    collection: "producaoEducacaoPermanente",
    tipoEntrega: "finalizado",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },
  {
    id: "adolescente",
    prazoKey: "adolescente",
    collection: "producaoAdolescente",
    tipoEntrega: "finalizado",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },
  {
    id: "gestantes",
    prazoKey: "gestantes",
    collection: "producaoGestantes",
    tipoEntrega: "finalizado",
    tipoPrazo: "mensal",
    perfil: "Enfermeiro",
  },

  // Módulos Enfermeiro (Semanal)
  {
    id: "mdda",
    prazoKey: "mdda",
    collection: "producaoMDDA",
    tipoEntrega: "finalizado",
    tipoPrazo: "semanal",
    perfil: "Enfermeiro",
  },
  {
    id: "notificacaoSemanal",
    prazoKey: "notificacaoSemanal",
    collection: "notificacaoSemanal",
    tipoEntrega: "finalizado",
    tipoPrazo: "semanal",
    perfil: "Enfermeiro",
  },
  {
    id: "sarampo",
    prazoKey: "sarampo",
    collection: "producaoSarampo",
    tipoEntrega: "finalizado",
    tipoPrazo: "semanal",
    perfil: "Enfermeiro",
  },

  // Módulos Gerente
  {
    id: "scnes",
    prazoKey: "scnes",
    collection: "scnes",
    tipoEntrega: "finalizado",
    tipoPrazo: "mensal",
    perfil: "Gerente",
  },
  {
    id: "saudeMental",
    prazoKey: "saudeMental",
    collection: "acompanhamentosSaudeMental",
    tipoEntrega: "existencia",
    tipoPrazo: "mensal",
    perfil: "Gerente",
  },
];

export const useStatusProducaoStore = defineStore("statusProducao", () => {
  const prazosMensais = ref({});
  const prazosSemanais = ref({});
  const entregas = ref({});
  let listeners = [];

  const getStatus = (moduloId) => {
    return computed(() => {
      const moduloConfig = modulosMonitorados.find((m) => m.id === moduloId);
      if (!moduloConfig)
        return {
          cor: "#6c757d",
          texto: "Inválido",
          isAberto: false,
          prazoInfo: "",
        };

      const entregue = entregas.value[moduloId];
      if (entregue) {
        return {
          cor: "#28a745",
          texto: "ENTREGUE",
          isAberto: true,
          prazoInfo: "",
        };
      }

      if (moduloConfig.tipoPrazo === "mensal") {
        const prazo = prazosMensais.value[moduloConfig.prazoKey];
        const prazoInfo = `(Prazo: ${prazo?.diaOficial || "N/D"})`;

        if (prazo && prazo.abertura && prazo.fechamento) {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const dataAbertura = new Date(prazo.abertura);
          dataAbertura.setUTCHours(0, 0, 0, 0);
          const dataFechamento = new Date(prazo.fechamento);
          dataFechamento.setUTCHours(23, 59, 59, 999);

          if (hoje < dataAbertura)
            return {
              cor: "#6c757d",
              texto: "Fechado",
              isAberto: false,
              prazoInfo: `(Abre ${dataAbertura.toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })})`,
            };
          if (hoje > dataFechamento)
            return {
              cor: "#dc3545",
              texto: "Encerrado",
              isAberto: false,
              prazoInfo,
            };
          return { cor: "#17a2b8", texto: "Aberto", isAberto: true, prazoInfo };
        }
        return {
          cor: "#6c757d",
          texto: "Fechado",
          isAberto: false,
          prazoInfo: "(Sem prazo)",
        };
      }

      if (moduloConfig.tipoPrazo === "semanal") {
        const prazo = prazosSemanais.value[moduloConfig.prazoKey];
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const prazoInfo = `(Abre ${
          diasSemana[prazo?.abertura] || "N/D"
        }, Fecha ${diasSemana[prazo?.fechamento] || "N/D"})`;

        if (
          prazo &&
          typeof prazo.abertura === "number" &&
          typeof prazo.fechamento === "number"
        ) {
          const hoje = new Date().getDay();

          if (prazo.abertura > prazo.fechamento) {
            if (hoje >= prazo.abertura || hoje <= prazo.fechamento) {
              return {
                cor: "#17a2b8",
                texto: "Aberto",
                isAberto: true,
                prazoInfo,
              };
            }
          } else {
            if (hoje >= prazo.abertura && hoje <= prazo.fechamento) {
              return {
                cor: "#17a2b8",
                texto: "Aberto",
                isAberto: true,
                prazoInfo,
              };
            }
          }
          return {
            cor: "#dc3545",
            texto: "Encerrado",
            isAberto: false,
            prazoInfo,
          };
        }
        return {
          cor: "#6c757d",
          texto: "Fechado",
          isAberto: false,
          prazoInfo: "(Sem prazo)",
        };
      }
      return {
        cor: "#6c757d",
        texto: "Inválido",
        isAberto: false,
        prazoInfo: "",
      };
    });
  };

  const limparListeners = () => {
    listeners.forEach((unsub) => unsub());
    listeners = [];
  };

  watch(
    () => useUserStore().user,
    (user) => {
      limparListeners();
      const competenciaMensal = new Date().toISOString().slice(0, 7);

      if (!user) return;

      listeners.push(
        prazosService.monitorarPrazosDoMes(competenciaMensal, (dados) => {
          prazosMensais.value = dados || {};
        })
      );

      listeners.push(
        prazosSemanaisService.monitorarPrazos((dados) => {
          prazosSemanais.value = dados || {};
        })
      );

      const modulosDoPerfil = modulosMonitorados.filter(
        (mod) => mod.perfil === user.role
      );

      if (modulosDoPerfil.length > 0 && user.equipeId) {
        modulosDoPerfil.forEach((mod) => {
          let docId;
          if (mod.tipoPrazo === "semanal") {
            const semanaInfo =
              epidemiologicalWeekUtils.getCurrentEpidemiologicalWeek();
            docId = `${semanaInfo.year}-W${String(semanaInfo.week).padStart(
              2,
              "0"
            )}_${user.equipeId}`;
          } else {
            docId = `${competenciaMensal}_${user.equipeId}`;
          }

          listeners.push(
            onSnapshot(doc(db, mod.collection, docId), (docSnap) => {
              let isEntregue = false;
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (mod.tipoEntrega === "existencia") isEntregue = true;
                else if (mod.tipoEntrega === "finalizado")
                  isEntregue = !!data.finalizado;
                else if (mod.tipoEntrega === "consolidado")
                  isEntregue = !!data.consolidado;
              }
              entregas.value[mod.id] = isEntregue;
            })
          );
        });
      }
    },
    { immediate: true, deep: true }
  );

  return { getStatus };
});
