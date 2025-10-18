// C:\producao\functions\index.js

const { initializeApp } = require('firebase-admin/app')
initializeApp()

// Carrega e exporta a função de sincronização de dados de equipe
const funcoesSincronizacao = require('./sincronizacaoDados.js')
exports.onUpdateEquipe = funcoesSincronizacao.onUpdateEquipe
console.log('[Functions] Função onUpdateEquipe carregada.')

// Carrega e exporta a função de gerenciamento de usuários
const funcoesUsuario = require('./userManager.js')
exports.userManager = funcoesUsuario.userManager
console.log('[Functions] Função userManager carregada.')
