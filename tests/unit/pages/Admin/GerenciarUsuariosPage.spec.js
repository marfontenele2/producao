// 📄 ARQUIVO: tests/unit/pages/Admin/GerenciarUsuariosPage.spec.js
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import GerenciarUsuariosPage from "@/pages/Admin/GerenciarUsuariosPage.vue";
import { useNotificationStore } from "@/store/notificationStore";

// Mock dos serviços para isolar o componente
jest.mock("@/services/usuariosService", () => ({
  usuariosService: {
    monitorarUsuarios: jest.fn(() => () => {}),
    criarNovoUsuario: jest.fn(() =>
      Promise.resolve({ data: { success: true } })
    ),
    updateUsuario: jest.fn(() => Promise.resolve()),
    excluirUsuario: jest.fn(() => Promise.resolve({ data: { success: true } })),
  },
}));
jest.mock("@/services/ubsService", () => ({
  ubsService: {
    monitorarUbs: jest.fn(() => () => {}),
  },
}));
jest.mock("@/services/equipesService", () => ({
  equipesService: {
    monitorarEquipes: jest.fn(() => () => {}),
  },
}));

// Stubs para os componentes filhos
const UserListStub = {
  name: "UserList",
  template: "<div></div>",
  props: ["listaUsuarios", "listaUbs", "listaEquipes", "carregando"],
};

const UserFormStub = {
  name: "UserForm",
  template: "<div></div>",
  props: ["usuarioParaEditar", "listaUbs", "listaEquipes"],
};

describe("GerenciarUsuariosPage.vue", () => {
  let wrapper;
  let notificationStore;

  beforeEach(() => {
    wrapper = mount(GerenciarUsuariosPage, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
        stubs: {
          UserList: UserListStub,
          UserForm: UserFormStub,
          PlusCircle: true,
        },
      },
    });
    notificationStore = useNotificationStore();
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it("renderiza o botão 'Adicionar Usuário'", () => {
    expect(wrapper.find(".add-button").exists()).toBe(true);
    expect(wrapper.find(".add-button").text()).toContain("Adicionar Usuário");
  });

  it("exibe o formulário ao clicar em 'Adicionar Usuário'", async () => {
    expect(wrapper.findComponent({ name: "UserForm" }).exists()).toBe(false);
    await wrapper.find(".add-button").trigger("click");
    expect(wrapper.findComponent({ name: "UserForm" }).exists()).toBe(true);
  });

  it("chama o serviço para criar um novo usuário ao salvar o formulário", async () => {
    const { usuariosService } = require("@/services/usuariosService");
    const novoUsuario = { nome: "Teste", email: "teste@teste.com" };

    await wrapper.setData({ exibirFormulario: true });
    await wrapper
      .findComponent({ name: "UserForm" })
      .vm.$emit("salvar", novoUsuario);

    expect(usuariosService.criarNovoUsuario).toHaveBeenCalledWith(novoUsuario);
    expect(notificationStore.showNotification).toHaveBeenCalledWith(
      "Usuário criado com sucesso!",
      "success"
    );
    expect(wrapper.vm.exibirFormulario).toBe(false);
  });

  it("chama o serviço para atualizar um usuário existente ao salvar o formulário", async () => {
    const { usuariosService } = require("@/services/usuariosService");
    const usuarioExistente = {
      id: "123",
      nome: "Teste Editado",
      email: "teste@teste.com",
    };

    await wrapper.setData({
      exibirFormulario: true,
      usuarioSelecionado: { id: "123" },
    });
    await wrapper
      .findComponent({ name: "UserForm" })
      .vm.$emit("salvar", usuarioExistente);

    const { id, ...updateData } = usuarioExistente;
    expect(usuariosService.updateUsuario).toHaveBeenCalledWith(id, updateData);
    expect(notificationStore.showNotification).toHaveBeenCalledWith(
      "Usuário atualizado com sucesso!",
      "success"
    );
    expect(wrapper.vm.exibirFormulario).toBe(false);
  });
});
