// 📄 ARQUIVO: src/utils/calendarUtils.js
/**
 * Gera as semanas e dias para um determinado mês e ano.
 * @param {number} mes - O mês (1-12).
 * @param {number} ano - O ano.
 * @returns {Array<Array<object>>} - Um array de semanas, cada uma contendo um array de dias.
 */
export function gerarCalendario(mes, ano) {
  const semanas = [];
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);

  let semanaAtual = [];

  // Adiciona dias em branco para o início do mês
  for (let i = 0; i < primeiroDia.getDay(); i++) {
    semanaAtual.push(null);
  }

  // Adiciona os dias do mês
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    if (semanaAtual.length === 7) {
      semanas.push(semanaAtual);
      semanaAtual = [];
    }
    semanaAtual.push({
      dia: dia,
      data: new Date(ano, mes - 1, dia),
    });
  }

  // Adiciona dias em branco para o final do mês
  while (semanaAtual.length < 7) {
    semanaAtual.push(null);
  }
  semanas.push(semanaAtual);

  return semanas;
}
