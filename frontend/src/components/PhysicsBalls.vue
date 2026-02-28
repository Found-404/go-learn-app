<template>
  <div ref="container" class="physics-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import Matter from "matter-js";

// 直接导入本地图片
import img01 from '../assets/questImage/01.png';
import img02 from '../assets/questImage/02.png';
import img03 from '../assets/questImage/03.png';
import img04 from '../assets/questImage/04.png';
import img05 from '../assets/questImage/05.png';
import img06 from '../assets/questImage/06.png';
import img07 from '../assets/questImage/07.png';
import img08 from '../assets/questImage/08.png';
import img09 from '../assets/questImage/09.png';
import img10 from '../assets/questImage/10.png';
import img11 from '../assets/questImage/11.png';

const chartletList = [
  img01, img02, img03, img04, img05, img06, img07, img08, img09, img10, img11,
];
const container = ref(null);
let engine, render, runner, mouseConstraint;
let groundBody, leftWallBody, rightWallBody, ceilingBody; // 声明墙壁 Body 实例
let currentWidth, currentVisibleHeight; // 用于实时跟踪容器尺寸，供安全边界检查使用
const activeBalls = ref([]); // 用于存储当前活跃的小球实例

onMounted(() => {
  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } =
    Matter;

  // 创建引擎并提高物理精度，防止穿模
  engine = Engine.create({
    velocityIterations: 10, // 增加速度迭代次数（默认 8）
    positionIterations: 15, // 增加位置迭代次数（默认 6）
  });
  const world = engine.world;

  // 初始化容器尺寸
  currentWidth = container.value.clientWidth;
  currentVisibleHeight = window.innerHeight;
  const totalHeight = currentVisibleHeight + 800; // 顶部缓冲区高度为 800px

  // 创建渲染器
  render = Render.create({
    element: container.value,
    engine: engine,
    options: {
      width: currentWidth,
      height: totalHeight,
      wireframes: false,
      background: "transparent",
      pixelRatio: window.devicePixelRatio,
    },
  });

  Render.run(render);

  // 创建运行器
  runner = Runner.create();
  Runner.run(runner, engine);

  // 添加边界墙（超大物理边界方案）
  const wallOptions = {
    isStatic: true,
    render: {
      visible: true,
      fillStyle: "#FF0000",
      strokeStyle: "#FFFFFF",
      lineWidth: 1, // 边界墙宽度
    },
    restitution: 1,
  };

  groundBody = Bodies.rectangle(
    currentWidth / 2,
    currentVisibleHeight + 800 + 50,
    10000,
    100,
    wallOptions,
  );
  leftWallBody = Bodies.rectangle(-50, totalHeight / 2, 100, 10000, wallOptions);
  rightWallBody = Bodies.rectangle(
    currentWidth + 50,
    totalHeight / 2,
    100,
    10000,
    wallOptions,
  );
  ceilingBody = Bodies.rectangle(currentWidth / 2, 50, 10000, 100, wallOptions);

  Composite.add(world, [groundBody, leftWallBody, rightWallBody, ceilingBody]);

  // 优化：使用 Promise 确保所有图片加载完成后再添加小球，避免异步冲突
  const loadImages = chartletList.map((url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ url, img });
    });
  });

  Promise.all(loadImages).then((loadedImages) => {
    if (!container.value || !engine) return;

    const radius = 90;

    // 优化：更合理的初始分布，避免重叠引发的“爆炸”
    const ballsToAdd = loadedImages.map((data, i) => {
      // 在顶部 800px 的缓冲区内，按网格或有序偏移排列，防止重叠
      const cols = 4;
      const row = Math.floor(i / cols);
      const col = i % cols;

      const startX = (currentWidth / (cols + 1)) * (col + 1);
      const startY = 150 + row * 180; // 在顶部缓冲区垂直分层排列

      const ball = Bodies.circle(
        startX + (Math.random() * 20 - 10), // 加入微小随机偏移，增加动态效果
        startY,
        radius,
        {
          restitution: 0.8,
          friction: 0.05,
          frictionAir: 0.01,
          render: {
            sprite: {
              texture: data.url,
              xScale: (radius * 2) / data.img.width,
              yScale: (radius * 2) / data.img.height,
            },
          },
        },
      );
      activeBalls.value.push(ball);
      return ball;
    });

    Composite.add(world, ballsToAdd);
  });

  // 关键：添加安全边界检查，防止极端情况下小球穿模消失
  const { Events } = Matter;
  Events.on(engine, "afterUpdate", () => {
    if (!engine) return;
    
    activeBalls.value.forEach((ball) => {
      // 使用实时更新的 currentVisibleHeight 和 currentWidth
      const margin = 200;
      const isOutOfBounds = 
        ball.position.y > currentVisibleHeight + 800 + margin || // 掉下去了
        ball.position.x < -margin ||                             // 飞到左边外面了
        ball.position.x > currentWidth + margin;                // 飞到右边外面了

      if (isOutOfBounds) {
        // 重置位置到顶部缓冲区
        Matter.Body.setPosition(ball, {
          x: Math.random() * (currentWidth - 100) + 50,
          y: Math.random() * 200 + 50 // 重新出现在顶部
        });
        // 重置速度
        Matter.Body.setVelocity(ball, { x: 0, y: 0 });
      }
    });
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
    currentWidth = container.value.clientWidth;
    currentVisibleHeight = window.innerHeight; // 更新当前可见视口高度
    const totalHeight = currentVisibleHeight + 800; // Matter.js 世界的总高度

    render.canvas.width = currentWidth;
    render.canvas.height = totalHeight; // Canvas 高度设置为总高度
    render.options.width = currentWidth;
    render.options.height = totalHeight;

    // 只更新地面和墙壁的位置，不需要修改其尺寸 (因为初始尺寸极大)
    Matter.Body.setPosition(groundBody, {
      x: currentWidth / 2,
      y: currentVisibleHeight + 800 + 50,
    });

    Matter.Body.setPosition(leftWallBody, { x: -50, y: totalHeight / 2 });
    Matter.Body.setPosition(rightWallBody, {
      x: currentWidth + 50,
      y: totalHeight / 2,
    });

    Matter.Body.setPosition(ceilingBody, { x: currentWidth / 2, y: 50 });
  };

  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    // 移除所有活跃的小球
    activeBalls.value.forEach((ball) => {
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
