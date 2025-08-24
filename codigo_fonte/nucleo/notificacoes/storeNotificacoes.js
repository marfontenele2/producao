import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useStoreNotificacoes = defineStore('notificacoes', () => {
  /**
   * [CORRIGIDO] A tipagem do array agora inclui 'alerta' para refletir o uso real.
   * @type {import("vue").Ref<Array<{id: string, mensagem: string, tipo: 'sucesso' | 'erro' | 'alerta'}>>}
   */
  const notificacoes = ref([])

  /**
   * Exibe uma nova notificação na tela.
   * [CORRIGIDO] A assinatura da função e o JSDoc estão claros que o argumento é um único objeto.
   * @param {{mensagem: string, tipo: 'sucesso' | 'erro' | 'alerta', duracao?: number}} payload - Os dados da notificação.
   */
  function mostrarNotificacao(payload) {
    // Validação para garantir que a mensagem não seja vazia ou nula.
    if (!payload || !payload.mensagem) {
      console.error('Tentativa de exibir notificação sem mensagem.', payload)
      return
    }

    const id = uuidv4()
    const defaults = { tipo: 'sucesso', duracao: 4000 }
    const notificacao = { id, ...defaults, ...payload }

    notificacoes.value.push(notificacao)

    setTimeout(() => {
      removerNotificacao(id)
    }, notificacao.duracao)
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
