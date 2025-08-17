<template>
  <div class="tabela-container">
    <table>
      <thead>
        <tr>
          <th>Equipe</th>
          <th v-for="modulo in modulos" :key="modulo.chave">
            {{ modulo.nome }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="equipe in equipesComStatus" :key="equipe.id">
          <td>{{ equipe.nome }}</td>
          <td v-for="modulo in modulos" :key="modulo.chave">
            <div
              @click="
                irParaValidacao(
                  equipe.id,
                  modulo.chave,
                  equipe.modulos[modulo.chave]
                )
              "
              class="status-cell"
            >
              <StatusBadge :status="equipe.modulos[modulo.chave]" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
// ✅ CORREÇÃO: 'useStatusGerencialStore' removido pois não era utilizado aqui.
import StatusBadge from "@/components/shared/StatusBadge.vue";

defineProps({
  equipesComStatus: { type: Array, required: true },
  modulos: { type: Array, required: true },
});

const router = useRouter();
// ✅ CORREÇÃO: a variável 'store' foi removida.

function irParaValidacao(equipeId, moduloChave, statusInfo) {
  if (statusInfo?.status !== "ENTREGUE") {
    return;
  }

  // A competência será lida da rota na página de destino.
  if (moduloChave === "producaoAcs") {
    router.push({ name: "ValidacaoAcs" });
  } else {
    alert(
      `A tela de validação para o módulo "${moduloChave}" ainda não foi implementada.`
    );
  }
}
</script>

<style lang="scss" scoped>
.tabela-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: center;
}
th {
  background-color: #f8f9fa;
  font-size: 0.9rem;
}
td:first-child {
  text-align: left;
  font-weight: 500;
}
.status-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  cursor: pointer;
}
</style>
