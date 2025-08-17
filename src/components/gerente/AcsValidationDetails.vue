<template>
  <BaseModal :exibir="!!producao" @fechar="$emit('fechar')">
    <template #titulo>Detalhes da Produção ACS</template>

    <div v-if="producao" class="detalhes-container">
      <h3>Equipe: {{ equipeNome }}</h3>
      <p><strong>Competência:</strong> {{ producao.competencia }}</p>

      <div class="resumo-acs">
        <h4>Resumo por ACS</h4>
        <ul>
          <li v-for="registro in producao.registros" :key="registro.id">
            <strong>{{ registro.nome }} ({{ registro.microarea }}):</strong>
            Cadastros: {{ registro.cadastros }}, Visitas: {{ registro.visitas }}
          </li>
        </ul>
      </div>

      <div class="form-validacao">
        <label for="observacoes">Observações da Validação</label>
        <textarea id="observacoes" v-model="observacoes" rows="4"></textarea>
      </div>

      <div class="actions">
        <button @click="$emit('fechar')" class="btn btn-secondary">
          Fechar
        </button>
        <button @click="salvar" class="btn btn-finalize">
          Salvar Validação
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/userStore";
import BaseModal from "@/components/shared/BaseModal.vue";

// ✅ CORREÇÃO: 'props' removido pois defineProps não precisa ser atribuído.
defineProps({
  producao: { type: Object, default: null },
  equipeNome: { type: String, default: "" },
});
const emit = defineEmits(["fechar", "salvar"]);

const userStore = useUserStore();
const observacoes = ref("");

function salvar() {
  emit("salvar", {
    observacoes: observacoes.value,
    validadoPor: userStore.user.nome,
  });
}
</script>

<style scoped>
.detalhes-container h3 {
  margin-top: 0;
}
.resumo-acs {
  margin: 1.5rem 0;
}
.resumo-acs ul {
  list-style: none;
  padding: 0;
}
.resumo-acs li {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.form-validacao label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.form-validacao textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-finalize {
  background-color: #28a745;
  color: white;
}
</style>
