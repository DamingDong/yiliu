# PRD: 忆流 V2.2 笔记本系统

> 产品需求文档 - 智能笔记本功能

---

## 一、概述

| 维度 | 内容 |
|------|------|
| **版本** | V2.2 |
| **功能名称** | 智能笔记本系统 |
| **负责人** | 产品团队 |
| **预计时间** | 2026 Q3 |
| **状态** | 规划中 |

---

## 二、背景与机会

### 2.1 用户反馈

用户提问：「对于人类可视化编辑来说，增加笔记本更好，还是保持现状更好？」

### 2.2 竞品对比

| 产品 | 组织方式 | 用户满意度 |
|------|----------|-----------|
| Flomo | 标签流 | 轻量但缺乏结构 |
| Obsidian | 文件夹 + 双链 | 强大但学习成本高 |
| Notion | 工作区 + 页面嵌套 | 灵活但过于复杂 |
| **忆流（现状）** | 标签 + 语义搜索 | AI 强但可视化弱 |

### 2.3 机会分析

| 指标 | 重要性 | 当前满意度 | 机会分数 |
|------|--------|-----------|----------|
| 笔记本分类 | 7 | 3 | 28 (高) |
| 时间线视图 | 6 | 2 | 24 (高) |
| 标签管理 | 8 | 6 | 16 (已有) |
| 语义搜索 | 10 | 8 | 20 (已有) |

**结论：笔记本是高机会分数的改进点**

---

## 三、产品定位

### 3.1 设计原则

```
┌─────────────────────────────────────────────────────────────┐
│                 忆流笔记本设计原则                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 笔记本 = 「智能视图」而非「物理容器」                      │
│     • 一条笔记可属于多个笔记本                               │
│     • 笔记本本质是「筛选条件 + 展示方式」                     │
│                                                             │
│  2. AI 自动 + 用户手动                                      │
│     • AI 推荐笔记本归属                                      │
│     • 用户可手动调整                                        │
│                                                             │
│  3. 不破坏「随时捕获」体验                                   │
│     • 记录时无需选择笔记本                                   │
│     • 事后自动归类                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 与竞品差异化

| 维度 | Obsidian | Flomo | 忆流 V2.2 |
|------|----------|-------|----------|
| 组织方式 | 文件夹层级 | 标签流 | 智能笔记本 |
| 选择时机 | 创建时选择 | 记录后打标签 | AI 自动归类 |
| 学习成本 | 高 | 低 | 低 |
| AI 参与 | 无 | 无 | 原生支持 |

---

## 四、用户故事

### US-1: 创建笔记本

```
作为 用户
我想要 创建主题笔记本
以便于 按主题组织我的笔记
```

**验收标准**：
- [ ] 侧边栏显示笔记本列表
- [ ] 可新建、重命名、删除笔记本
- [ ] 笔记本支持图标和颜色自定义
- [ ] 支持拖拽排序

### US-2: 笔记归属笔记本

```
作为 用户
我想要 将笔记归属到笔记本
以便于 后续按主题浏览
```

**验收标准**：
- [ ] 笔记详情页显示所属笔记本
- [ ] 可手动添加/移除笔记本归属
- [ ] AI 自动推荐合适笔记本
- [ ] 一条笔记可属于多个笔记本

### US-3: 按笔记本浏览

```
作为 用户
我想要 点击笔记本查看相关笔记
以便于 按主题浏览我的知识
```

**验收标准**：
- [ ] 点击笔记本显示该笔记本下的笔记列表
- [ ] 支持笔记本内搜索
- [ ] 显示笔记本统计信息（笔记数量、最近更新）
- [ ] 支持笔记本内排序

### US-4: AI 自动归类

```
作为 用户
我想要 AI 自动将笔记归类到笔记本
以便于 减少手动整理负担
```

**验收标准**：
- [ ] 保存笔记时 AI 自动推荐笔记本
- [ ] 用户可选择接受或拒绝
- [ ] 推荐准确率 > 70%
- [ ] 支持设置「自动接受」模式

---

## 五、功能规格

### 5.1 数据模型

```typescript
// 笔记本
interface Notebook {
  id: string;
  name: string;
  icon?: string;        // emoji 或图标
  color?: string;       // 主题色
  description?: string;
  createdAt: number;
  updatedAt: number;
  noteCount: number;    // 冗余字段，用于展示
}

