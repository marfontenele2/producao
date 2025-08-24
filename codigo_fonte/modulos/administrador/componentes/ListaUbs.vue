<template>
  <div class="lista-container">
    <h3>UBS Cadastradas</h3>
    <div v-if="carregando">Carregando...</div>
    <table v-else-if="listaUbs.length > 0" class="tabela-dados">
      <thead>
        <tr>
          <th>Nome da UBS</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ubs in listaUbs" :key="ubs.id">
          <td>{{ ubs.nome }}</td>
          <td class="acoes">
            <button @click="$emit('editar', ubs)" class="botao-acao editar">Editar</button>
            <button @click="$emit('excluir', ubs.id)" class="botao-acao excluir">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhuma UBS cadastrada.</p>
  </div>
</template>

<script setup>
/**
 * Props do componente ListaUbs.
 * @property {Array<object>} listaUbs - A lista de UBS a ser exibida.
 * @property {boolean} carregando - Indica se os dados ainda estão sendo carregados.
 */
defineProps({
  listaUbs: {
    type: Array,
    required: true,
  },
  carregando: {
    type: Boolean,
    default: false,
  },
})

/**
 * Emite eventos para o componente pai.
 * @event editar - Disparado quando o botão de editar é clicado, enviando o objeto da UBS.
 * @event excluir - Disparado quando o botão de excluir é clicado, enviando o ID da UBS.
 */
defineEmits(['editar', 'excluir'])
</script>

<style scoped>
/* Estilos básicos para a tabela e botões */
.tabela-dados {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.tabela-dados th,
.tabela-dados td {
  border: 1px solid #ddd;
  padding: 8px;
}
.tabela-dados th {
  background-color: #f2f2f2;
  text-align: left;
}
.acoes {
  display: flex;
  gap: 10px;
}
.botao-acao {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}
.editar {
  background-color: #ffc107;
}
.excluir {
  background-color: #dc3545;
}
</style>
