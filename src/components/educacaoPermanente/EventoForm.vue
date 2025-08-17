<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('cancelar')">
    <div class="modal-content">
      <header class="modal-header">
        <h3>{{ evento.id ? "Editar Evento" : "Adicionar Novo Evento" }}</h3>
        <button
          @click="$emit('cancelar')"
          class="close-button"
          aria-label="Fechar"
        >
          <X :size="24" />
        </button>
      </header>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label for="data">Data:</label>
            <input id="data" type="date" v-model="form.data" required />
          </div>
          <div class="form-group">
            <label for="horario">Horário:</label>
            <input id="horario" type="time" v-model="form.horario" required />
          </div>
          <div class="form-group span-2">
            <label for="local">Local:</label>
            <input
              id="local"
              type="text"
              v-model="form.local"
              required
              placeholder="Ex: Auditório da UBS"
            />
          </div>
          <div class="form-group span-2">
            <label for="tema">Tema:</label>
            <input
              id="tema"
              type="text"
              v-model="form.tema"
              required
              placeholder="Tema principal do evento"
            />
          </div>
          <div class="form-group">
            <label for="palestrante">Palestrante:</label>
            <input
              id="palestrante"
              type="text"
              v-model="form.palestrante"
              required
            />
          </div>
          <div class="form-group">
            <label for="publicoAlvo">Público-Alvo:</label>
            <input
              id="publicoAlvo"
              type="text"
              v-model="form.publicoAlvo"
              required
              placeholder="Ex: Gestantes, Idosos"
            />
          </div>
          <div class="form-group span-2">
            <label for="objetivos">Objetivos:</label>
            <textarea
              id="objetivos"
              v-model="form.objetivos"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group span-2">
            <label for="conteudo">Conteúdo:</label>
            <textarea id="conteudo" v-model="form.conteudo" rows="4"></textarea>
          </div>
        </div>

        <footer class="modal-footer">
          <button
            type="button"
            @click="$emit('cancelar')"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            <Save :size="18" />
            Salvar Evento
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { Timestamp } from "firebase/firestore";
import { X, Save } from "lucide-vue-next";

const props = defineProps({
  evento: { type: Object, default: () => ({}) },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["salvar", "cancelar"]);

const form = ref({});

watch(
  () => props.evento,
  (newEvento) => {
    form.value = { ...newEvento };
    if (newEvento && newEvento.data instanceof Timestamp) {
      form.value.data = new Date(newEvento.data.seconds * 1000)
        .toISOString()
        .split("T")[0];
    }
  },
  { immediate: true, deep: true }
);

const handleSubmit = () => {
  const dataParaSalvar = { ...form.value };
  dataParaSalvar.data = new Date(form.value.data + "T12:00:00Z");
  emit("salvar", dataParaSalvar);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px; /* ✅ MAIS LARGO */
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* ✅ ALTURA MÁXIMA CONTROLADA */
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}
.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #6c757d;
}
.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* ✅ Conteúdo interno rolável, mantendo modal baixo */
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem; /* Aumenta o espaçamento lateral */
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.span-2 {
  grid-column: span 2;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}
.form-group input,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
}
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
</style>