// 笔记-笔记本关联（多对多）
interface NoteNotebook {
  noteId: string;
  notebookId: string;
  isPrimary: boolean;   // 是否主要归属
  addedAt: number;
  source: 'ai' | 'manual';  // 归类来源
}
```

### 5.2 侧边栏结构

```
┌─────────────────────────────┐
│  📝 忆流                     │
├─────────────────────────────┤
│  💡 即时灵感                 │
│  ✏️ 写笔记                   │
│  📚 知识库                   │
│  ⚙️ 设置                    │
├─────────────────────────────┤
│  📁 笔记本              [+新]│
│    📂 工作项目        (23)   │
│    📂 学习笔记        (15)   │
│    📂 个人想法        (8)    │
│    📂 会议记录        (12)   │
│    📂 读书笔记        (6)    │
├─────────────────────────────┤
│  🏷️ 标签                     │
│    #技术 (10) #工作 (8)      │
│    #学习 (6) #想法 (5)       │
└─────────────────────────────┘
```

### 5.3 笔记详情页改动

```
┌─────────────────────────────────────────────────────────────┐
│  📝 会议记录：项目进展讨论                          [编辑]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📁 所属笔记本：                                            │
│     [工作项目] [会议记录] + 添加                            │
│                                                             │
│  🏷️ 标签：                                                  │
│     #会议 #项目 #进展                                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  今天参加了项目周会，讨论了以下内容...                       │
│                                                             │
│  🤖 AI 推荐：添加到 [工作项目] 笔记本                        │
│                                              [接受] [忽略]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 AI 归类逻辑

```typescript
// AI 推荐笔记本算法
async function recommendNotebooks(note: Note): Promise<NotebookMatch[]> {
  // 1. 获取所有笔记本
  const notebooks = await getAllNotebooks();
  
  // 2. 为每个笔记本生成摘要（笔记本名称 + 描述 + 前5条笔记摘要）
  const notebookSummaries = await Promise.all(
    notebooks.map(async (nb) => ({
      notebook: nb,
      summary: await generateNotebookSummary(nb)
    }))
  );
  
  // 3. 计算笔记内容与笔记本的相似度
  const matches = await Promise.all(
    notebookSummaries.map(async ({ notebook, summary }) => {
      const similarity = await computeSimilarity(note.content, summary);
      return { notebook, score: similarity };
    })
  );
  
  // 4. 返回得分 > 0.6 的推荐
  return matches
    .filter(m => m.score > 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
```

---

## 六、技术方案

### 6.1 数据库变更

```sql
-- 笔记本表
CREATE TABLE notebooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 笔记-笔记本关联表
CREATE TABLE note_notebooks (
  note_id TEXT NOT NULL,
  notebook_id TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  added_at INTEGER NOT NULL,
  PRIMARY KEY (note_id, notebook_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_note_notebooks_notebook ON note_notebooks(notebook_id);
CREATE INDEX idx_note_notebooks_note ON note_notebooks(note_id);
```

### 6.2 IPC 接口

```typescript
// 主进程 IPC 处理
ipcMain.handle('notebook:create', async (_, data: CreateNotebookData) => {
  return await notebookService.create(data);
});

ipcMain.handle('notebook:list', async () => {
  return await notebookService.list();
});

ipcMain.handle('notebook:update', async (_, id: string, data: UpdateNotebookData) => {
  return await notebookService.update(id, data);
});

ipcMain.handle('notebook:delete', async (_, id: string) => {
  return await notebookService.delete(id);
});

ipcMain.handle('notebook:addNote', async (_, noteId: string, notebookId: string, source: 'ai' | 'manual') => {
  return await notebookService.addNoteToNotebook(noteId, notebookId, source);
});

ipcMain.handle('notebook:removeNote', async (_, noteId: string, notebookId: string) => {
  return await notebookService.removeNoteFromNotebook(noteId, notebookId);
});

ipcMain.handle('notebook:getNotes', async (_, notebookId: string, options?: QueryOptions) => {
  return await notebookService.getNotesInNotebook(notebookId, options);
});

ipcMain.handle('notebook:recommend', async (_, noteId: string) => {
  return await notebookService.recommendNotebooksForNote(noteId);
});
```

