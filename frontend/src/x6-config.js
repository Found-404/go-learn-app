import { Graph } from "@antv/x6";
import { register } from "@antv/x6-vue-shape";
import MindMapNode from "./components/MindMap/MindMapNode.vue"; // 导入 MindMapNode 组件

// 注册自定义 Vue 节点组件
register({
  shape: "mindmap-vue-node",
  width: 160, // 增大宽度
  height: 60, // 增大高度
  component: MindMapNode,
  // 同样添加连接桩 (Ports)
  ports: {
    groups: {
      left: {
        position: "left",
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
      right: {
        position: {
          name: "right",
          args: {
            dx: 9, // 向右偏移，避开折叠按钮 (按钮 right: -12px，加上自身宽度)
          },
        },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5F95FF",
            strokeWidth: 1,
            fill: "#fff",
            style: {
              visibility: "hidden",
            },
          },
        },
      },
    },
    items: [
      { group: "left", id: "port-left" },
      { group: "right", id: "port-right" },
    ],
  },
});

// 注册预览节点 (Ghost Node)
Graph.registerNode("ghost-node", {
  inherit: "rect",
  width: 120,
  height: 40,
  attrs: {
    body: {
      fill: "rgba(95, 149, 255, 0.2)",
      stroke: "rgba(95, 149, 255, 0.4)",
      strokeDasharray: "5,5",
      strokeWidth: 1,
      rx: 4,
      ry: 4,
    },
    label: {
      fill: "rgba(255, 255, 255, 0.4)",
      fontSize: 14,
    },
  },
});
