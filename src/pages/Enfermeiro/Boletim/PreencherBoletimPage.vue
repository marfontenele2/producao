<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Boletim: {{ testeInfo?.nome || "..." }}</h2>
        <p>
          Preencha os dados para cada marca liberada na competência de
          {{ formatarCompetencia(competencia) }}
        </p>
      </div>
      <router-link to="/boletim" class="btn-secondary">
        <ArrowLeft :size="18" /> Voltar
      </router-link>
    </header>

    <BaseSpinner v-if="carregando" text="Carregando dados do boletim..." />
    <div v-else class="preenchimento-layout">
      <aside class="marcas-nav">
        <h4>Marcas Liberadas</h4>
        <a
          v-for="marca in testeInfo.marcas"
          :key="marca.id"
          @click.prevent="selecionarMarca(marca)"
          :class="{ active: marcaSelecionada?.id === marca.id }"
          class="marca-link"
        >
          {{ marca.nome }}
          <CheckCircle2
            v-if="isMarcaPreenchida(marca.id)"
            :size="18"
            class="check-icon"
          />
        </a>
      </aside>

      <main class="form-main" v-if="marcaSelecionada">
        <form @submit.prevent="handleSalvarMarca">
          <div class="form-section">
            <h3>Testes Realizados ({{ marcaSelecionada.nome }})</h3>
            <div class="form-grid-5">
              <div class="form-group">
                <label>Pré-natal*</label
                ><input
                  type="number"
                  min="0"
                  v-model.number="formData.realizados.prenatal"
                  required
                  :disabled="isFinalizado"
                />
              </div>
              <div class="form-group">
                <label>Mobilização*</label
                ><input
                  type="number"
                  min="0"
                  v-model.number="formData.realizados.mobilizacao"
                  required
                  :disabled="isFinalizado"
                />
              </div>
              <div class="form-group">
                <label>Treinamentos*</label
                ><input
                  type="number"
                  min="0"
                  v-model.number="formData.realizados.treinamentos"
                  required
                  :disabled="isFinalizado"
                />
              </div>
              <div class="form-group">
                <label>Rotina*</label
                ><input
                  type="number"
                  min="0"
                  v-model.number="formData.realizados.rotina"
                  required
                  :disabled="isFinalizado"
                />
              </div>
              <div class="form-group">
                <label>Total</label
                ><input type="number" :value="totalRealizados" disabled />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Testes Reagentes (Positivos)</h3>
            <div class="form-group" style="max-width: 200px">
              <label>Quantidade*</label>
              <input
                type="number"
                min="0"
                v-model.number="formData.reagentes"
                required
                :disabled="isFinalizado"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Testes Inválidos</h3>
            <div class="sub-form">
              <input
                class="sub-input"
                type="number"
                min="1"
                v-model.number="formInvalido.quantidade"
                placeholder="Qtd"
                :disabled="isFinalizado"
              />
              <input
                class="sub-input flex-grow"
                type="text"
                v-model.trim="formInvalido.lote"
                placeholder="Nº do Lote"
                :disabled="isFinalizado"
              />
              <button
                @click.prevent="adicionarInvalido"
                class="btn-add"
                :disabled="isFinalizado"
              >
                <Plus :size="16" />
              </button>
            </div>
            <ul v-if="formData.invalidos.length" class="item-list">
              <li v-for="(item, index) in formData.invalidos" :key="index">
                <span
                  >Qtd: <strong>{{ item.quantidade }}</strong> | Lote:
                  <strong>{{ item.lote }}</strong></span
                >
                <button
                  @click.prevent="removerInvalido(index)"
                  class="btn-remove"
                  :disabled="isFinalizado"
                >
                  <X :size="14" />
                </button>
              </li>
            </ul>
          </div>

          <div class="form-section">
            <h3>Testes Perdidos</h3>
            <div class="sub-form">
              <input
                class="sub-input"
                type="number"
                min="1"
                v-model.number="formPerdido.quantidade"
                placeholder="Qtd"
                :disabled="isFinalizado"
              />
              <select
                class="sub-input"
                v-model="formPerdido.motivo"
                :disabled="isFinalizado"
              >
                <option v-for="motivo in motivosPerda" :key="motivo">
                  {{ motivo }}
                </option>
              </select>
              <input
                class="sub-input flex-grow"
                type="text"
                v-model.trim="formPerdido.lote"
                placeholder="Nº do Lote"
                :disabled="isFinalizado"
              />
              <button
                @click.prevent="adicionarPerdido"
                class="btn-add"
                :disabled="isFinalizado"
              >
                <Plus :size="16" />
              </button>
            </div>
            <div
              v-if="formPerdido.motivo === 'Outros'"
              class="form-group"
              style="margin-top: 1rem"
            >
              <label>Descrição do Motivo (Outros)</label>
              <input
                type="text"
                v-model.trim="formPerdido.descricao"
                :disabled="isFinalizado"
              />
            </div>
            <ul v-if="formData.perdidos.length" class="item-list">
              <li v-for="(item, index) in formData.perdidos" :key="index">
                <span
                  >Qtd: <strong>{{ item.quantidade }}</strong> | Motivo:
                  <strong>{{ item.motivo }}</strong> | Lote:
                  <strong>{{ item.lote }}</strong></span
                >
                <button
                  @click.prevent="removerPerdido(index)"
                  class="btn-remove"
                  :disabled="isFinalizado"
                >
                  <X :size="14" />
                </button>
              </li>
            </ul>
          </div>

          <div class="actions-final">
            <button type="submit" class="btn-primary" :disabled="isFinalizado">
              <Save :size="18" /> Salvar Dados da Marca
            </button>
            <button
              type="button"
              @click="handleFinalizar"
              :disabled="!isBoletimCompleto || isFinalizado"
              class="btn-success"
            >
              <CheckCheck :size="18" />
              {{ isFinalizado ? "Teste Finalizado" : "Finalizar Este Teste" }}
            </button>
          </div>
          <small
            v-if="!isBoletimCompleto && !isFinalizado"
            class="finalizar-aviso"
          >
            É preciso salvar os dados de **todas** as marcas liberadas para
            poder finalizar este teste.
          </small>
        </form>
      </main>
      <div v-else class="form-main empty-form">
        <p>Selecione uma marca na lista à esquerda para começar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";
