<template>
  <div class="producao-hub-container">
    <h1 class="page-title">Produção Semanal</h1>
    <p class="page-description">
      Selecione o formulário que deseja preencher ou visualizar.
    </p>
    <div class="cards-container">
      <router-link :to="{ name: 'Mdda' }" class="card-link">
        <div class="card">
          <BarChart3 :size="48" class="card-icon" />
          <h2 class="card-title">
            Monitorização de Doenças Diarreicas Agudas (MDDA)
          </h2>
          <p class="card-description">
            Registre os atendimentos, planos de tratamento e óbitos relacionados
            à DDA.
          </p>
        </div>
      </router-link>
      <router-link :to="{ name: 'NotificacaoSemanal' }" class="card-link">
        <div class="card">
          <MailCheck :size="48" class="card-icon" />
          <h2 class="card-title">Notificação / Investigação Semanal</h2>
          <p class="card-description">
            Informe sobre Tétano Neonatal e investigue casos de Paralisia
            Flácida Aguda.
          </p>
        </div>
      </router-link>
      <router-link :to="{ name: 'Sarampo' }" class="card-link">
        <div class="card">
          <Biohazard :size="48" class="card-icon" />
          <h2 class="card-title">Ficha de Sarampo/Rubéola</h2>
          <p class="card-description">
            Atualize a classificação semanal dos casos notificados de Sarampo e
            Rubéola.
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>
<script setup>
import { BarChart3, MailCheck, Biohazard } from "lucide-vue-next";
</script>
<style lang="scss" scoped>
.producao-hub-container {
  max-width: 900px;
  margin: 0 auto;
}
.page-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}
.page-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 32px;
}
.cards-container {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  ); /* ✅ TAMANHO MÍNIMO REDUZIDO */
  gap: 24px;
}
.card-link {
  text-decoration: none;
  color: inherit;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px; /* ✅ PADDING REDUZIDO */
  border: 1px solid #e0e0e0;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
.card-icon {
  color: #1890ff;
  margin-bottom: 16px;
}
.card-title {
  font-size: 1.15rem; /* ✅ FONTES AJUSTADAS */
  font-weight: 600;
  margin-bottom: 8px;
}
.card-description {
  font-size: 0.85rem; /* ✅ FONTES AJUSTADAS */
  color: #555;
  line-height: 1.5;
}
</style>
