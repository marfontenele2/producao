<template>
    <div class="secao-dados">
        <div class="cabecalho-secao">
            <h3 class="subtitulo">{{ titulo }}</h3>
            <button type="button" class="botao botao-acao" @click="adicionarItem"><PlusCircle :size="14" /> Adicionar</button>
        </div>
        <table class="tabela-padrao tabela-perdas">
            <thead>
                <tr>
                    <th>Lote</th>
                    <th>Quantidade</th>
                    <th v-if="comMotivo">Motivo</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!itens || itens.length === 0"><td :colspan="comMotivo ? 4 : 3" class="sem-registros">Nenhum item adicionado.</td></tr>
                <tr v-for="(item, index) in itens" :key="index">
                    <td><input type="text" v-model="item.lote" /></td>
                    <td><input type="number" min="1" v-model.number="item.quantidade" /></td>
                    <td v-if="comMotivo"><input type="text" v-model="item.motivo" /></td>
                    <td><button type="button" class="botao-acao excluir" @click="removerItem(index)"><Trash2 :size="16" /></button></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
// [CORRIGIDO] O nome do pacote de ícones foi corrigido de 'lucide--vue-next' para 'lucide-vue-next'
import { PlusCircle, Trash2 } from 'lucide-vue-next';

const props = defineProps({
    titulo: String,
    itens: Array,
    comMotivo: { type: Boolean, default: false }
});

function adicionarItem() {
    const novoItem = { lote: '', quantidade: 1 };
    if (props.comMotivo) {
        novoItem.motivo = '';
    }
    props.itens.push(novoItem);
}

function removerItem(index) {
    props.itens.splice(index, 1);
}
</script>

<style scoped>
.cabecalho-secao { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.subtitulo { margin: 0; }
.tabela-perdas input { width: 100%; padding: 8px; border: 1px solid var(--cor-borda-suave); border-radius: 4px; }
.sem-registros { text-align: center; color: #64748b; }
</style>