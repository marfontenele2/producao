// Arquivo: functions/index.js (Versão Final Corrigida)

const { initializeApp } = require('firebase-admin/app')
initializeApp()

// Carrega e exporta APENAS a nossa nova função de sincronização.
const funcoesSincronizacao = require('./sincronizacaoDados.js')
exports.onUpdateEquipe = funcoesSincronizacao.onUpdateEquipe

console.log('Função onUpdateEquipe carregada.')
