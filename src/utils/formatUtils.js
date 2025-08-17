// 📄 ARQUIVO GERADO: src/utils/formatUtils.js

/**
 * Formata uma string de números para o formato de CPF (XXX.XXX.XXX-XX).
 * Se a string for inválida ou vazia, retorna a string original.
 * @param {string} cpf - O número do CPF, contendo apenas dígitos.
 * @returns {string} O CPF formatado ou a string original.
 */
export function formatarCPF(cpf) {
  if (!cpf || typeof cpf !== "string") {
    return "";
  }

  const cpfLimpo = cpf.replace(/\D/g, ""); // Remove tudo que não for dígito

  if (cpfLimpo.length !== 11) {
    return cpf; // Retorna o original se não tiver 11 dígitos
  }

  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
