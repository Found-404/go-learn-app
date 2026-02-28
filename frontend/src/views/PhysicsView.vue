<script setup lang="ts">
import PhysicsBalls from '../components/PhysicsBalls.vue'
</script>

<template>
  <div class="physics-view">
    <div class="physics-header">
      <h1>Matter.js 物理模拟</h1>
      <p>基于 2D 刚体引擎实现的动态交互实验室</p>
    </div>
    <PhysicsBalls />
  </div>
</template>

<style scoped>
.physics-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background-color: #000;
  margin: -30px;
  padding: 30px;
}

.physics-header {
  z-index: 10;
  pointer-events: none;
  margin-bottom: 20px;
}

.physics-header h1 {
  font-size: 28px;
  color: #ffffff;
  margin: 0;
}

.physics-header p {
  color: #94a3b8;
  margin: 8px 0 0;
}
</style>
