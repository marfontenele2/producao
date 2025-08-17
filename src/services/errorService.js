// 📄 ARQUIVO: src/services/errorService.js
import { useNotificationStore } from "@/store/notificationStore";

export const errorService = {
  /**
   * Manipula um erro, registrando-o no console e mostrando uma notificação ao usuário.
   * No futuro, esta função poderá ser expandida para enviar logs para um serviço de monitoramento.
   * @param {Error} error - O objeto de erro capturado no bloco catch.
   * @param {string} userMessage - A mensagem amigável a ser exibida ao usuário.
   */
  handle(error, userMessage = "Ocorreu um erro inesperado.") {
    const notificationStore = useNotificationStore();

    // Log detalhado para os desenvolvedores
    console.error("Erro capturado pelo errorService:", {
      message: error.message,
      stack: error.stack,
      details: error,
    });

    // Notificação simples para o usuário final
    notificationStore.showNotification(userMessage, "error");
  },
};
