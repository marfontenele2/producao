// 📄 ARQUIVO: src/store/notificationStore.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationStore = defineStore("notification", () => {
  const show = ref(false);
  const message = ref("");
  const type = ref("success"); // success, error, warning
  const duration = ref(4000);

  let timeoutId = null;

  function showNotification(newMessage, newType = "success", newDuration) {
    message.value = newMessage;
    type.value = newType;
    show.value = true;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      hideNotification();
    }, newDuration || duration.value);
  }

  function hideNotification() {
    show.value = false;
  }

  return { show, message, type, showNotification, hideNotification };
}); 
