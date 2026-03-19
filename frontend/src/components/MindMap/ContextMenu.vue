<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Plus } from 'lucide-vue-next';

const props = defineProps<{
  x: number;
  y: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'add-node'): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);

const handleAddNode = () => {
  emit('add-node');
  emit('close');
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div
    v-if="visible"
    ref="menuRef"
    class="context-menu"
    :style="{ left: props.x + 'px', top: props.y + 'px' }"
  >
    <div class="menu-item" @click="handleAddNode">
      <Plus :size="16" class="menu-icon" />
      <span>新增节点</span>
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px;
  min-width: 120px;
  user-select: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #1e293b;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f1f5f9;
}

.menu-icon {
  color: #64748b;
}
</style>
