<template>
  <div>
    <ModalNascidoVivo
      :exibir="exibirModalNascidoVivo"
      :registroParaEditar="itemEmEdicao"
      @fechar="fecharModal"
      @salvar="salvarNascidoVivo"
    />
    <ModalObito
      :exibir="exibirModalObito"
      :registroParaEditar="itemEmEdicao"
      @fechar="fecharModal"
      @salvar="salvarObito"
    />

    <h2>Lançamento para: {{ contexto.acs.nome }}</h2>
    <BaseSpinner v-if="carregando" text="Carregando dados..." />
    <div v-else class="formulario">
      <fieldset class="fieldset-lista-nominal">
        <legend>Listas Nominais</legend>
        <div class="listas-container">
          <div class="lista-coluna">
            <h3>Nascidos Vivos</h3>
            <button @click="abrirModalNascidoVivo(null)" class="btn-add-item">
              Adicionar
            </button>
            <ul v-if="dadosProducao.listasNominais.nascidosVivos.length">
              <li
                v-for="(item, index) in dadosProducao.listasNominais
                  .nascidosVivos"
                :key="index"
              >
                <span
                  >{{ item.nomeMae }} -
                  {{ formatarData(item.dataNascimento) }}</span
                >
                <div>
                  <button
                    @click="abrirModalNascidoVivo(item, index)"
                    class="btn-lista-acao"
                  >
                    ✏️
                  </button>
                  <button
                    @click="removerItem('nascidosVivos', index)"
                    class="btn-lista-acao btn-remover-item"
                  >
                    ×
                  </button>
                </div>
              </li>
            </ul>
            <p v-else class="sem-registros">Nenhum registro adicionado.</p>
          </div>
          <div class="lista-coluna">
            <h3>Óbitos</h3>
            <button @click="abrirModalObito(null)" class="btn-add-item">
              Adicionar
            </button>
            <ul v-if="dadosProducao.listasNominais.obitos.length">
              <li
                v-for="(item, index) in dadosProducao.listasNominais.obitos"
                :key="index"
              >
                <span
                  >{{ item.nomePaciente }} -
                  {{ formatarData(item.dataObito) }}</span
                >
                <div>
                  <button
                    @click="abrirModalObito(item, index)"
                    class="btn-lista-acao"
                  >
                    ✏️
                  </button>
                  <button
                    @click="removerItem('obitos', index)"
                    class="btn-lista-acao btn-remover-item"
                  >
                    ×
                  </button>
                </div>
              </li>
            </ul>
            <p v-else class="sem-registros">Nenhum registro adicionado.</p>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Dados Consolidados</legend>
        <div class="grid-consolidado">
          <div class="form-group">
            <label>Nº de Gestantes Acompanhadas</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.gestantesAcompanhadas"
              required
            />
          </div>
          <div class="form-group">
            <label>Nº de Crianças (&lt; 2 anos) Acompanhadas</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.criancasAcompanhadas"
              required
            />
          </div>
          <div class="form-group">
            <label>Pessoas cadastradas no mês</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.novosCadastros"
              required
            />
          </div>
          <div class="form-group">
            <label>Atualizações cadastrais realizadas</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.atualizacoesCadastrais"
              required
            />
          </div>
          <div class="form-group">
            <label>Visitas domiciliares realizadas</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.visitasRealizadas"
              required
            />
          </div>
          <div class="form-group">
            <label>Hipertensos acompanhados com visita</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.hipertensosAcompanhados"
              required
            />
          </div>
          <div class="form-group">
            <label>Diabéticos acompanhados com visita</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.diabeticosAcompanhados"
              required
            />
          </div>
          <div class="form-group">
            <label>Mulheres orientadas para preventivo</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.orientacaoPreventivo"
              required
            />
          </div>
          <div class="form-group">
            <label>Crianças com vacinas atrasadas orientadas</label
            ><input
              type="number"
              min="0"
              v-model.number="dadosProducao.consolidado.vacinasAtrasadas"
              required
            />
          </div>
          <div class="form-group">
            <label>Identificou domicílios não cadastrados?</label
            ><select
              v-model="dadosProducao.consolidado.identificouNovosDomicilios"
              required
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
          <div class="form-group">
            <label>Visitou todas as famílias com gestantes?</label
            ><select
              v-model="dadosProducao.consolidado.visitouTodasGestantes"
              required
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
          <div class="form-group">
            <label>Visitou todas as famílias com crianças &lt; 2 anos?</label
            ><select
              v-model="dadosProducao.consolidado.visitouTodasCriancas"
              required
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
          <div class="form-group">
            <label>Acompanhou acamados/domiciliados?</label
            ><select
              v-model="dadosProducao.consolidado.acompanhouAcamados"
              required
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        </div>
      </fieldset>

      <div class="actions">
        <button @click="$emit('voltar')" class="btn btn-secondary">
          Voltar para Seleção
        </button>
        <button @click="salvarDados" class="btn btn-save">
          Salvar Alterações
        </button>
        <button @click="finalizarLancamento" class="btn btn-finalize">
          Finalizar e Imprimir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { errorService } from "@/services/errorService";
import { producaoAcsServico } from "@/services/producaoAcsServico.js";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import ModalNascidoVivo from "./modais/ModalNascidoVivo.vue";
import ModalObito from "./modais/ModalObito.vue";

