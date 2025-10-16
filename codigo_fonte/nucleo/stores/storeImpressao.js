import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreImpressao = defineStore('impressao', () => {
  const dadosParaImpressao = ref(null)

  function setDados(dados) {
    dadosParaImpressao.value = dados
  }

  function limparDados() {
    dadosParaImpressao.value = null
  }

  return {
    dadosParaImpressao,
    setDados,
    limparDados,
  }
})
