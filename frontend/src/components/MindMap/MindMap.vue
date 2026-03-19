<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { initGraph, graph } from "./MiniMapInit";
const container = ref<HTMLDivElement | null>(null);
const minimapContainer = ref<HTMLDivElement | null>(null);
onMounted(() => {
  initGraph(container, minimapContainer);
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
    <div class="graph-wrapper">
      <div ref="container" class="graph-container"></div>
      <div class="minimap-container">
        <div ref="minimapContainer" class="minimap-canvas"></div>
        <div class="minimap-toolbar">
          <button class="minimap-btn" @click="graph?.zoom(0.1)" title="放大">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="minimap-btn" @click="graph?.zoom(-0.1)" title="缩小">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
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

.graph-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.minimap-container {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 158px;
  height: 210px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.minimap-canvas {
  flex: 1;
  width: 100%;
}

.minimap-toolbar {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.minimap-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.minimap-btn:hover {
  background: #f1f5f9;
  color: #3b82f6;
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
