<template>
  <nav class="navegacao-principal">
    <ul v-if="storeUsuario.ehAdmin">
      <li @mouseenter="abrirMenu('inicio')" @mouseleave="fecharMenu">
        <a @click.prevent="toggleMenu('inicio')"><Home :size="18" /><span>Início</span></a>
        <ul class="submenu" v-show="menuAberto === 'inicio'">
          <li><router-link :to="{ name: 'DashboardAdmin' }">Dashboard</router-link></li>
        </ul>
      </li>
      <li @mouseenter="abrirMenu('cadastros')" @mouseleave="fecharMenu">
        <a><Users :size="18" /><span>Cadastros</span></a>
        <ul class="submenu" v-show="menuAberto === 'cadastros'">
          <li><router-link :to="{ name: 'AdminGerenciarUbs' }">Gerenciar UBS</router-link></li>
          <li>
            <router-link :to="{ name: 'AdminGerenciarEquipes' }">Gerenciar Equipes</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'AdminGerenciarUsuarios' }">Gerenciar Usuários</router-link>
          </li>
        </ul>
      </li>
      <li @mouseenter="abrirMenu('testes')" @mouseleave="fecharMenu">
        <a><FlaskConical :size="18" /><span>Testes Rápidos</span></a>
        <ul class="submenu" v-show="menuAberto === 'testes'">
          <li>
            <router-link :to="{ name: 'AdminGerenciarTestes' }">Gerenciar Catálogo</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'AdminGerenciarLiberacoes' }"
              >Gerenciar Liberações</router-link
            >
          </li>
          <li>
            <router-link :to="{ name: 'AdminRelatorioSisloglab' }">Relatório SISLOGLAB</router-link>
          </li>
          <li><router-link :to="{ name: 'AdminRelatoriosBoletim' }">Relatórios</router-link></li>
        </ul>
      </li>
      <li @mouseenter="abrirMenu('estoque')" @mouseleave="fecharMenu">
        <a><Boxes :size="18" /><span>Estoque</span></a>
        <ul class="submenu" v-show="menuAberto === 'estoque'">
          <li>
            <router-link :to="{ name: 'AdminControleEstoque' }">Entrada/Consulta</router-link>
          </li>
        </ul>
      </li>
      <li @mouseenter="abrirMenu('manutencao')" @mouseleave="fecharMenu">
        <a><ShieldCheck :size="18" /><span>Manutenção</span></a>
        <ul class="submenu" v-show="menuAberto === 'manutencao'">
          <li><router-link :to="{ name: 'AdminSaudeSistema' }">Saúde do Sistema</router-link></li>
          <li><router-link :to="{ name: 'AdminLogAtividades' }">Logs de Atividade</router-link></li>
        </ul>
      </li>
      <li @mouseenter="abrirMenu('configuracoes')" @mouseleave="fecharMenu">
        <a><Settings :size="18" /><span>Configurações</span></a>
        <ul class="submenu" v-show="menuAberto === 'configuracoes'">
          <li>
            <router-link :to="{ name: 'AdminControlePrazos' }">Prazos do Sistema</router-link>
          </li>
        </ul>
      </li>
    </ul>

    <ul v-if="storeUsuario.ehEnfermeiro">
      <li>
        <router-link :to="{ name: 'EnfermeiroProducaoMensal' }">
          <Calendar :size="18" /><span>Produção Mensal</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'EnfermeiroProducaoSemanal' }">
          <CalendarClock :size="18" /><span>Produção Semanal</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'EnfermeiroSolicitarInsumos' }">
          <ShoppingBasket :size="18" /><span>Insumos</span>
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'EnfermeiroImpressoes' }">
          <Printer :size="18" /><span>Impressões</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
// Script permanece o mesmo, apenas o import do Megaphone não é mais necessário
import { ref } from 'vue'
import { useStoreUsuario } from '@/nucleo/autenticacao/storeUsuario'
import {
  Home,
  Users,
  Settings,
  FlaskConical,
  Boxes,
  ShieldCheck,
  Calendar,
  CalendarClock,
  Printer,
  ShoppingBasket,
} from 'lucide-vue-next'

const storeUsuario = useStoreUsuario()
const menuAberto = ref(null)
let menuTimeout = null

function abrirMenu(nomeMenu) {
  clearTimeout(menuTimeout)
  menuAberto.value = nomeMenu
}
function fecharMenu() {
  menuTimeout = setTimeout(() => {
    menuAberto.value = null
  }, 200)
}
function toggleMenu(nomeMenu) {
  menuAberto.value = menuAberto.value === nomeMenu ? null : nomeMenu
}
</script>

<style scoped>
.navegacao-principal {
  display: flex;
  height: 100%;
  margin-left: 20px;
}
.navegacao-principal ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
}
.navegacao-principal > ul > li {
  position: relative;
  height: 100%;
}
.navegacao-principal ul a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 15px;
  height: 100%;
  color: var(--cor-texto-primario);
  text-decoration: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
  font-weight: 500;
}
.navegacao-principal ul a:hover,
.navegacao-principal ul a.router-link-exact-active {
  color: var(--cor-borda-hover);
  border-bottom-color: var(--cor-borda-hover);
}
.submenu {
  position: absolute;
  top: var(--altura-cabecalho, 85px);
  left: 0;
  background-color: white;
  color: #333;
  list-style: none;
  padding: 5px 0;
  margin: 0;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  border-top: 3px solid var(--cor-borda-hover);
  animation: fadeIn 0.2s ease-in-out;
  z-index: 100;
}
.submenu li a {
  color: #333;
  padding: 10px 20px;
  white-space: nowrap;
  border-bottom: none;
  display: block;
}
.submenu li a:hover {
  background-color: var(--cor-fundo-pagina);
  color: var(--cor-primaria);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