### 6.3 组件清单

| 组件 | 文件 | 功能 |
|------|------|------|
| NotebookList | `NotebookList.tsx` | 侧边栏笔记本列表 |
| NotebookItem | `NotebookItem.tsx` | 单个笔记本项 |
| NotebookCreateDialog | `NotebookCreateDialog.tsx` | 新建笔记本弹窗 |
| NotebookView | `NotebookView.tsx` | 笔记本内容视图 |
| NotebookBadge | `NotebookBadge.tsx` | 笔记详情页笔记本标签 |
| NotebookRecommendation | `NotebookRecommendation.tsx` | AI 推荐卡片 |

---

## 七、UI 交互设计

### 7.1 创建笔记本流程

```
┌─────────────────────────────────────┐
│  📁 新建笔记本                      │
├─────────────────────────────────────┤
│                                     │
│  名称：[              ]             │
│                                     │
│  图标：[📂] [📁] [📚] [💡] [📝]    │
│                                     │
│  颜色：[#3B82F6] [#10B981] [...]   │
│                                     │
│  描述：[                        ]  │
│                                     │
│         [取消]  [创建]             │
│                                     │
└─────────────────────────────────────┘
```

### 7.2 笔记本视图

```
┌─────────────────────────────────────────────────────────────┐
│  📂 工作项目                                     23 条笔记  │
├─────────────────────────────────────────────────────────────┤
│  [全部] [本周] [本月]           🔍 搜索笔记本内容...       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 项目进展：本周完成了核心功能开发...                     │
│     📅 今天 10:30                                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📝 需求讨论：和客户确认了新功能需求...                     │
│     📅 昨天 14:20                                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📝 技术方案：确定了数据库设计方案...                       │
│     📅 3天前                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+N` | 新建笔记本 |
| `Cmd+Shift+N` | 将当前笔记添加到笔记本 |
| `Cmd+1~9` | 切换到第 N 个笔记本 |

---

## 八、成功指标

### 8.1 核心指标

| 指标 | 定义 | 目标 |
|------|------|------|
| 笔记本使用率 | 创建过笔记本的用户比例 | > 60% |
| 笔记覆盖率 | 至少属于一个笔记本的笔记比例 | > 50% |
| AI 归类接受率 | 用户接受 AI 推荐的比例 | > 70% |
| 笔记本浏览占比 | 通过笔记本浏览笔记的比例 | > 30% |

### 8.2 监控埋点

```typescript
// 事件定义
const events = {
  notebook_created: 'notebook.created',
  notebook_deleted: 'notebook.deleted',
  notebook_viewed: 'notebook.viewed',
  note_added_to_notebook: 'note.added_to_notebook',
  note_removed_from_notebook: 'note.removed_from_notebook',
  ai_recommendation_shown: 'ai.notebook_recommendation.shown',
  ai_recommendation_accepted: 'ai.notebook_recommendation.accepted',
  ai_recommendation_rejected: 'ai.notebook_recommendation.rejected',
};
```

---

## 九、风险与应对

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| AI 归类准确率低 | 用户不接受推荐 | 中 | 提供手动修正 + 反馈学习 |
| 用户不会用笔记本 | 功能使用率低 | 中 | 引导教程 + 默认笔记本 |
| 性能问题 | 笔记本加载慢 | 低 | 分页加载 + 缓存优化 |

---

## 十、里程碑

| 里程碑 | 内容 | 时间 |
|--------|------|------|
| M1 | 数据库设计 + IPC 接口 | Week 1 |
| M2 | 侧边栏笔记本列表 | Week 2 |
| M3 | 笔记本视图 + 笔记关联 | Week 3 |
| M4 | AI 自动归类 | Week 4 |
| M5 | 测试 + 优化 | Week 5 |

---

## 十一、附录

### A. 参考文档
- 竞品分析：忆流 vs Flomo vs Obsidian
- 用户反馈：笔记本需求讨论

### B. 相关 PR
- V2.1.1: 标签管理系统

---

*最后更新: 2026-04-06*
