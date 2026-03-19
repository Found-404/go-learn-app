<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, computed, nextTick } from "vue";

const getNode = inject("getNode") as () => any;
const node = getNode();

const data = ref(node.getData() || {});
const isSelected = ref(false);
const isEditing = ref(data.value.isEditing || false);
const editingLabel = ref(data.value.label || "");
const labelInput = ref<HTMLInputElement | null>(null);
let isReadyForBlur = false;

// 统一处理进入编辑模式的逻辑
const enterEditMode = () => {
  isEditing.value = true;
  editingLabel.value = data.value.label || "";
  isReadyForBlur = false; // 立即禁用失焦处理

  nextTick(() => {
    if (labelInput.value) {
      labelInput.value.focus();
      labelInput.value.select();
    }
    // 延迟开启失焦处理，以跳过因小地图渲染等原因导致的瞬时失焦
    setTimeout(() => {
      isReadyForBlur = true;
    }, 200);
  });
};

const onDataChange = ({ current }: any) => {
  data.value = current || {};
  if (current.isEditing && !isEditing.value) {
    enterEditMode();
  } else if (!current.isEditing && isEditing.value) {
    isEditing.value = false;
  }
};

const onSelectionChange = () => {
  const graph = (window as any).__x6_graph__;
  if (graph) {
    isSelected.value = graph.isSelected(node);
  }
};

onMounted(() => {
  node.on("change:data", onDataChange);
  const graph = (window as any).__x6_graph__;
  if (graph) {
    graph.on("node:selected", onSelectionChange);
    graph.on("node:unselected", onSelectionChange);
    graph.on("edge:connected", updateChildCount);
    graph.on("edge:added", updateChildCount);
    graph.on("edge:removed", updateChildCount);
    graph.on("node:removed", updateChildCount);
    graph.on("node:added", updateChildCount);
    isSelected.value = graph.isSelected(node);
    updateChildCount();
  }
  if (isEditing.value) {
    enterEditMode();
  }
});

onUnmounted(() => {
  node.off("change:data", onDataChange);
  const graph = (window as any).__x6_graph__;
  if (graph) {
    graph.off("node:selected", onSelectionChange);
    graph.off("node:unselected", onSelectionChange);
    graph.off("edge:connected", updateChildCount);
    graph.off("edge:added", updateChildCount);
    graph.off("edge:removed", updateChildCount);
    graph.off("node:removed", updateChildCount);
    graph.off("node:added", updateChildCount);
  }
});

const label = computed(() => data.value.label || node.label || "新节点");
const collapsed = computed(() => !!data.value.collapsed);
const childCount = ref(0);

const updateChildCount = () => {
  setTimeout(() => {
    const graph = (window as any).__x6_graph__;
    if (graph) {
      const getAllDescendants = (startNode: any): any[] => {
        let results: any[] = [];
        const outEdges = graph.getOutgoingEdges(startNode);
        if (outEdges) {
          outEdges.forEach((edge: any) => {
            const target = edge.getTargetCell();
            if (target && target.isNode()) {
              results.push(target);
              results = results.concat(getAllDescendants(target));
            }
          });
        }
        return results;
      };
      const descendants = getAllDescendants(node);
      const uniqueDescendants = Array.from(
        new Set(descendants.map((n) => n.id)),
      );
      childCount.value = uniqueDescendants.length;
    }
  }, 50);
};

const isLeaf = computed(() => {
  return data.value.isLeaf !== false && childCount.value === 0;
});

const onToggleCollapse = (e: MouseEvent) => {
  e.stopPropagation();
  const graph = (window as any).__x6_graph__;
  if (graph) {
    graph.trigger("node:toggle:collapse", { nodeId: node.id });
  }
};

const onAddChild = (e: MouseEvent) => {
  e.stopPropagation();
  const graph = (window as any).__x6_graph__;
  if (graph) {
    graph.trigger("node:add:child", { parentId: node.id });
  }
};

const startEditing = () => {
  enterEditMode();
};

const handleBlur = () => {
  if (!isReadyForBlur) {
    // 如果还没准备好处理失焦，则忽略
    return;
  }

  const newLabel = editingLabel.value.trim();
  if (data.value.isNew) {
    // 新建节点
    if (newLabel) {
      node.setData({ label: newLabel, isNew: false, isEditing: false });
    } else {
      node.remove();
    }
  } else {
    // 编辑现有节点
    if (newLabel) {
      node.setData({ label: newLabel, isEditing: false });
    } else {
      // 如果名称为空，则恢复为编辑前名称
      editingLabel.value = label.value;
    }
  }
  isEditing.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    handleBlur();
  } else if (e.key === "Escape") {
    if (data.value.isNew) {
      node.remove();
    } else {
      editingLabel.value = label.value;
    }
    isEditing.value = false;
  }
};

