# PCHelper v1.1 — Post-v1.0 功能拓展实施计划

> **执行方式：** Claude Code print 模式 + Hermes 编译修复

**目标：** 在 Phase 12 基础上新增 6 大功能方向（P0→P1→P2），保持零 TypeScript 错误

**架构原则：**
- 每个方向是独立阶段，串行执行
- Electron 后端模块 + IPC + Zustand store + React 组件 — 完整链路
- 完成后 `npx tsc --noEmit` 零错误 + git commit + git push

---

## Phase A: AI 深度集成（P0）

**目标：** 将 AI 从"被动聊天"升级为"主动诊断+实时分析"

### A1: AI 一键系统体检

**Objective:** 新增"AI 体检"功能 — 扫描系统后 AI 生成综合诊断报告

**Files:**
- Create: `electron/ai/diagnostic.ts` — 体检引擎（收集硬件+软件+系统数据 → 构造 prompt → 调 DeepSeek）
- Create: `electron/ai/types.ts` — AI 模块共享类型
- Modify: `electron/main.ts` — 注册 IPC `pchelper:ai-diagnostic`
- Modify: `electron/preload.ts` — 暴露体检通道
- Create: `src/stores/aiDiagnosticStore.ts` — Zustand store
- Create: `src/components/AIDiagnosticView/index.tsx` — 体检结果页面
- Create: `src/components/AIDiagnosticView/AIDiagnostic.css` — 样式
- Modify: `src/components/Sidebar/index.tsx` — 添加"AI 体检"导航项
- Modify: `src/App.tsx` — 注册路由
- Modify: `src/utils/types.ts` — 添加 `aiDiagnostic` 到 NavPage

**Details:**
- 体检引擎收集：硬件摘要（CPU/GPU/RAM/磁盘型号+温度+使用率）、软件更新状态、冲突报告、健康评分、系统文件完整性
- 构造 prompt：`"你是一位专业的PC诊断专家。基于以下系统数据，给出全面的系统健康评估、发现的问题、优化建议。请用中文回复。"`
- API 复用已有的 `electron/repair/ai.ts` 调用逻辑
- 结果渲染：分区块（问题列表、评分、建议；绿色/黄色/红色严重度标签）

### A2: AI 实时问答浮窗

**Objective:** Overlay 模式下直接询问系统状态，不打开主窗口

**Files:**
- Create: `electron/overlay/aiQuery.ts` — 浮窗 AI 查询 IPC 处理
- Modify: `electron/overlay/overlayManager.ts` — 添加 AI 查询接口
- Modify: `electron/overlay/overlay.html` — 添加 AI 输入框+结果显示区
- Create: `electron/overlay/overlay-ai.js` — 浮窗内 AI 交互逻辑（内嵌 JS）
- Modify: `electron/preload.ts` — 添加浮窗 AI 通道
- Modify: `electron/main.ts` — 注册浮窗 AI IPC

**Details:**
- 浮窗按特定按键（如 Ctrl+Shift+A）打开 AI 输入框
- 输入问题 → IPC 发给主进程 → 主进程收集当前系统快照 → 调 DeepSeek → 返回浮窗显示
- 问题示例："我这电脑能跑黑神话悟空吗？"、"为什么CPU温度这么高？"
- 浮窗内显示简洁结果（几行文字），不打断游戏

### A3: AI 行为分析引擎

**Objective:** 发现异常进程/行为时 AI 自动分析并给出建议

**Files:**
- Create: `electron/ai/behaviorAnalyzer.ts` — 行为分析引擎
- Modify: `electron/main.ts` — 注册 IPC `pchelper:ai-analyze-process`
- Modify: `electron/preload.ts` — 暴露分析通道
- Create: `src/stores/aiBehaviorStore.ts` — 行为分析 store
- Create: `src/components/AIBehaviorView/index.tsx` — 行为分析页面
- Modify: `src/components/Sidebar/index.tsx` — 添加导航项
- Modify: `src/App.tsx` — 注册路由

**Details:**
- 用户选择某个进程 → 右键"AI 分析" → 收集该进程的 CPU/内存/网络/句柄信息 → 调 DeepSeek → 返回分析
- 分析内容包括：该进程是否异常、占用是否合理、建议操作
- 结果示例："svchost.exe CPU持续30%+，可能是Windows更新卡住，建议重启wuauserv服务"

