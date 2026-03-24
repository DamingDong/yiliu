# 版本历史

> 忆流各版本变更记录

---

## 版本概览

| 版本 | 发布日期 | 状态 |
|------|----------|------|
| **2.0.0** | 开发中 | 🚧 开发中 |
| **1.2.x** | 2026-03 | ✅ 已完成 |

---

## V2.0.0 (开发中)

**主题**: 桌面端 + 语义搜索

**目标日期**: 2026-04

### 变更内容

#### 新增

- Electron 桌面端应用
- React + TypeScript 前端
- Tailwind CSS + shadcn/ui UI 组件库
- LibSQL 本地数据库
- 语义搜索功能
- 系统托盘集成
- 全局快捷键
- 笔记版本历史
- Markdown 导出
- 统计信息

#### 技术变更

| 模块 | 旧版本 | 新版本 |
|------|--------|--------|
| 框架 | OpenClaw Skill | Electron |
| 前端 | 命令行 | React |
| 数据库 | sql.js | LibSQL |
| 向量 | 内存索引 | @xenova/transformers |
| 构建 | npm | Vite + electron-builder |

#### 废弃

- 命令式交互 (斜杠命令)
- sql.js 数据库

---

## V1.2.4 (2026-03-23)

### 修复

- 向量化搜索问题（分离 AI 增强与嵌入生成逻辑）
- 中文路径兼容性问题（使用 ~/.cache/yiliu/models）

### 新增

- 单元测试（vitest）

---

## V1.2.3 (2026-03-22)

### 修复

- 中文路径问题（@xenova/transformers 缓存路径）

---

## V1.2.2 (2026-03-21)

### 变更

- 本地嵌入从 @huggingface/transformers 切换到 @xenova/transformers

---

## V1.2.1 (2026-03-20)

### 修复

- ClawHub 安全警告（动态 import 问题）

---

## V1.2.0 (2026-03-20)

### 新增

- LibSQL 存储层（替代 sql.js）
- 语义搜索（向量相似度搜索）
- AI 增强（自动摘要、标签生成）
- 本地嵌入支持（@huggingface/transformers）
- 混合搜索（语义 70% + 关键词 30%）
- 统计命令 `/统计`
- 支持 OpenAI 和本地嵌入模型切换

### 变更

- 全面异步化改造
- 统一使用异步 API
- 优化搜索回退逻辑

### 修复

- 搜索输入截断 bug
- 关键字"搜"的解析问题

---

## V1.0.0 (2026-03-19)

### 新增

- 初始版本
- 基础笔记记录功能
- 关键词搜索
- 版本管理（自动保存 + 手动标记）
- Markdown 导出
- OpenClaw Skill 集成

---

## 发布规范

### 版本号格式

```
主版本.次版本.修订版本

示例: 2.0.0
```

| 部分 | 说明 | 变更规则 |
|------|------|----------|
| 主版本 | 重大架构变更 | 不兼容的 API 变更 |
| 次版本 | 新功能 | 向后兼容的功能添加 |
| 修订版本 | Bug 修复 | 向后兼容的问题修复 |

### 发布流程

1. 更新 CHANGELOG.md
2. 更新版本号 (package.json)
3. 创建 Git Tag
4. 构建发布包
5. 发布到 GitHub Releases
6. (如有) 发布到 ClawHub

### Git Tag 格式

```
v<版本号>

示例: v2.0.0
```

---

## 迁移指南

### V1.x → V2.0

V2.0 是全新架构，需要重新安装。

```bash
# 1. 备份数据
./yiliu "导出"

# 2. 克隆新版本
git clone https://github.com/DamingDong/yiliu.git
cd yiliu

# 3. 安装依赖
pnpm install

# 4. 启动应用
pnpm dev
```

数据文件格式兼容，无需手动迁移。

---

## 反馈渠道

- **问题反馈**: https://github.com/DamingDong/yiliu/issues
- **功能建议**: https://github.com/DamingDong/yiliu/discussions
- **邮箱**: dmdong@gmail.com

---

*最后更新: 2026-03-23*