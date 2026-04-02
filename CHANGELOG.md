# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-04-02

### Added
- 向量模型加载进度提示（首次加载显示进度条）
- 真实搜索分数（从后端返回向量相似度分数）
- WriteNote 续写功能（点击编辑自动加载已有内容）
- 导出路径提示（显示文件保存位置，提供打开文件/目录按钮）

### Changed
- 搜索结果使用后端返回的真实向量相似度分数

## [2.0.0] - 2026-03-26

### Added
- Electron 桌面应用框架
- IPC 通信层（主进程 ↔ 渲染进程）
- 前端 UI 界面（React + Vite）
  - 即时灵感面板
  - 写笔记面板
  - 知识库面板（语义搜索）
  - 导出备份面板
  - 设置面板
- 前端 API 层（封装 IPC 调用）
- 后端编译配置（tsconfig.backend.json, tsconfig.electron.json）
- LibSQL 数据库集成（笔记 CRUD）
- 向量搜索集成（语义搜索）
- AI 能力集成（摘要、标签生成）
- 版本标签 v2.0.0

### Changed
- 项目结构重组（electron/, src/renderer/, src/storage/, src/ai/）
- 构建流程优化（分离后端和前端编译）

## [1.2.4] - 2026-03-23

### Fixed
- 向量化搜索问题（分离 AI 增强与嵌入生成逻辑）
- 中文路径兼容性问题（使用 ~/.cache/yiliu/models）

### Added
- 单元测试（vitest）

## [1.2.3] - 2026-03-22

### Fixed
- 中文路径问题（@xenova/transformers 缓存路径）

## [1.2.2] - 2026-03-21

### Changed
- 本地嵌入从 @huggingface/transformers 切换到 @xenova/transformers

## [1.2.1] - 2026-03-20

### Fixed
- ClawHub 安全警告（动态 import 问题）

## [1.2.0] - 2026-03-20

### Added
- LibSQL 存储层（替代 sql.js）
- 语义搜索（向量相似度搜索）
- AI 增强（自动摘要、标签生成）
- 本地嵌入支持（@huggingface/transformers）
- 混合搜索（语义 70% + 关键词 30%）
- 统计命令 `/统计`
- 支持 OpenAI 和本地嵌入模型切换

### Changed
- 全面异步化改造
- 统一使用异步 API
- 优化搜索回退逻辑

### Fixed
- 搜索输入截断 bug
- 关键字"搜"的解析问题

## [1.0.0] - 2026-03-19

### Added
- 初始版本
- 基础笔记记录功能
- 关键词搜索
- 版本管理（自动保存 + 手动标记）
- Markdown 导出
- OpenClaw Skill 集成

---

## 版本规划

### [2.2.0] - 未来

- WebDAV 同步
- 数据迁移脚本
- 单元测试
- 网页抓取（readability）
- PDF 处理
- Yjs 实时同步
- Web 画布界面