---

## Phase B: 游戏场景增强（P0）

**目标：** 将 Overlay 从"数据展示"升级为"游戏优化助手"

### B1: 游戏一键优化模式

**Objective:** 检测当前运行的(全屏)游戏 → 自动暂停非必要进程+服务 → 恢复

**Files:**
- Create: `electron/game/gameOptimizer.ts` — 游戏优化引擎
- Create: `electron/game/gameDetector.ts` — 检测当前运行的（全屏）游戏
- Create: `electron/game/gameProfile.ts` — 游戏配置管理
- Create: `electron/game/types.ts` — 游戏模块类型
- Modify: `electron/main.ts` — 注册 IPC 通道
- Modify: `electron/preload.ts` — 暴露游戏优化通道
- Create: `src/stores/gameOptimizerStore.ts` — store
- Create: `src/components/GameOptimizerView/index.tsx` — 界面
- Create: `src/components/GameOptimizerView/GameOptimizer.css` — 样式
- Modify: `src/components/Sidebar/index.tsx` — 添加导航
- Modify: `src/App.tsx` — 注册路由
- Modify: `src/utils/types.ts` — 添加 NavPage

**Details:**
- gameDetector 检测：通过进程枚举找到全屏 DirectX/OpenGL/Vulkan 窗口
- gameOptimizer 操作：暂停非必要的 Windows 服务列表、结束非关键的后台进程、设置电源计划为高性能、清理内存 Standby List
- 优化列表可配置（Settings 里）
- 游戏退出后自动恢复所有被暂停的服务/进程

### B2: 游戏帧率历史

**Objective:** 记录历史 FPS/温度/CPU/GPU 数据，提供曲线分析

**Files:**
- Create: `electron/game/fpsHistory.ts` — 帧率历史记录器
- Modify: `electron/game/gameOptimizer.ts` — 集成录制
- Create: `src/components/GameOptimizerView/FPSHistoryChart.tsx` — FPS 曲线图
- Modify: `src/components/GameOptimizerView/index.tsx` — 添加历史标签

**Details:**
- 每次游戏运行时自动记录 FPS/温度/使用率到 SQLite
- 历史页面显示曲线图（Recharts 已有依赖）
- 列表展示过往游戏会话：日期、游戏名称、平均FPS、最高FPS、最低FPS、平均温度

### B3: 游戏配置库

**Objective:** 每个游戏可存档 Overlay 显示偏好

**Files:**
- Create: `electron/game/gameConfig.ts` — 游戏配置持久化
- Modify: `electron/overlay/overlayManager.ts` — 按游戏加载配置
- Modify: `src/components/PerfOverlay/index.tsx` — 配置管理 UI

**Details:**
- 每个游戏存储：显示哪些指标（FPS/CPU/GPU/RAM）、位置、透明度、颜色
- 游戏运行时自动加载对应配置
- 默认配置 + 手动创建配置

---

## Phase C: 桌面监控中心（P1）

### C1: 桌面小组件

**Objective:** 不打开主窗口，桌面上显示半透明硬件小卡片

**Files:**
- Create: `electron/widget/widgetManager.ts` — 小组件窗口管理
- Create: `electron/widget/widget.html` — 小组件 HTML
- Create: `electron/widget/widget.js` — 小组件渲染逻辑（内嵌 JS，数据轮询）
- Create: `electron/widget/widget.css` — 小组件样式
- Modify: `electron/main.ts` — 注册小组件启动/关闭
- Create: `src/components/WidgetSettingsView/index.tsx` — 小组件设置面板
- Create: `src/stores/widgetStore.ts` — store
- Modify: `src/components/Sidebar/index.tsx` — 添加导航
- Modify: `src/App.tsx` — 注册路由

**Details:**
- 独立 BrowserWindow，置顶，半透明，可拖拽
- 显示 CPU 使用率/温度、内存占用、GPU 使用率、磁盘占用的迷你条/圆环
- 点击打开主窗口对应页面
- 设置页选择显示哪些指标、透明度、大小

### C2: 系统托盘增强

