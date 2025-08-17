// 📄 ARQUIVO: tests/unit/pages/Admin/GerenciarUbsPage.spec.js
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import GerenciarUbsPage from "@/pages/Admin/GerenciarUbsPage.vue";
import UbsList from "@/components/admin/UbsList.vue";
import UbsForm from "@/components/admin/UbsForm.vue";

// Mock dos serviços para isolar o componente
jest.mock("@/services/ubsService", () => ({
  ubsService: {
    monitorarUbs: jest.fn(() => () => {}), // Retorna uma função de unsubscribe
    adicionarUbs: jest.fn(),
    atualizarUbs: jest.fn(),
    excluirUbs: jest.fn(),
  },
}));

// Mock dos componentes filhos para focar no teste da página
const UbsListStub = {
  template: "<div></div>",
  props: ["listaUbs", "carregando"],
};

const UbsFormStub = {
  template: "<div></div>",
  props: ["ubsParaEditar"],
};

describe("GerenciarUbsPage.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(GerenciarUbsPage, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
        stubs: {
          UbsList: UbsListStub,
          UbsForm: UbsFormStub,
          PlusCircle: true, // Mock do ícone
        },
      },
    });
  });

  it("renderiza o botão 'Adicionar UBS'", () => {
    const addButton = wrapper.find(".add-button");
    expect(addButton.exists()).toBe(true);
    expect(addButton.text()).toContain("Adicionar UBS");
  });

  it("exibe o formulário ao clicar em 'Adicionar UBS'", async () => {
    expect(wrapper.findComponent(UbsForm).exists()).toBe(false);

    await wrapper.find(".add-button").trigger("click");

    expect(wrapper.findComponent(UbsForm).exists()).toBe(true);
  });

  it("fecha o formulário ao receber o evento 'fechar'", async () => {
    await wrapper.setData({ exibirFormulario: true });
    expect(wrapper.findComponent(UbsForm).exists()).toBe(true);

    await wrapper.findComponent(UbsForm).vm.$emit("fechar");

    expect(wrapper.findComponent(UbsForm).exists()).toBe(false);
  });
});