const props = defineProps({ contexto: { type: Object, required: true } });
const emit = defineEmits(["producao-finalizada", "voltar"]);
const userStore = useUserStore();
const notificationStore = useNotificationStore();
const carregando = ref(true);
const dadosProducao = ref(inicializarDados());
let unsubscribe = null;
const exibirModalNascidoVivo = ref(false);
const exibirModalObito = ref(false);

// ✅ Lógica de edição
const itemEmEdicao = ref(null);
const indiceEmEdicao = ref(null);

const documentoId = `${props.contexto.competencia}_${userStore.user.equipeId}_${props.contexto.acs.id}`;

function formatarData(dataString) {
  if (!dataString || !dataString.includes("-")) return dataString;
  const [ano, mes, dia] = dataString.split("-");
  return `${dia}/${mes}/${ano}`;
}

function inicializarDados() {
  return {
    listasNominais: { nascidosVivos: [], obitos: [] },
    consolidado: {
      gestantesAcompanhadas: null,
      criancasAcompanhadas: null,
      novosCadastros: null,
      atualizacoesCadastrais: null,
      visitasRealizadas: null,
      hipertensosAcompanhados: null,
      diabeticosAcompanhados: null,
      orientacaoPreventivo: null,
      vacinasAtrasadas: null,
      identificouNovosDomicilios: "Não",
      visitouTodasGestantes: "N/A",
      visitouTodasCriancas: "N/A",
      acompanhouAcamados: "N/A",
    },
  };
}

watch(
  () => props.contexto.acs.id,
  () => {
    if (unsubscribe) unsubscribe();
    carregando.value = true;
    unsubscribe = producaoAcsServico.monitorarProducaoIndividual(
      documentoId,
      (data) => {
        const dadosBase = inicializarDados();
        if (data && data.consolidado) {
          dadosBase.listasNominais =
            data.listasNominais || dadosBase.listasNominais;
          Object.assign(dadosBase.consolidado, data.consolidado);
        }
        dadosProducao.value = dadosBase;
        carregando.value = false;
      }
    );
  },
  { immediate: true }
);

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// ✅ Funções de controle dos modais e edição
function abrirModalNascidoVivo(item, index = null) {
  itemEmEdicao.value = item;
  indiceEmEdicao.value = index;
  exibirModalNascidoVivo.value = true;
}

function abrirModalObito(item, index = null) {
  itemEmEdicao.value = item;
  indiceEmEdicao.value = index;
  exibirModalObito.value = true;
}

function fecharModal() {
  exibirModalNascidoVivo.value = false;
  exibirModalObito.value = false;
  itemEmEdicao.value = null;
  indiceEmEdicao.value = null;
}

function salvarNascidoVivo(novoRegistro) {
  if (indiceEmEdicao.value !== null) {
    dadosProducao.value.listasNominais.nascidosVivos[indiceEmEdicao.value] =
      novoRegistro;
  } else {
    dadosProducao.value.listasNominais.nascidosVivos.push(novoRegistro);
  }
}

function salvarObito(novoRegistro) {
  if (indiceEmEdicao.value !== null) {
    dadosProducao.value.listasNominais.obitos[indiceEmEdicao.value] =
      novoRegistro;
  } else {
    dadosProducao.value.listasNominais.obitos.push(novoRegistro);
  }
}

function removerItem(lista, index) {
  if (confirm("Tem certeza que deseja remover este registro?")) {
    dadosProducao.value.listasNominais[lista].splice(index, 1);
  }
}

async function salvarDados() {
  try {
    const metadados = {
      competencia: props.contexto.competencia,
      acsId: props.contexto.acs.id,
      acsNome: props.contexto.acs.nome,
      equipeId: userStore.user.equipeId,
      ubsId: userStore.user.ubsId,
    };
    await producaoAcsServico.salvarProducaoIndividual(
      documentoId,
      dadosProducao.value,
      metadados
    );
    notificationStore.showNotification("Dados salvos com sucesso!", "success");
    return true;
  } catch (erro) {
    errorService.handle(erro, "Erro ao salvar.");
    return false;
  }
}
async function finalizarLancamento() {
  if (!window.confirm("Confirmar a finalização desta produção?")) return;
  const salvoComSucesso = await salvarDados();
  if (salvoComSucesso) {
    try {
      await producaoAcsServico.finalizarProducaoIndividual(documentoId);
      notificationStore.showNotification("Produção finalizada!", "success");
      const url = `/imprimir/producao-acs/${props.contexto.competencia}/${userStore.user.equipeId}`;
      window.open(url, "_blank");
      emit("producao-finalizada");
    } catch (erro) {
      errorService.handle(erro, "Erro ao finalizar a produção.");
    }
  }
}
</script>

<style lang="scss" scoped>
/* Estilos padronizados */
.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.btn {
  padding: 10px 20px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
  border-color: #6c757d;
}
.btn-save {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.btn-finalize {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  box-sizing: border-box;
}
fieldset {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
legend {
  font-weight: 600;
  font-size: 1.1rem;
  color: #001529;
  padding: 0 0.5rem;
}
.grid-consolidado {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem 1.5rem;
}
.listas-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.lista-coluna h3 {
  margin-top: 0;
  color: #495057;
}
.lista-coluna ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.lista-coluna li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.btn-add-item {
  padding: 6px 12px;
  margin-bottom: 1rem;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
}
.btn-lista-acao {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.btn-remover-item {
  color: #dc3545;
  font-size: 1.5rem;
}
.sem-registros {
  color: #888;
  font-style: italic;
}
</style>
