<template>
  <div class="detalhes-validacao-container card">
    <div class="card-header">
      <h2>Análise de Produção: {{ producao.acsNome }}</h2>
    </div>
    <div class="card-body">
      <div class="dados-container">
        <div class="dados-secao">
          <h4>Dados Consolidados (Registrado pelo Enfermeiro)</h4>
          <ul class="lista-dados">
            <li v-for="(valor, chave) in producao.consolidado" :key="chave">
              <strong>{{ formatarNomeIndicador(chave) }}:</strong>
              <span>{{ valor }}</span>
            </li>
          </ul>
        </div>
        <div class="dados-secao">
          <h4>Listas Nominais</h4>
          <p>
            <strong>Nascidos Vivos:</strong>
            {{ producao.listasNominais.nascidosVivos.length }}
          </p>
          <p>
            <strong>Óbitos:</strong> {{ producao.listasNominais.obitos.length }}
          </p>
        </div>
      </div>

      <div class="form-validacao">
        <div class="form-group">
          <label for="observacoes">Observações do Gerente</label>
          <textarea
            id="observacoes"
            v-model="validacao.observacoes"
            rows="4"
            placeholder="Adicione notas ou pedidos de correção..."
          ></textarea>
        </div>
        <div class="form-group">
          <label for="status">Status da Validação</label>
          <select id="status" v-model="validacao.status">
            <option>Aguardando Validação</option>
            <option>Validado</option>
          </select>
        </div>
        <div class="actions">
          <button @click="salvar" class="btn btn-finalize">
            Salvar Validação
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useUserStore } from "@/store/userStore";

const props = defineProps({
  producao: { type: Object, required: true },
  validacaoInicial: {
    type: Object,
    default: () => ({ status: "Aguardando Validação", observacoes: "" }),
  },
});
const emit = defineEmits(["salvar-validacao"]);
const userStore = useUserStore();

const validacao = ref({ ...props.validacaoInicial });

watch(
  () => props.validacaoInicial,
  (novoValor) => {
    validacao.value = { ...novoValor };
  }
);

const indicadoresNomes = {
  gestantesAcompanhadas: "Gestantes Acompanhadas",
  criancasAcompanhadas: "Crianças (< 2 anos) Acompanhadas",
  novosCadastros: "Novos Cadastros",
  atualizacoesCadastrais: "Atualizações Cadastrais",
  visitasRealizadas: "Visitas Realizadas",
  hipertensosAcompanhados: "Hipertensos Acompanhados",
  diabeticosAcompanhados: "Diabéticos Acompanhados",
  orientacaoPreventivo: "Orientações para Preventivo",
  vacinasAtrasadas: "Orientações de Vacinas Atrasadas",
  identificouNovosDomicilios: "Identificou Domicílios Não Cadastrados",
  visitouTodasGestantes: "Visitou Todas as Famílias com Gestantes",
  visitouTodasCriancas: "Visitou Todas as Famílias com Crianças < 2 anos",
  acompanhouAcamados: "Acompanhou Acamados/Domiciliados",
};

function formatarNomeIndicador(chave) {
  return indicadoresNomes[chave] || chave;
}
// ✅ FUNÇÃO 'alertarEmBreve' REMOVIDA

function salvar() {
  emit("salvar-validacao", {
    acsId: props.producao.acsId,
    dados: {
      ...validacao.value,
      validadoPor: userStore.user.nome,
    },
  });
}
</script>

<style lang="scss" scoped>
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}
.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}
.card-header h2 {
  margin: 0;
  font-size: 1.2rem;
}
.card-body {
  padding: 1.5rem;
}
.dados-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}
.dados-secao h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #001529;
}
.lista-dados {
  list-style: none;
  padding: 0;
  margin: 0;
}
.lista-dados li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.form-validacao {
  margin-top: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.actions {
  text-align: right;
}
.btn-finalize {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