import { getCompetenciaAtual, formatarCompetencia } from "@/utils/dateUtils";
import { boletimProfissionalService } from "@/services/boletimProfissionalService";
import BaseSpinner from "@/components/shared/BaseSpinner.vue";
import {
  Save,
  CheckCircle2,
  ArrowLeft,
  CheckCheck,
  Plus,
  X,
} from "lucide-vue-next";

// ✅ LÓGICA COMPLETA
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const testeId = route.params.testeId;
const carregando = ref(true);
const testeInfo = ref(null);
const dadosBoletim = ref({});
const marcaSelecionada = ref(null);
const formData = ref(null);

let unsubBoletim = null;
const competencia = getCompetenciaAtual();
const documentoId = `${competencia}_${userStore.user?.equipeId}`;

const formInvalido = ref({ quantidade: null, lote: "" });
const formPerdido = ref({
  quantidade: null,
  motivo: "Validade",
  lote: "",
  descricao: "",
});
const motivosPerda = [
  "Validade",
  "Armazenamento Inadequado",
  "Problema na Execução",
  "Recall",
  "Outros",
];

const num = (val) => Number(val) || 0;

const totalRealizados = computed(() => {
  if (!formData.value?.realizados) return 0;
  const { prenatal, mobilizacao, treinamentos, rotina } =
    formData.value.realizados;
  return num(prenatal) + num(mobilizacao) + num(treinamentos) + num(rotina);
});

const isMarcaPreenchida = (marcaId) =>
  !!dadosBoletim.value.testes?.[testeId]?.[marcaId];
const isBoletimCompleto = computed(() =>
  testeInfo.value?.marcas.every((marca) => isMarcaPreenchida(marca.id))
);
const isFinalizado = computed(
  () => dadosBoletim.value.finalizados?.[testeId] === true
);

const criarFormVazio = () => ({
  realizados: { prenatal: 0, mobilizacao: 0, treinamentos: 0, rotina: 0 },
  reagentes: 0,
  invalidos: [],
  perdidos: [],
});

const selecionarMarca = (marca) => {
  marcaSelecionada.value = marca;
  const dadosSalvos = dadosBoletim.value.testes?.[testeId]?.[marca.id];
  formData.value = dadosSalvos
    ? JSON.parse(JSON.stringify(dadosSalvos))
    : criarFormVazio();
};

const adicionarInvalido = () => {
  if (!formInvalido.value.quantidade || !formInvalido.value.lote) {
    notificationStore.showNotification(
      "Preencha quantidade e lote para adicionar.",
      "warning"
    );
    return;
  }
  formData.value.invalidos.push({ ...formInvalido.value });
  formInvalido.value = { quantidade: null, lote: "" };
};

const removerInvalido = (index) => formData.value.invalidos.splice(index, 1);

const adicionarPerdido = () => {
  if (
    !formPerdido.value.quantidade ||
    !formPerdido.value.motivo ||
    !formPerdido.value.lote
  ) {
    notificationStore.showNotification(
      "Preencha quantidade, motivo e lote para adicionar.",
      "warning"
    );
    return;
  }
  formData.value.perdidos.push({ ...formPerdido.value });
  formPerdido.value = {
    quantidade: null,
    motivo: "Validade",
    lote: "",
    descricao: "",
  };
};

