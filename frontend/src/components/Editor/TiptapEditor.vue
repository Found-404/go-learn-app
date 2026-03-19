<template>
  <div
    v-if="editor"
    class="tiptap-editor-container"
    :class="{ 'is-readonly': !editable }"
  >
    <!-- Toolbar -->
    <div v-if="editable" class="editor-toolbar">
      <div class="toolbar-group">
        <button
          @click="toggleSourceView"
          :class="{ 'is-active': showSource }"
          title="切换源码模式"
        >
          <FileCode :size="18" />
        </button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().undo()"
          title="撤销"
        >
          <Undo2 :size="18" />
        </button>
        <button
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().redo()"
          title="重做"
        >
          <Redo2 :size="18" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          title="加粗"
        >
          <Bold :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          title="斜体"
        >
          <Italic :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          title="删除线"
        >
          <Strikethrough :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
          title="行内代码"
        >
          <Code :size="18" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
          title="一级标题"
        >
          <Heading1 :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
          title="二级标题"
        >
          <Heading2 :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
          title="三级标题"
        >
          <Heading3 :size="18" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          title="无序列表"
        >
          <List :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          title="有序列表"
        >
          <ListOrdered :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleTaskList().run()"
          :class="{ 'is-active': editor.isActive('taskList') }"
          title="任务列表"
        >
          <ListChecks :size="18" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          title="引用"
        >
          <Quote :size="18" />
        </button>
        <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          title="代码块"
        >
          <SquareCode :size="18" />
        </button>
        <button
          @click="setLink"
          :class="{ 'is-active': editor.isActive('link') }"
          title="插入链接"
        >
          <LinkIcon :size="18" />
        </button>
        <button @click="addImage" title="插入图片">
          <ImageIcon :size="18" />
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          @click="
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          "
          title="插入表格"
        >
          <TableIcon :size="18" />
        </button>
      </div>

      <div class="toolbar-spacer"></div>

      <div class="toolbar-group">
        <button @click="clearContent" title="清空内容">
          <Trash2 :size="18" />
        </button>
        <button @click="exportMarkdown" title="导出 Markdown">
          <Download :size="18" />
        </button>
        <button @click="triggerImport" title="导入 Markdown">
          <Upload :size="18" />
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept=".md,.txt"
            @change="importMarkdown"
          />
        </button>
      </div>
    </div>

    <!-- Bubble Menu (Selection-based) -->
    <bubble-menu
      v-if="editor && editable"
      :editor="editor"
      :tippy-options="{ duration: 100 }"
    >
      <div class="bubble-menu">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          <Bold :size="16" />
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          <Italic :size="16" />
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          <Strikethrough :size="16" />
        </button>
        <button
          @click="editor.chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
        >
          <Code :size="16" />
        </button>
        <button
          @click="setLink"
          :class="{ 'is-active': editor.isActive('link') }"
        >
          <LinkIcon :size="16" />
        </button>
      </div>
    </bubble-menu>

    <!-- Floating Menu (Line-based) -->
    <floating-menu
      v-if="editor && editable"
      :editor="editor"
      :tippy-options="{ duration: 100 }"
    >
      <div class="floating-menu">
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          H1
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        >
          H2
        </button>
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
        >
          <List :size="16" />
        </button>
        <button
          @click="editor.chain().focus().toggleTaskList().run()"
          :class="{ 'is-active': editor.isActive('taskList') }"
        >
          <ListChecks :size="16" />
        </button>
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
        >
          <Quote :size="16" />
        </button>
        <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
        >
          <SquareCode :size="16" />
        </button>
      </div>
    </floating-menu>

    <!-- Editor Main Area -->
    <div class="editor-main-area">
      <editor-content
        v-if="!showSource"
        :editor="editor"
        class="editor-content"
      />
      <textarea
        v-else
        class="source-editor"
        v-model="sourceContent"
        @input="onSourceInput"
        placeholder="在这里输入 Markdown..."
      ></textarea>
    </div>

    <!-- Footer / Status Bar -->
    <div class="editor-footer">
      <div class="footer-left">
        <span class="status-badge" :class="{ 'is-saving': isSaving }">
          {{ isSaving ? "保存中..." : "已保存" }}
        </span>
        <span class="word-count">{{ wordCount }} 字</span>
      </div>
      <div class="footer-right">
        <button class="mode-toggle" @click="toggleEditable">
          {{ editable ? "预览模式" : "编辑模式" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import { FloatingMenu } from "@tiptap/extension-floating-menu";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Markdown } from "tiptap-markdown";
import { debounce } from "lodash-es";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  SquareCode,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Upload,
  FileCode,
} from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: '输入 "/" 以调出浮动菜单...',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const editor = ref<Editor | null>(null);
const editable = ref(!props.readOnly);
const isSaving = ref(false);
const showSource = ref(false);
const sourceContent = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

// Word count
const wordCount = computed(() => {
  if (showSource.value) {
    return sourceContent.value.trim().split(/\s+/).filter(Boolean).length;
  }
  return editor.value?.storage.characterCount.words() || 0;
});

// Initialize Editor
onMounted(() => {
  sourceContent.value = props.modelValue;
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListItems: true,
        linkify: true,
        breaks: true,
        serializers: {
          image(state, node) {
            const src = node.attrs.src || "";
            state.write(
              "![" +
                state.esc(node.attrs.alt || "") +
                "](" +
                state.esc(src).replace(/[\(\)]/g, "\\$&") +
                (node.attrs.title ? " " + state.quote(node.attrs.title) : "") +
                ")",
            );
          },
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      BubbleMenu.configure({
        element: document.querySelector(".bubble-menu"), // Although TipTap Vue components usually handle this, the extension itself is needed
      }),
      FloatingMenu.configure({
        element: document.querySelector(".floating-menu"),
      }),
    ],
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      sourceContent.value = markdown;
      emit("update:modelValue", markdown);
      debouncedSave(markdown);
    },
    editable: editable.value,
  });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    sourceContent.value = newValue;
    if (editor.value) {
      const currentMarkdown = editor.value.storage.markdown.getMarkdown();
      if (newValue !== currentMarkdown) {
        editor.value.commands.setContent(newValue, false);
      }
    }
  },
);

