// 📄 ARQUIVO: src/utils/dateUtils.js
// Objetivo: Centralizar toda a manipulação de datas e competências.

/**
 * Retorna a competência atual no formato 'AAAA-MM'.
 * @returns {string} A competência atual.
 */
export function getCompetenciaAtual() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Calcula a competência anterior a partir de uma competência fornecida.
 * @param {string} competencia - A competência base no formato 'AAAA-MM'.
 * @returns {string} A competência do mês anterior no formato 'AAAA-MM'.
 */
export function getCompetenciaAnterior(competencia) {
  if (!competencia) return "";
  const [ano, mes] = competencia.split("-").map(Number);
  // O construtor do Date usa mês 0-indexed (janeiro = 0).
  // Para pegar o mês anterior, subtraímos 2 do mês (1 pela indexação, 1 para voltar o mês).
  const dataAnterior = new Date(ano, mes - 2, 1);
  return dataAnterior.toISOString().slice(0, 7);
}

/**
 * Formata uma competência de 'AAAA-MM' para 'MM/AAAA'.
 * @param {string} competencia - A competência no formato 'AAAA-MM'.
 * @returns {string} A competência formatada para exibição.
 */
export function formatarCompetencia(competencia) {
  if (!competencia || !competencia.includes("-")) return "";
  const [ano, mes] = competencia.split("-");
  return `${mes}/${ano}`;
}
