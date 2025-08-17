<template>
  <div class="pagina-container">
    <div class="card">
      <div class="card-header">
        <h1>Produção Mensal de ACS</h1>
      </div>
      <div class="card-body">
        <SelecaoProfissional
          v-if="!contexto"
          @profissional-selecionado="onProfissionalSelecionado"
        />
        <FormularioProducao
          v-else
          :contexto="contexto"
          @producao-finalizada="onProducaoFinalizada"
          @voltar="limparSelecao"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SelecaoProfissional from "@/components/producao-acs/SelecaoProfissional.vue";
import FormularioProducao from "@/components/producao-acs/FormularioProducao.vue";

const router = useRouter();
const contexto = ref(null);

function onProfissionalSelecionado(payload) {
  contexto.value = payload;
}

function limparSelecao() {
  contexto.value = null;
}

function onProducaoFinalizada() {
  // Navega para o dashboard de forma limpa e segura.
  router.push({ name: "EnfermeiroDashboard" });
}
</script>

<style scoped>
.pagina-container {
  padding: 2rem;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.card-header h1 {
  margin: 0;
  font-size: 1.5rem;
}
.card-body {
  padding: 24px;
}
</style>