**Objective:** 托盘右键菜单直接看关键指标+快捷操作

**Files:**
- Modify: `electron/main.ts` — 增强 Tray 功能（添加图标、右键菜单更新）
- Create: `electron/tray/trayManager.ts` — 托盘管理器
- Create: `electron/tray/trayIcons.ts` — 图标生成

**Details:**
- 托盘图标动态显示 CPU/RAM 占用（有数字更好，或颜色变化）
- 右键菜单：Dashboard | 硬件检测 | 一键体检 | 游戏优化 | 丨 退出
- 定时更新图标文字/颜色反映系统负载

### C3: 系统通知系统

**Objective:** 硬件异常时弹系统通知

**Files:**
- Create: `electron/alerter/notificationSender.ts` — 系统通知发送器
- Modify: `electron/alerter/engine.ts` — 集成通知发送
- Create: `src/components/NotificationSettings/index.tsx` — 通知设置面板
- Modify: `src/components/SettingsView/index.tsx` — 集成通知设置

**Details:**
- 规则：CPU>85°C / 内存>90% / GPU>90°C / 磁盘<5% 空间
- 发送 Electron Notification（Windows Action Center）
- 可配置：启用/禁用、阈值调整

---

## Phase D: 网络工具聚合（P2）

### D1: 局域网设备发现

**Objective:** 扫描同网络设备

**Files:**
- Create: `electron/netdiag/lanScanner.ts` — LAN 扫描器
- Modify: `electron/netdiag/toolkit.ts` — 集成
- Modify: `electron/main.ts` + `electron/preload.ts` — IPC
- Create: `src/components/LanScannerView/index.tsx` — UI
- Modify: `src/components/Sidebar/index.tsx` — 添加导航
- Modify: `src/App.tsx` — 路由
- Modify: `src/utils/types.ts` — NavPage

### D2: 网速测速+流量排行榜

**Objective:** 集成简单测速、显示流量消耗排行

**Files:**
- Create: `electron/netdiag/speedtest.ts` — 测速（探测下载/上传延迟）
- Modify: `electron/netdiag/toolkit.ts` — 集成
- Create: `src/components/NetStatsView/index.tsx` — 流量排行UI
- Modify: `src/components/Sidebar/index.tsx` — 导航
- Modify: `src/App.tsx` — 路由

---

## Phase E: 隐私清理增强（P1）

### E1: 浏览器痕迹清理

**Objective:** 一键清 Edge/Chrome 缓存、历史、Cookie

**Files:**
- Create: `electron/cleanup/browserCleaner.ts` — 浏览器清理器
- Modify: `electron/cleanup/optimizer.ts` — 集成
- Modify: `electron/main.ts` + `electron/preload.ts` — IPC
- Modify: `src/components/CleanupView/index.tsx` — 添加浏览器清理选项
- Modify: `src/stores/cleanupStore.ts` — 更新 store

### E2: 隐私报告

**Objective:** 显示最近访问文档/文件/目录列表

**Files:**
- Create: `electron/cleanup/privacyReporter.ts` — 隐私报告器
- Modify: `electron/cleanup/optimizer.ts` — 集成
- Create: `src/components/PrivacyView/index.tsx` — 隐私报告UI
- Modify: `src/components/Sidebar/index.tsx` — 导航
- Modify: `src/App.tsx` — 路由

---

## Phase F: 文件工具集（P2）

### F1: 大文件扫描器

**Files:**
- Create: `electron/files/largeFileScanner.ts`
- Modify: `electron/main.ts` + `electron/preload.ts`
- Create: `src/stores/largeFileStore.ts`
- Create: `src/components/LargeFileView/index.tsx`
- Modify: `src/components/Sidebar/index.tsx`
- Modify: `src/App.tsx`

### F2: 重复文件查找

**Files:**
- Create: `electron/files/duplicateFinder.ts`
- Create: `src/components/DuplicateFileView/index.tsx`
- Modify: `src/stores/duplicateStore.ts`
- 其余同上

### F3: 文件锁查看

**Files:**
- Create: `electron/files/fileLocker.ts` — 查看指定文件被哪些进程占用（Windows: handle.exe / Linux: lsof）
- Create: `src/components/FileLockerView/index.tsx`