const removerPerdido = (index) => formData.value.perdidos.splice(index, 1);

async function handleSalvarMarca() {
  if (!marcaSelecionada.value) return;
  const { ubsId, equipeId } = userStore.user;

  const dadosParaSalvar = {
    ...dadosBoletim.value,
    testes: {
      ...dadosBoletim.value.testes,
      [testeId]: {
        ...dadosBoletim.value.testes?.[testeId],
        [marcaSelecionada.value.id]: formData.value,
      },
    },
  };

  try {
    await boletimProfissionalService.salvarDadosBoletim(
      documentoId,
      dadosParaSalvar,
      ubsId,
      equipeId
    );
    notificationStore.showNotification(
      `Dados para "${marcaSelecionada.value.nome}" salvos!`,
      "success"
    );
  } catch (error) {
    notificationStore.showNotification("Erro ao salvar dados.", "error");
  }
}

async function handleFinalizar() {
  if (!isBoletimCompleto.value) {
    notificationStore.showNotification(
      "É preciso salvar os dados de todas as marcas liberadas para poder finalizar este teste.",
      "warning"
    );
    return;
  }
  if (
    confirm(
      `Tem certeza que deseja finalizar e entregar o boletim de ${testeInfo.value.nome}? Após a finalização, não será possível editar.`
    )
  ) {
    const { ubsId, equipeId } = userStore.user;
    const dadosParaSalvar = {
      ...dadosBoletim.value,
      finalizados: {
        ...dadosBoletim.value.finalizados,
        [testeId]: true,
      },
    };
    try {
      await boletimProfissionalService.salvarDadosBoletim(
        documentoId,
        dadosParaSalvar,
        ubsId,
        equipeId
      );
      notificationStore.showNotification(
        `Boletim de ${testeInfo.value.nome} finalizado com sucesso!`,
        "success"
      );
    } catch (error) {
      notificationStore.showNotification("Erro ao finalizar boletim.", "error");
    }
  }
}

onMounted(async () => {
  try {
    const todosTestes = await boletimProfissionalService.getTestesLiberados(
      competencia
    );
    testeInfo.value = todosTestes.find((t) => t.id === testeId);

    if (!testeInfo.value || testeInfo.value.marcas.length === 0) {
      notificationStore.showNotification(
        "Nenhuma marca liberada para este teste na competência atual.",
        "warning"
      );
      router.push({ name: "Boletim" });
      return;
    }

    unsubBoletim = boletimProfissionalService.monitorarBoletimEquipe(
      documentoId,
      (data) => {
        dadosBoletim.value = data || {};
        if (marcaSelecionada.value) {
          selecionarMarca(marcaSelecionada.value);
        }
      }
    );

    selecionarMarca(testeInfo.value.marcas[0]);
  } catch (error) {
    notificationStore.showNotification(
      "Erro ao carregar dados da página.",
      "error"
    );
  } finally {
    carregando.value = false;
  }
});

onUnmounted(() => {
  if (unsubBoletim) unsubBoletim();
});
</script>

<style lang="scss" scoped>
/* Estilos completos e corrigidos */
.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.page-header h2 {
  margin: 0;
}
.page-header p {
  margin: 4px 0 0;
  color: #6c757d;
}
.preenchimento-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: flex-start;
}
.marcas-nav {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 24px;
}
.marcas-nav h4 {
  margin-top: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
}
.marca-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  color: #333;
  margin-bottom: 4px;
  transition: background-color 0.2s, color 0.2s;
}
.marca-link.active {
  background-color: #001529;
  color: white;
}
.marca-link:not(.active):hover {
  background-color: #e9ecef;
}
.marca-link .check-icon {
  color: #28a745;
}
.marca-link.active .check-icon {
  color: white;
}
.form-main {
  background-color: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}
.empty-form {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6c757d;
}
.form-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 24px;
  margin-bottom: 24px;
}
.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.form-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #001529;
  font-size: 1.2rem;
}
.form-grid-5 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.form-group input:disabled {
  background-color: #e9ecef;
}
.sub-form {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}
.sub-input {
  flex-basis: 120px;
}
.sub-input.flex-grow {
  flex: 1;
}
.btn-add {
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-list {
  list-style: none;
  padding: 0;
  margin-top: 16px;
}
.item-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}
.btn-remove {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.actions-final {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.finalizar-aviso {
  color: #6c757d;
  font-size: 0.8rem;
}
.btn-primary,
.btn-secondary,
.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  border: none;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
.btn-success:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