const nodeClasses = computed(() => ({
  "mindmap-vue-node": true,
  "is-leaf": isLeaf.value,
  "is-branch": !isLeaf.value,
  "is-selected": isSelected.value,
  "is-editing": isEditing.value,
}));
</script>

<template>
  <div :class="nodeClasses">
    <div
      v-if="childCount > 0"
      class="collapse-button"
      @click="onToggleCollapse"
      :title="collapsed ? '展开' : '折叠'"
    >
      <div class="count-badge">{{ childCount }}</div>
      <div class="toggle-icon" :class="{ 'is-collapsed': collapsed }">
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          stroke="currentColor"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div class="node-content" @dblclick="startEditing">
      <div v-if="!isEditing" class="node-label">{{ label }}</div>
      <input
        v-else
        ref="labelInput"
        v-model="editingLabel"
        class="node-label-input"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @mousedown.stop
        @dblclick.stop
      />
    </div>

    <div
      v-if="isLeaf && !isEditing"
      class="add-button-inline"
      @click="onAddChild"
      title="添加子节点"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        stroke="currentColor"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.node-label-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  outline: none;
  box-sizing: border-box;
  padding: 0 5px;
}

.mindmap-vue-node.is-editing {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-ring);
}

.mindmap-vue-node {
  /* 基础变量定义，方便后续自定义 */
  --node-bg: #ffffff;
  --node-border: #e2e8f0;
  --node-text: #1e293b;
  --node-radius: 10px;

  --primary-color: #3b82f6;
  --primary-soft: rgba(59, 130, 246, 0.1);
  --primary-ring: rgba(59, 130, 246, 0.4);

  --leaf-bg: #f8fafc;
  --leaf-border: #cbd5e1;
  --leaf-text: #64748b;

  --selection-border-width: 2.5px;
  --selection-color: #3b82f6;

  --collapse-btn-bg: #fff;
  --collapse-btn-border: #3b82f6;
  --collapse-btn-text: #3b82f6;

  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--node-bg);
  border: 1.5px solid var(--node-border);
  border-radius: var(--node-radius);
  box-sizing: border-box;
  padding: 0;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 按钮移入内部，移除动画 */
.add-button-inline {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.add-button-inline:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-50%) scale(1.1);
}

.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 44px 0 14px; /* 为右侧按钮留出空间 */
}

/* 折叠/展开按钮样式 */
.collapse-button {
  position: absolute;
  right: -12px; /* 悬浮在节点右侧边缘 */
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: var(--collapse-btn-bg);
  border: 1.5px solid var(--collapse-btn-border);
  border-radius: 20px;
  padding: 2px 6px;
  height: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.collapse-button:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.count-badge {
  font-size: 11px;
  font-weight: 700;
  color: var(--collapse-btn-text);
  margin-right: 2px;
  line-height: 1;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--collapse-btn-text);
  transition: transform 0.3s ease;
  transform: rotate(-90deg); /* 默认向右（指向子节点） */
}

.toggle-icon.is-collapsed {
  transform: rotate(0deg); /* 折叠时向下或保持原样 */
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--node-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 有子节点的节点样式 - 蓝色边缘卡片 */
.is-branch {
  border-left: 4px solid var(--primary-color);
  background: var(--node-bg);
}
.is-branch .node-label {
  color: var(--node-text);
  font-weight: 600;
}

/* 末尾节点样式 - 灰色简洁卡片 */
.is-leaf {
  background: var(--leaf-bg);
  border-color: var(--leaf-border);
}
.is-leaf .node-label {
  color: var(--leaf-text);
  font-weight: normal;
}

/* 悬浮交互 */
.mindmap-vue-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

/* 选中状态：点击节点后，该节点获取焦点改变边框颜色 */
.is-selected {
  border-color: var(--selection-color) !important;
  border-width: var(--selection-border-width);
  /* 添加微弱阴影提升层级，但不遮挡边框颜色 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  background: #ffffff; /* 选中时变成白色，增加对比度 */
}
</style>
