<template>
  <div class="hub-container">
    <div class="card">
      <div class="card-header">
        <h1>Produção Mensal de ACS</h1>
        <p>Selecione a ação que deseja realizar para a competência atual.</p>
      </div>
      <div class="card-body">
        <div class="opcoes-container">
          <router-link
            :to="{ name: 'ProducaoAcsRegistrar' }"
            class="opcao-card"
          >
            <div class="icone">📝</div>
            <h2>1. Lançar / Editar Produção Individual</h2>
            <p>
              Clique aqui para preencher ou corrigir os dados de produção de
              cada ACS da sua equipe.
            </p>
          </router-link>
          <router-link
            :to="{ name: 'ProducaoAcsConsolidar' }"
            class="opcao-card"
          >
            <div class="icone">✔️</div>
            <h2>2. Consolidar e Entregar</h2>
            <p>
              Após finalizar todos os lançamentos individuais, clique aqui para
              enviar o relatório consolidado para a gerência.
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nenhuma lógica de script é necessária para esta página de menu.
</script>

<style lang="scss" scoped>
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.card-header h1 {
  margin: 0;
}
.card-header p {
  margin: 4px 0 0;
  color: #666;
}
.card-body {
  padding: 24px;
}
.opcoes-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.opcao-card {
  flex: 1;
  padding: 2rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease-in-out;
  max-width: 350px;
  min-width: 250px;
}
.opcao-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}
.icone {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.opcao-card h2 {
  margin: 0 0 0.5rem 0;
  color: #001529;
}
.opcao-card p {
  color: #6c757d;
}
</style>
