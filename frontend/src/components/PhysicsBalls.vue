<template>
  <div ref="container" class="physics-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import Matter from "matter-js";

const chartletList = [
  "http://www.questn.com/static/circles/arb.png",
  "http://www.questn.com/static/circles/bsc.png",
  "http://www.questn.com/static/circles/coinbase.png",
  "http://www.questn.com/static/circles/degate.png",
  "http://www.questn.com/static/circles/eth.png",
  "http://www.questn.com/static/circles/onekey.png",
  "http://www.questn.com/static/circles/sui.png",
  "http://www.questn.com/static/circles/u1.png",
  "http://www.questn.com/static/circles/u2.png",
  "http://www.questn.com/static/circles/u3.png",
  "http://www.questn.com/static/circles/usdc.png",
];

const container = ref(null);
let engine, render, runner, mouseConstraint;
const activeBalls = ref([]); // 用于存储当前活跃的小球实例

onMounted(() => {
  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } =
    Matter;

  // 创建引擎
  engine = Engine.create();
  const world = engine.world;

  // 获取容器尺寸
  const width = container.value.clientWidth;
  const height = container.value.clientHeight; // 此时 height 已经是 (window.innerHeight + 800px)
  const visibleHeight = window.innerHeight; // 可见区域的高度

  // 创建渲染器
  render = Render.create({
    element: container.value,
    engine: engine,
    options: {
      width: width,
      height: height, // Canvas 高度与容器高度一致
      wireframes: false,
      background: "transparent",
      pixelRatio: window.devicePixelRatio,
    },
  });

  Render.run(render);

  // 创建运行器
  runner = Runner.create();
  Runner.run(runner, engine);

  // 添加边界墙
  const wallOptions = {
    isStatic: true,
    render: { visible: false },
    restitution: 1,
  };

  // 底部墙壁：位于可见区域的底部
  const ground = Bodies.rectangle(
    width / 2,
    visibleHeight + 800 + 50, // 800px 是超出部分，50 是墙壁厚度的一半 (100/2)
    width,
    100, // 墙壁厚度增加
    wallOptions,
  );
  // 左墙壁：覆盖整个 Matter.js 世界的高度
  const leftWall = Bodies.rectangle(-50, height / 2, 100, height, wallOptions); // 墙壁厚度增加，x 坐标调整
  // 右墙壁：覆盖整个 Matter.js 世界的高度
  const rightWall = Bodies.rectangle(
    width + 50,
    height / 2,
    100, // 墙壁厚度增加，x 坐标调整
    height,
    wallOptions,
  );
  // 顶部墙壁：位于 Matter.js 世界的顶部，即 Canvas 的顶部
  const ceiling = Bodies.rectangle(width / 2, 50, width, 100, wallOptions); // 墙壁厚度增加，y 坐标调整

  Composite.add(world, [ground, leftWall, rightWall, ceiling]);

  // 添加物理小球（带贴图自适应）
  const ballCount = 11;
  const radius = 90;

  chartletList.forEach((url, i) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      // 确保组件仍然挂载且容器存在
      if (!container.value || !engine) return;

      const ball = Bodies.circle(
        Math.random() * (width - 100) + 50,
        Math.random() * 750, // 小球生成在 Canvas 顶部 0-750px 范围内 (800 - 50)
        radius,
        {
          restitution: 0.8,
          friction: 0.05,
          render: {
            sprite: {
              texture: url,
              xScale: (radius * 2) / img.width,
              yScale: (radius * 2) / img.height,
            },
          },
        },
      );
      activeBalls.value.push(ball); // 存储小球实例
      Composite.add(world, ball);
    };
  });

  // 添加鼠标交互
  const mouse = Mouse.create(render.canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false },
    },
  });

  Composite.add(world, mouseConstraint);
  render.mouse = mouse;

  // 窗口大小调整处理
  const handleResize = () => {
    if (!container.value || !engine) return; // 确保容器和引擎存在
    const newWidth = container.value.clientWidth;
    const newHeight = container.value.clientHeight;

    render.canvas.width = newWidth;
    render.canvas.height = newHeight;
    render.options.width = newWidth;
    render.options.height = newHeight;

    Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 50 });
    Matter.Body.setPosition(rightWall, { x: newWidth + 50, y: newHeight / 2 });
    Matter.Body.setPosition(leftWall, { x: -50, y: newHeight / 2 });
    Matter.Body.setPosition(ceiling, { x: newWidth / 2, y: 50 });
  };

  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    // 移除所有活跃的小球
    activeBalls.value.forEach(ball => {
      Composite.remove(engine.world, ball);
    });
    activeBalls.value = []; // 清空数组

    Render.stop(render);
    Runner.stop(runner);
    Engine.clear(engine);
    if (render.canvas) {
      render.canvas.remove();
    }
    // 清理 Matter.js 实例，防止内存泄漏
    engine = null;
    render = null;
    runner = null;
    mouseConstraint = null;
  });
});
</script>

<style scoped>
.physics-container {
  position: absolute;
  top: -800px; /* 顶部超出页面 800px */
  left: 0;
  width: 100%;
  height: calc(100% + 800px); /* 容器高度增加 800px */
  z-index: 0;
}

.physics-container :deep(canvas) {
  display: block;
  cursor: grab;
}

.physics-container :deep(canvas:active) {
  cursor: grabbing;
}
</style>
