<template>
  <div class="card modulo-card">
    <div class="card-header">
      <h2>{{ modulo.nome }}</h2>
    </div>
    <div class="card-body">
      <ul class="lista-equipes">
        <li v-for="equipe in equipes" :key="equipe.id">
          <span class="nome-equipe">{{ equipe.nome }}</span>
          <div
            class="status-container"
            :title="`Status: ${getStatusTexto(equipe)}`"
            @click="irParaValidacao(equipe.id, modulo.chave, getStatus(equipe))"
            :class="{ clicavel: isEntregue(equipe) }"
          >
            <CheckCircle2
              v-if="isEntregue(equipe)"
              class="icone-entregue"
              :size="20"
            />
            <XCircle v-else class="icone-pendente" :size="20" />

            <span :style="{ color: getStatusCor(equipe) }">
              {{ getStatusTexto(equipe) }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
// ✅ 'useStatusGerencialStore' foi removido
import { CheckCircle2, XCircle } from "lucide-vue-next";

const props = defineProps({
  modulo: { type: Object, required: true },
  equipes: { type: Array, required: true },
});

const router = useRouter();
// ✅ a variável 'store' foi removida

function getStatus(equipe) {
  return equipe.modulos[props.modulo.chave];
}

function isEntregue(equipe) {
  return getStatus(equipe)?.status === "ENTREGUE";
}

function getStatusTexto(equipe) {
  return getStatus(equipe)?.status || "Pendente";
}

function getStatusCor(equipe) {
  return getStatus(equipe)?.cor || "#6c757d";
}

function irParaValidacao(equipeId, moduloChave, statusInfo) {
  if (statusInfo?.status !== "ENTREGUE") {
    return;
  }

  if (moduloChave === "producaoAcs") {
    router.push({ name: "ValidacaoAcs" });
  } else {
    alert(
      `A tela de validação para o módulo "${props.modulo.nome}" ainda não foi implementada.`
    );
  }
}
</script>

<style lang="scss" scoped>
/* Estilos permanecem os mesmos */
.modulo-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8f9fa;
}
h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #343a40;
}
.card-body {
  padding: 0;
  flex-grow: 1;
}
.lista-equipes {
  list-style: none;
  padding: 0;
  margin: 0;
}
.lista-equipes li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}
.lista-equipes li:last-child {
  border-bottom: none;
}
.nome-equipe {
  font-weight: 500;
}
.status-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}
.status-container.clicavel {
  cursor: pointer;
}
.status-container.clicavel:hover {
  opacity: 0.7;
}
.icone-entregue {
  color: #28a745;
}
.icone-pendente {
  color: #dc3545;
}
</style>