watch(
  () => props.readOnly,
  (newValue) => {
    editable.value = !newValue;
    editor.value?.setEditable(editable.value);
  },
);

// Logic
const toggleSourceView = () => {
  showSource.value = !showSource.value;
  if (!showSource.value && editor.value) {
    editor.value.commands.setContent(sourceContent.value);
  }
};

const onSourceInput = () => {
  emit("update:modelValue", sourceContent.value);
  debouncedSave(sourceContent.value);
};

const debouncedSave = debounce((content: string) => {
  isSaving.value = true;
  emit("save", content);
  setTimeout(() => {
    isSaving.value = false;
  }, 500);
}, 3000);

// Actions
const setLink = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);
  if (url === null) return;
  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.value
    ?.chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

const addImage = () => {
  const url = window.prompt("图片 URL");
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run();
  }
};

const clearContent = () => {
  if (confirm("确定要清空所有内容吗？")) {
    editor.value?.chain().focus().clearContent().run();
  }
};

const toggleEditable = () => {
  editable.value = !editable.value;
  editor.value?.setEditable(editable.value);
};

const exportMarkdown = () => {
  if (!editor.value) return;
  const markdown = editor.value.storage.markdown.getMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `document-${new Date().getTime()}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

const triggerImport = () => {
  fileInput.value?.click();
};

const importMarkdown = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    editor.value?.commands.setContent(content);
  };
  reader.readAsText(file);
  target.value = "";
};
</script>

<style lang="css">
/* Container */
.tiptap-editor-container {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

/* Toolbar */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  gap: 4px;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 6px;
}

.toolbar-spacer {
  flex-grow: 1;
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #475569;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.editor-toolbar button:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.editor-toolbar button.is-active {
  background: #cbd5e1;
  color: #0f172a;
}

.editor-toolbar button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Menus (Bubble & Floating) */
.bubble-menu,
.floating-menu {
  display: flex;
  background-color: #0f172a;
  padding: 4px;
  border-radius: 8px;
  gap: 2px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.bubble-menu button,
.floating-menu button {
  background: transparent;
  border: none;
  color: #f8fafc;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
}

.bubble-menu button:hover,
.floating-menu button:hover {
  background-color: #1e293b;
}

.bubble-menu button.is-active,
.floating-menu button.is-active {
  background-color: #3b82f6;
  color: white;
}

/* Main Area */
.editor-main-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.editor-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 40px 60px; /* Spacious Notion-like padding */
}

.source-editor {
  flex-grow: 1;
  padding: 40px 60px;
  border: none;
  resize: none;
  outline: none;
  font-family: "Fira Code", monospace;
  font-size: 15px;
  line-height: 1.7;
  color: #334155;
  background-color: #f8fafc;
}

/* ProseMirror Styles */
.ProseMirror {
  outline: none;
  min-height: 500px;
  line-height: 1.7;
  font-size: 16px;
  color: #1e293b;
}

/* Notion-like Placeholder */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
}

/* Typography */
.ProseMirror h1 {
  font-size: 2.5em;
  font-weight: 800;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.ProseMirror h2 {
  font-size: 1.8em;
  font-weight: 700;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
}
.ProseMirror h3 {
  font-size: 1.4em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5em;
  margin-bottom: 1.2em;
}

.ProseMirror blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1.2em;
  color: #475569;
  font-style: italic;
  margin: 1.5em 0;
  background: #f1f5f9;
  padding: 10px 20px;
  border-radius: 0 8px 8px 0;
}

.ProseMirror code {
  background: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-family: "Fira Code", monospace;
  font-size: 0.9em;
  color: #e11d48;
}

.ProseMirror pre {
  background: #1e293b;
  color: #f8fafc;
  padding: 1.5em;
  border-radius: 10px;
  margin: 1.5em 0;
  overflow-x: auto;
}

.ProseMirror pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.9em;
}

/* Tables */
.ProseMirror table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
}

.ProseMirror table th,
.ProseMirror table td {
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  text-align: left;
}

.ProseMirror table th {
  background: #f8fafc;
  font-weight: 600;
}

/* Task List */
ul[data-type="taskList"] {
  list-style: none;
  padding: 0;
}

ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 0.5em;
}

ul[data-type="taskList"] li > label {
  flex: 0 0 auto;
  user-select: none;
}

ul[data-type="taskList"] li > div {
  flex: 1 1 auto;
}

ul[data-type="taskList"] input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-top: 4px;
}

.is-readonly ul[data-type="taskList"] input[type="checkbox"] {
  pointer-events: none;
}

/* Footer */
.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 13px;
  color: #64748b;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  background: #dcfce7;
  color: #166534;
  font-weight: 600;
  transition: all 0.3s;
}

.status-badge.is-saving {
  background: #fef9c3;
  color: #854d0e;
}

.mode-toggle {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.mode-toggle:hover {
  background: #2563eb;
}

/* Images */
.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1.5em 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Selection */
.ProseMirror ::selection {
  background: rgba(59, 130, 246, 0.2);
}

/* Mobile */
@media (max-width: 640px) {
  .editor-content,
  .source-editor {
    padding: 20px;
  }
}
</style>
