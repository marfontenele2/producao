// 📄 ARQUIVO: functions/index.js
// ✅ CORREÇÃO: A assinatura do onCall foi atualizada para o padrão da v2,
// que recebe um único objeto 'request' contendo 'data' e 'auth'.

const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { HttpsError } = require("firebase-functions/v2/https");

// Importa as lógicas de negócio dos arquivos modulares
const userManagementActions = require("./userManagement");

// Define a região para todas as funções neste arquivo
setGlobalOptions({ region: "southamerica-east1" });

admin.initializeApp();

/**
 * Ponto de entrada para todas as ações relacionadas a usuários.
 * Delega a execução para o módulo 'userManagement.js'.
 */
exports.userManager = onCall(async (request) => {
  // Extrai 'data' e 'auth' do objeto 'request'
  const { data, auth } = request;

  if (userManagementActions[data.action]) {
    // Passa 'data' e o objeto 'context' esperado pelas funções modulares
    return await userManagementActions[data.action](data, { auth });
  }

  // Lança um erro se a ação não for encontrada
  throw new HttpsError(
    "not-found",
    `A ação '${data.action}' não foi encontrada no userManager.`
  );
});

/**
 * Ponto de entrada para ações de equipes e UBS.
 * (Ainda como placeholder, mas pronto para ser modularizado).
 */
exports.equipeManager = onCall(async (request) => {
  const { data } = request;
  // Futuramente, a lógica será movida para 'equipeManagement.js'
  console.log(
    "equipeManager chamada com:",
    data.action,
    "payload:",
    data.payload
  );
  return { success: true, message: "Função 'equipeManager' placeholder." };
});
