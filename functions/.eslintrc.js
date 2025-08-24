// Arquivo: C:\producao\functions\.eslintrc.js

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true, // <-- Esta linha é a mais importante. Ela define o ambiente Node.js.
  },
  extends: ['eslint:recommended', 'google'],
  parserOptions: {
    ecmaVersion: 2020, // Define a versão do EcmaScript para compatibilidade
  },
  rules: {
    quotes: ['error', 'single'], // Mudei para aspas simples para um estilo mais moderno
    indent: ['error', 2],
    'object-curly-spacing': ['error', 'always'],
    'require-jsdoc': 0, // Desativa a regra que obriga a documentar com JSDoc
  },
}
