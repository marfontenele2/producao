// 📄 ARQUIVO GERADO: src/logs/consoleTemp.StatusDebug-Latest.js
import { useStatusProducaoStore } from "@/store/statusProducaoStore";
import { useUserStore } from "@/store/userStore";
import { onMounted } from "vue";

/**
 * Imprime um diagnóstico detalhado do status da produção no console.
 * Para usar: importe e chame `useStatusDebugger()` dentro do <script setup> de um componente principal (ex: TheSidebar.vue).
 */
export function useStatusDebugger() {
  onMounted(() => {
    console.group("--- [DEPURADOR DE STATUS DA PRODUÇÃO] ---");

    const statusStore = useStatusProducaoStore();
    const userStore = useUserStore();

    console.log("Usuário Atual:", userStore.user);

    // Força o acesso a uma propriedade interna para obter os dados brutos
    const prazosSemanais = statusStore.prazosSemanais;
    const entregas = statusStore.entregas;

    console.log("Prazos Semanais Carregados:", prazosSemanais);
    console.log("Entregas da Semana:", entregas);

    const modulosParaDebug = ["mdda", "notificacaoSemanal", "sarampo"];
    const diasDaSemana = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    const hoje = new Date().getDay();

    console.log(`Hoje é: ${diasDaSemana[hoje]} (índice: ${hoje})`);

    modulosParaDebug.forEach((moduloId) => {
      console.group(`Analisando Módulo: "${moduloId}"`);
      const status = statusStore.getStatus(moduloId).value;

      console.log(
        `- Configuração de prazo encontrada:`,
        prazosSemanais[moduloId] || "NENHUMA"
      );
      console.log(
        `- Status de entrega:`,
        entregas[moduloId] ? "ENTREGUE" : "PENDENTE"
      );

      if (!entregas[moduloId] && prazosSemanais[moduloId]) {
        const prazo = prazosSemanais[moduloId];
        let estaAberto = false;
        if (prazo.abertura > prazo.fechamento) {
          estaAberto = hoje >= prazo.abertura || hoje <= prazo.fechamento;
          console.log(
            `- Lógica de "semana virada" (Ex: Sex-Seg). Condição (${hoje} >= ${prazo.abertura} || ${hoje} <= ${prazo.fechamento}) é ${estaAberto}`
          );
        } else {
          estaAberto = hoje >= prazo.abertura && hoje <= prazo.fechamento;
          console.log(
            `- Lógica de "mesma semana" (Ex: Seg-Qua). Condição (${hoje} >= ${prazo.abertura} && ${hoje} <= ${prazo.fechamento}) é ${estaAberto}`
          );
        }
      }

      console.log("-> Status Final Calculado:", status);
      console.groupEnd();
    });

    console.groupEnd();
  });
}
