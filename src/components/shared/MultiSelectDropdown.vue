<template>
  <div class="multiselect-container" ref="containerRef">
    <button type="button" @click="toggleDropdown" class="multiselect-button">
      <span>{{ buttonLabel }}</span>
      <ChevronDown :size="16" :class="{ 'is-rotated': isOpen }" />
    </button>
    <div v-if="isOpen" class="dropdown-panel">
      <ul>
        <li v-for="option in options" :key="option.value">
          <label>
            <input
              type="checkbox"
              :value="option.value"
              :checked="isSelected(option.value)"
              @change="toggleOption(option.value)"
            />
            {{ option.text }}
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps({
  options: { type: Array, required: true }, // Array de { value: 'id', text: 'Label' }
  modelValue: { type: Array, required: true },
  placeholder: { type: String, default: "Selecione" },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const containerRef = ref(null);

const buttonLabel = computed(() => {
  if (props.modelValue.length === 0) {
    return props.placeholder;
  }
  if (props.modelValue.length === 1) {
    return `1 item selecionado`;
  }
  return `${props.modelValue.length} itens selecionados`;
});

const isSelected = (optionValue) => {
  return props.modelValue.includes(optionValue);
};

const toggleOption = (optionValue) => {
  const newSelection = [...props.modelValue];
  const index = newSelection.indexOf(optionValue);
  if (index > -1) {
    newSelection.splice(index, 1);
  } else {
    newSelection.push(optionValue);
  }
  emit("update:modelValue", newSelection);
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<style scoped>
.multiselect-container {
  position: relative;
  width: 250px;
}
.multiselect-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: #fff;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
}
.multiselect-button:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.multiselect-button span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.multiselect-button svg {
  transition: transform 0.2s ease-in-out;
}
.multiselect-button svg.is-rotated {
  transform: rotate(180deg);
}
.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-top: 4px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: normal;
}
li:hover {
  background-color: #f0f2f5;
}
</style>
