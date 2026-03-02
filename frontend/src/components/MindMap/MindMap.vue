<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { initGraph, graph } from "./MiniMapInit";
const container = ref<HTMLDivElement | null>(null);
onMounted(() => {
  initGraph(container);
});

onUnmounted(() => {
  graph?.dispose();
});
</script>

<template>
  <div class="mindmap-wrapper">
    <div class="toolbar">
      <div class="tip">
        提示: 双击空白处创建，拖拽靠近自动吸附，Ctrl+滚轮缩放
      </div>
      <div>
        <Button @click="graph?.undo()"> Undo </Button>
        <Button @click="graph?.redo()"> Redo </Button>
      </div>
    </div>
    <div ref="container" class="graph-container"></div>
  </div>
</template>

<style scoped>
.mindmap-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.toolbar {
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.tip {
  font-size: 13px;
  color: #64748b;
}

.graph-container {
  flex: 1;
  width: 100%;
  height: 100%;
  outline: none;
}
</style>
