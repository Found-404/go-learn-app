import { Ref } from "vue";
import { Graph, Node, Edge, EdgeView } from "@antv/x6";
import { Selection } from "@antv/x6-plugin-selection";
import { Keyboard } from "@antv/x6-plugin-keyboard";
import { History } from "@antv/x6-plugin-history";
import { Transform } from "@antv/x6-plugin-transform";
import { MiniMap } from "@antv/x6-plugin-minimap";
let graph: Graph | null = null;

// 默认连线样式
const edgeConfig = {
  attrs: {
    line: {
      stroke: "#A2B1C3",
      strokeWidth: 2,
      targetMarker: {
        name: "block", // 使用实心箭头样式
        width: 8,
        height: 6,
      },
    },
  },
  // connector: {
  //   name: "jumpover",
  //   args: {
  //     radius: 0,
  //   },
  // },
  router: {
    name: "manhattan",
  },
};

const initGraph = (
  containerRef: Ref<HTMLDivElement | null>,
  miniMapContainerRef: Ref<HTMLDivElement | null>,
) => {
  if (!containerRef.value) return;

  graph = new Graph({
    container: containerRef.value,
    autoResize: true,
    grid: true,
    mousewheel: {
      enabled: true,
      modifiers: ["ctrl", "meta"],
    },
    panning: true,
    connecting: {
      // router: {
      //   name: "manhattan",
      //   args: {
      //     step: 10,
      //     excludeTerminals: ["source"],
      //     startDirections: ["right"],
      //     endDirections: ["left"],
      //     padding: 10,
      //   },
      // },
      allowBlank: false,
      allowLoop: false,
      highlight: true,
      snap: true, // 启用自动吸附
      // 关键：强制连线只能从 source 节点的右侧出发，进入 target 节点的左侧
      validateConnection({ sourceMagnet, targetMagnet }) {
        // 只有当起始点是右侧连接桩，目标点是左侧连接桩时才允许连接
        const sourcePortId = sourceMagnet?.getAttribute("port");
        const targetPortId = targetMagnet?.getAttribute("port");
        return sourcePortId === "port-right" && targetPortId === "port-left";
      },
      createEdge() {
        return new Edge(edgeConfig);
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: "outline",
        args: {
          attrs: {
            fill: "#5F95FF",
            stroke: "#5F95FF",
          },
        },
      },
    },
  });

  // 启用插件
  graph
    .use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: false, // 禁用拖动框选，避免与节点拖拽冲突
        movable: true,
        showNodeSelectionBox: false, // 禁用 X6 默认蓝色边框，改用 Vue 组件内部样式
      }),
    )
    .use(
      new Keyboard({
        enabled: true,
      }),
    )
    .use(
      new History({
        enabled: true,
      }),
    )
    .use(
      new Transform({
        // enabled: true,
      }),
    )
    .use(
      new MiniMap({
        container: miniMapContainerRef.value as HTMLElement,
        width: 158,
        height: 210,
        padding: 10,
      }),
    );

  // 将 graph 实例挂载到 window 上，方便 Vue 节点组件直接调用（最可靠的通信方式）
  (window as any).__x6_graph__ = graph;

  // 快捷键支持
  graph.bindKey(["backspace", "delete"], () => {
    const cells = graph?.getSelectedCells();
    if (cells && cells.length) {
      graph?.removeCells(cells);
    }
  });

  // 双击空白处创建节点
  graph.on("blank:dblclick", ({ x, y }) => {
    graph?.addNode({
      shape: "mindmap-vue-node",
      x: x - 80, // 减去宽度的一半
      y: y - 30, // 减去高度的一半
      data: {
        label: "",
        isLeaf: true,
        isNew: true,
        isEditing: true,
      },
    });
  });
  // 临时预览变量
  let ghostNode: Node | null = null;
  let ghostEdge: Edge | null = null;
  let currentTargetNode: Node | null = null;

  // 辅助函数：查找一个不遮挡其他节点的可用位置
  const getSafePosition = (
    targetParent: Node,
    nodeToPlace: Node | { id: string },
    proposedY: number,
  ) => {
    const parentBBox = targetParent.getBBox();
    const targetX = parentBBox.right + 80; // 增加间距，因为连接桩现在往外移了
    const nodeHeight = 60;
    const verticalGap = 20;

    // 获取所有在该列（X 轴相近）的节点
    const nodesInColumn =
      graph?.getNodes().filter((n) => {
        if (
          n.id === nodeToPlace.id ||
          n.id === targetParent.id ||
          (ghostNode && n.id === ghostNode.id)
        )
          return false;
        const bbox = n.getBBox();
        // 检查 X 轴是否重叠（不仅是起始点，而是整个宽度范围内是否有重叠可能）
        // 这里的逻辑简化为：只要 X 坐标相近，就认为在同一列
        return Math.abs(bbox.x - targetX) < 50;
      }) || [];

    if (nodesInColumn.length === 0) {
      return { x: targetX, y: proposedY };
    }

    // 检查某个 Y 坐标是否会引起重叠
    const isOverlapping = (y: number) => {
      return nodesInColumn.some((n) => {
        const bbox = n.getBBox();
        // 判定重叠：新节点的上下边界是否进入了已有节点的上下边界（带间距）
        return (
          y < bbox.bottom + verticalGap &&
          y + nodeHeight > bbox.top - verticalGap
        );
      });
    };

    // 如果初始位置不重叠，直接返回
    if (!isOverlapping(proposedY)) {
      return { x: targetX, y: proposedY };
    }

    // 如果重叠，尝试上下寻找最近的空位
    let step = 10;
    let maxAttempts = 100; // 避免无限循环
    for (let i = 1; i <= maxAttempts; i++) {
      const offset = i * step;
      // 优先尝试向下寻找（符合思维导图向下延展的习惯）
      if (!isOverlapping(proposedY + offset)) {
        return { x: targetX, y: proposedY + offset };
      }
      // 再尝试向上寻找
      if (!isOverlapping(proposedY - offset)) {
        return { x: targetX, y: proposedY - offset };
      }
    }

    return { x: targetX, y: proposedY };
  };

  // 清理预览
  const clearPreview = () => {
    if (ghostNode) {
      graph?.removeNode(ghostNode);
      ghostNode = null;
    }
    if (ghostEdge) {
      graph?.removeEdge(ghostEdge);
      ghostEdge = null;
    }
    currentTargetNode = null;
  };

  // 拖拽过程中
  graph.on("node:moving", ({ node }) => {
    // BUG 修复：如果节点已经有了父节点（即已经有了入边），则不再触发创建虚拟预览
    const incomingEdges = graph?.getIncomingEdges(node);
    if (incomingEdges && incomingEdges.length > 0) {
      return;
    }

    // 拖拽过程中遍历所有边，更新它们的路径
    graph?.getEdges().forEach((edge) => {
      const edgeView = graph?.findViewByCell(edge) as EdgeView;
      edgeView.update();
    });

    const nodes = graph?.getNodes() || [];
    const nodeBBox = node.getBBox();

    // 找到最近的可连接节点
    let closestNode: Node | null = null;
    let minDistance = Infinity;

    nodes.forEach((otherNode) => {
      // 排除自身和现有的预览节点
      if (otherNode.id === node.id || otherNode.shape === "ghost-node") return;

      // 检查是否已经连接
      const isConnected = graph?.getConnectedEdges(node).some((edge) => {
        return (
          edge.getSourceCellId() === otherNode.id ||
          edge.getTargetCellId() === otherNode.id
        );
      });
      if (isConnected) return;

      const otherBBox = otherNode.getBBox();

      // 修改计算逻辑：使用拖拽节点的左侧垂直中心点与目标节点的“中心点”进行比较
      // 1. 水平距离 (dx)：拖拽节点的左边缘 减去 目标节点的中心点 X 坐标
      // 2. 垂直距离 (dy)：两个节点中心点的垂直偏移量
      const dx = nodeBBox.left - otherBBox.center.x;
      const dy = Math.abs(nodeBBox.center.y - otherBBox.center.y);

      // 判定范围：
      // 水平方向 (dx) 允许较大的触发范围 (150px)，且允许从目标中心点开始往右
      // 垂直方向 (dy) 保持较小的触发范围 (80px)
      if (dx > 0 && dx < 150 && dy < 80) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          closestNode = otherNode;
        }
      }
    });
    // 如果在吸附范围内
    if (closestNode) {
      const target = closestNode as Node;
      // 如果是隐藏节点则不进行下面逻辑
      if (!target.visible) return;
      const { x: previewX, y: previewY } = getSafePosition(
        target,
        node,
        nodeBBox.y,
      );

      // 如果目标节点变了，重新创建预览
      if (currentTargetNode !== target) {
        clearPreview();
        currentTargetNode = target;

        // 创建虚拟节点
        ghostNode =
          graph?.addNode({
            shape: "ghost-node",
            x: previewX,
            y: previewY,
            label: node.getData()?.label || "",
            zIndex: -1, // 置于底层
          }) || null;

        // 创建虚拟连线
        ghostEdge =
          graph?.addEdge({
            ...edgeConfig,
            source: { cell: target.id, port: "port-right" },
            target: { cell: ghostNode?.id as string, port: "port-left" },
            attrs: {
              line: {
                ...edgeConfig.attrs.line,
                strokeDasharray: "5,5",
                opacity: 0.5,
              },
            },
            zIndex: -1,
          }) || null;
      } else if (ghostNode) {
        // 如果目标没变，实时更新预览节点坐标（依然需要避让检测）
        const { x: updatedX, y: updatedY } = getSafePosition(
          target,
          node,
          nodeBBox.y,
        );
        ghostNode.position(updatedX, updatedY);
      }
    } else {
      // 超出范围，清除预览
      clearPreview();
    }
  });

  // 拖拽结束：完成吸附
  graph.on("node:moved", ({ node }) => {
    // 同样在结束时也校验一下，防止非法状态
    const incomingEdges = graph?.getIncomingEdges(node);
    const hasParent = incomingEdges && incomingEdges.length > 0;

    if (currentTargetNode && !hasParent) {
      // 确定最终位置（使用 getSafePosition 自动避让）
      const { x: finalX, y: finalY } = getSafePosition(
        currentTargetNode,
        node,
        node.getBBox().y,
      );

      // 执行实际吸附
      node.position(finalX, finalY);

      // 建立实际连线
      graph?.addEdge({
        ...edgeConfig,
        source: { cell: currentTargetNode.id, port: "port-right" },
        target: { cell: node.id, port: "port-left" },
      });

      // ==============================
      // 此处调用接口,创建节点; 父节点为改节点
      console.log(
        `👉拖拽修改节点: 父节点: ${currentTargetNode.data.label}; 当前节点: ${node.data.label}`,
      );
      // ==============================

      // 建立连接后，手动触发一次叶子节点状态更新
      updateLeafStatus();
    }

    // 清理所有预览
    clearPreview();
  });

  // 监听画布变化，更新节点的末尾状态 (isLeaf)
  const updateLeafStatus = () => {
    // 使用 setTimeout 确保在 X6 内部状态更新后执行
    setTimeout(() => {
      const nodes = graph?.getNodes() || [];
      nodes.forEach((node) => {
        if (node.shape === "mindmap-vue-node") {
          const outEdges = graph?.getOutgoingEdges(node);
          const isLeaf = !outEdges || outEdges.length === 0;

          const currentData = node.getData() || {};
          if (currentData.isLeaf !== isLeaf) {
            // 使用完全替换 data 的方式触发 change:data 事件
            node.setData({ ...currentData, isLeaf }, { overwrite: true });
          }
        }
      });
    }, 50);
  };

  // 将渲染逻辑抽离为独立的方法，支持外部传入树形数据
  const loadTreeData = (
    data: any,
    startX: number = 100,
    startY: number = 250,
  ) => {
    if (!graph) return;

    const NODE_WIDTH = 160;
    const NODE_HEIGHT = 60;
    const HORIZONTAL_GAP = 100;
    const VERTICAL_GAP = 20;

    // 递归计算每个子树的总高度
    const calculateSubtreeHeight = (nodeData: any): number => {
      if (!nodeData.children || nodeData.children.length === 0) {
        return NODE_HEIGHT;
      }

      const childrenHeight = nodeData.children.reduce(
        (acc: number, child: any) => {
          return acc + calculateSubtreeHeight(child);
        },
        0,
      );

      const gapsHeight = (nodeData.children.length - 1) * VERTICAL_GAP;
      return Math.max(NODE_HEIGHT, childrenHeight + gapsHeight);
    };

    // 递归渲染节点
    const renderNode = (
      nodeData: any,
      x: number,
      y: number,
      parentId: string | null = null,
    ) => {
      graph?.addNode({
        id: nodeData.id,
        shape: "mindmap-vue-node",
        x,
        y,
        data: {
          label: nodeData.label,
          isLeaf: !nodeData.children || nodeData.children.length === 0,
        },
      });

      if (parentId) {
        graph?.addEdge({
          ...edgeConfig,
          source: { cell: parentId, port: "port-right" },
          target: { cell: nodeData.id, port: "port-left" },
        });
      }

      if (nodeData.children && nodeData.children.length > 0) {
        const childX = x + NODE_WIDTH + HORIZONTAL_GAP;
        const totalChildrenHeight = nodeData.children.reduce(
          (acc: number, child: any, index: number) => {
            return (
              acc +
              calculateSubtreeHeight(child) +
              (index > 0 ? VERTICAL_GAP : 0)
            );
          },
          0,
        );

        let currentY = y + NODE_HEIGHT / 2 - totalChildrenHeight / 2;
        nodeData.children.forEach((child: any) => {
          const childSubtreeHeight = calculateSubtreeHeight(child);
          const childY = currentY + childSubtreeHeight / 2 - NODE_HEIGHT / 2;
          renderNode(child, childX, childY, nodeData.id);
          currentY += childSubtreeHeight + VERTICAL_GAP;
        });
      }
    };

    // 如果是数组，则循环渲染（支持多根节点）
    if (Array.isArray(data)) {
      let currentY = startY;
      data.forEach((item) => {
        const subtreeHeight = calculateSubtreeHeight(item);
        renderNode(
          item,
          startX,
          currentY + subtreeHeight / 2 - NODE_HEIGHT / 2,
        );
        currentY += subtreeHeight + 100; // 根节点之间保持较大间距
      });
    } else {
      renderNode(data, startX, startY);
    }

    updateLeafStatus();
  };

  // 模拟后端返回的树形结构数据
  const mockBackendData = [
    {
      id: "root",
      label: "Go 学习路线",
      children: [
        {
          id: "syntax",
          label: "基础语法",
          children: [
            {
              id: "var",
              label: "变量与常量",
              children: [{ id: "test", label: "test" }],
            },
            { id: "flow", label: "控制流" },
          ],
        },
        {
          id: "advanced",
          label: "高级特性",
          children: [
            { id: "interface", label: "接口 (Interface)" },
            { id: "concurrency", label: "并发模型 (Goroutine)" },
          ],
        },
      ],
    },
    {
      id: "syntax2",
      label: "基础语法2",
      children: [
        { id: "var2", label: "变量与常量2" },
        { id: "flow2", label: "控制流2" },
      ],
    },
  ];

  // 调用抽离的方法加载初始数据
  loadTreeData(mockBackendData, 100, 250);

  // 居中显示内容
  setTimeout(() => {
    graph?.centerContent();
  }, 100);

  // 监听连线和删除事件
  graph.on("edge:connected", updateLeafStatus);
  graph.on("edge:removed", updateLeafStatus);
  graph.on("node:removed", updateLeafStatus);
  graph.on("node:added", updateLeafStatus);

  // 监听来自 Vue 组件节点的自定义事件：添加子节点
  graph.on(
    "node:add:child",
    ({ parentId }: { parentId: string }) => {
      const parent = graph?.getCellById(parentId) as Node;

      if (!parent) return;

      const { x, y } = getSafePosition(
        parent,
        { id: "temp-id" },
        parent.getBBox().y,
      );

      const newNode = graph?.addNode({
        shape: "mindmap-vue-node",
        x,
        y,
        data: {
          label: "",
          isLeaf: true,
          isNew: true,
          isEditing: true,
        },
      });

      if (newNode) {
        graph?.addEdge({
          ...edgeConfig,
          source: { cell: parent.id, port: "port-right" },
          target: { cell: newNode.id, port: "port-left" },
        });

        updateLeafStatus();
      }
    },
  );

  // 监听节点折叠/展开事件
  graph.on("node:toggle:collapse", ({ nodeId }: { nodeId: string }) => {
    const node = graph?.getCellById(nodeId) as Node;
    if (!node) return;

    const data = node.getData() || {};
    const collapsed = !data.collapsed;

    // 更新当前节点折叠状态
    node.setData({ ...data, collapsed }, { overwrite: true });

    // 递归隐藏/显示所有后代节点和边
    const toggleSubtree = (targetNode: Node, visible: boolean) => {
      const outEdges = graph?.getOutgoingEdges(targetNode) || [];
      outEdges.forEach((edge) => {
        const childNode = edge.getTargetCell() as Node;
        if (childNode) {
          // 设置边和子节点的可见性
          edge.setVisible(visible);
          childNode.setVisible(visible);

          // 如果子节点本身没被折叠，则继续递归处理其子树
          const childData = childNode.getData() || {};
          if (!childData.collapsed || !visible) {
            toggleSubtree(childNode, visible);
          }
        }
      });
    };

    toggleSubtree(node, !collapsed);
  });
};

export { graph, initGraph };
