<script setup lang="ts">
import MindMap from '../components/MindMap.vue'
</script>

<template>
  <div class="mindmap-view">
    <MindMap />
  </div>
</template>

<style scoped>
.mindmap-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
