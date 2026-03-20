---
name: yiliu
description: "忆流 - 随时捕捉、自动整理、按需浮现的笔记知识库。支持文字记录、语义搜索、AI摘要、自动标签、版本管理"
version: 1.1.0
author: Terry
license: MIT
tags:
  - note
  - knowledge
  - memory
  - search
  - AI
  - 笔记
  - 知识库
  - 向量搜索
---

# 忆流 - AI 笔记知识库

随时捕捉、自动整理、按需浮现的笔记知识库。

## ✨ 新功能 (v1.1.0)

- **语义搜索**：基于向量相似度，理解意图找内容
- **AI 摘要**：自动生成笔记摘要
- **自动标签**：AI 自动提取标签
- **混合搜索**：语义 + 关键词融合

## 功能

| 功能 | 说明 | 命令 |
|------|------|------|
| 记录 | 快速记录文字，自动 AI 增强 | `/记` 或直接输入 |
| 语义搜索 | 理解意图，找相关内容 | `/搜 <关键词>` |
| 列表 | 查看最近笔记 | `/列表` |
| 编辑 | 修改已有笔记 | `/编辑 <id> <内容>` |
| 历史 | 查看版本历史 | `/历史 <id>` |
| 导出 | 导出 Markdown | `/导出` |
| 统计 | 查看笔记统计 | `/统计` |

## 快速开始

### 安装

```bash
cd skills/yiliu
npm install
npm run build
```

### 配置 AI（可选）

设置环境变量启用 AI 功能：

```bash
export OPENAI_API_KEY="your-api-key"
# 可选：自定义 API 地址
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

### 使用

```
# 记录笔记（AI 自动摘要 + 标签）
/记 今天学到了 CRDT 同步的原理，核心是 Last-Write-Wins

# 语义搜索（理解意图）
搜 分布式同步的方法

# 查看列表
/列表

# 查看统计
/统计

# 导出备份
/导出
```

## AI 功能说明

| 功能 | 模型 | 说明 |
|------|------|------|
| 向量嵌入 | text-embedding-3-small | 语义搜索基础 |
| 摘要生成 | gpt-4o-mini | 自动摘要 |
| 标签提取 | gpt-4o-mini | 自动标签 |

**未配置 API Key 时**：回退到基础关键词搜索，不影响核心功能使用。

## 数据存储

- **SQLite**：笔记内容、版本历史
- **向量索引**：语义搜索
- **路径**：`data/yiliu.db`、`data/vectors.json`

## 架构

```
yiliu-skill/
├── src/
│   ├── index.ts       # 入口
│   ├── commands/      # 命令处理
│   ├── storage/       # 存储（SQLite + 向量）
│   ├── ai/            # AI 能力
│   └── types/         # 类型定义
├── data/              # 数据目录
└── SKILL.md
```

## 版本历史

- **v1.1.0** (2026-03-20) - 新增语义搜索、AI 摘要、自动标签
- **v1.0.0** (2026-03-19) - MVP 版本

## 许可证

MIT License