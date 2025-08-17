// 📄 ARQUIVO: tests/unit/pages/Admin/GerenciarEquipesPage.spec.js
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import GerenciarEquipesPage from "@/pages/Admin/GerenciarEquipesPage.vue";
import EquipeList from "@/components/admin/EquipeList.vue";
import EquipeForm from "@/components/admin/EquipeForm.vue";
import { useNotificationStore } from "@/store/notificationStore";

// Mock dos serviços para isolar o componente de dependências externas
jest.mock("@/services/equipesService", () => ({
  equipesService: {
    monitorarEquipes: jest.fn(() => () => {}), // Retorna uma função de unsubscribe
    adicionarEquipe: jest.fn(() => Promise.resolve()),
    atualizarEquipe: jest.fn(() => Promise.resolve()),
    excluirEquipe: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock("@/services/ubsService", () => ({
  ubsService: {
    monitorarUbs: jest.fn(() => () => {}),
  },
}));

// Stubs para os componentes filhos, para focar o teste na lógica da PÁGINA
const EquipeListStub = {
  name: "EquipeList",
  template: "<div></div>",
  props: ["listaEquipes", "listaUbs", "carregando"],
};

const EquipeFormStub = {
  name: "EquipeForm",
  template: "<div></div>",
  props: ["equipeParaEditar", "listaUbs"],
};

describe("GerenciarEquipesPage.vue", () => {
  let wrapper;
  let notificationStore;

  beforeEach(() => {
    wrapper = mount(GerenciarEquipesPage, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false, // Permite que as ações da store sejam chamadas
          }),
        ],
        stubs: {
          EquipeList: EquipeListStub,
          EquipeForm: EquipeFormStub,
          PlusCircle: true, // Mock do ícone para evitar warnings
        },
      },
    });
    notificationStore = useNotificationStore();
  });

  it("renderiza o botão 'Adicionar Equipe' e o filtro de UBS", () => {
    expect(wrapper.find(".add-button").exists()).toBe(true);
    expect(wrapper.find(".filter-select").exists()).toBe(true);
  });

  it("exibe o formulário quando o botão 'Adicionar Equipe' é clicado", async () => {
    expect(wrapper.findComponent({ name: "EquipeForm" }).exists()).toBe(false);
    await wrapper.find(".add-button").trigger("click");
    expect(wrapper.findComponent({ name: "EquipeForm" }).exists()).toBe(true);
  });

  it("passa a equipe correta para o formulário ao emitir o evento 'editar'", async () => {
    await wrapper.setData({ exibirFormulario: true }); // Abrir o formulário
    const equipeDeExemplo = { id: "123", nome: "Equipe Teste", ubsId: "abc" };

    // Simula o evento 'editar' vindo do componente de lista
    await wrapper
      .findComponent({ name: "EquipeList" })
      .vm.$emit("editar", equipeDeExemplo);

    // Verifica se o formulário está visível e recebeu a prop corretamente
    const form = wrapper.findComponent({ name: "EquipeForm" });
    expect(form.exists()).toBe(true);
    expect(form.props("equipeParaEditar")).toEqual(equipeDeExemplo);
  });

  it("chama o serviço de exclusão quando o evento 'excluir' é emitido", async () => {
    const { equipesService } = require("@/services/equipesService");
    window.confirm = jest.fn(() => true); // Simula o usuário confirmando a exclusão

    // Simula o evento 'excluir' vindo do componente de lista
    await wrapper
      .findComponent({ name: "EquipeList" })
      .vm.$emit("excluir", "equipe-id-123");

    expect(window.confirm).toHaveBeenCalled();
    expect(equipesService.excluirEquipe).toHaveBeenCalledWith("equipe-id-123");
    expect(notificationStore.showNotification).toHaveBeenCalledWith(
      "Equipe excluída com sucesso!",
      "success"
    );
  });
});
