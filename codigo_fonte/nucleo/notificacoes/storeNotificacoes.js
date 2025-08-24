import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useStoreNotificacoes = defineStore('notificacoes', () => {
  /** @type {import("vue").Ref<Array<{id: string, mensagem: string, tipo: 'sucesso' | 'erro'}>>} */
  const notificacoes = ref([])

  /**
   * Exibe uma nova notificação na tela.
   * @param {{mensagem: string, tipo: 'sucesso' | 'erro', duracao?: number}} payload - Os dados da notificação.
   */
  function mostrarNotificacao({ mensagem, tipo = 'sucesso', duracao = 4000 }) {
    const id = uuidv4()
    notificacoes.value.push({ id, mensagem, tipo })

    setTimeout(() => {
      removerNotificacao(id)
    }, duracao)
  }

  /**
   * Remove uma notificação da lista.
   * @param {string} id - O ID da notificação a ser removida.
   */
  function removerNotificacao(id) {
    const index = notificacoes.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notificacoes.value.splice(index, 1)
    }
  }

  return {
    notificacoes,
    mostrarNotificacao,
  }
})
