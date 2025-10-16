<template>
  <div>
    <h4 class="titulo-secao-impressao">{{ titulo }}</h4>
    <table class="tabela-impressao">
      <tbody>
        <tr v-for="linha in itens" :key="linha.item">
          <td class="coluna-item">{{ linha.item }}</td>
          <td class="coluna-valor">{{ linha.valor }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  itens: { type: Array, required: true }, // Array de objetos { item: string, valor: number }
})
</script>

<style scoped>
.titulo-secao-impressao {
  font-size: 10pt;
  text-align: left;
  margin: 1.5rem 0 0 0;
  font-weight: bold;
  background-color: #f2f2f2;
  padding: 4px;
  border: 1px solid #ccc;
}
.tabela-impressao {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
}
.tabela-impressao td {
  border: 1px solid #ccc;
  padding: 4px 8px;
}
.coluna-item {
  text-align: left;
  width: 80%;
}
.coluna-valor {
  text-align: center;
  font-weight: bold;
}
</style>
