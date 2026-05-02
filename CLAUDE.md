# PCHelper (电脑工具箱) v1.0-beta — 项目档案

## 🏗️ 项目概览

| 字段 | 值 |
|------|-----|
| **名称** | PCHelper (pchelper) |
| **版本** | v1.0-beta |
| **类型** | Electron + React (Vite) 桌面应用 |
| **目标平台** | Windows (NSIS Installer + Portable) |
| **源文件** | ~215 个 | **总代码** | ~48,000 行 |
| **仓库** | `pc-toolkit/` 子目录 @ Hermes-Agent-project |
| **GitHub** | `git@github.com:zymaicode/Hermes-Agent-project.git`(SSH) |
| **分支** | main → 实际在 `pc-toolkit/main` |
| **最新提交** | `002490d` — Phase 12: real data integration + build fixes |

---

## 🏛️ 完整架构

### 技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| 框架 | Electron + Vite | 桌面应用壳 + 构建 |
| 前端 | React 18 + TypeScript | UI 组件 |
| 状态 | Zustand | 轻量级状态管理 |
| 图表 | Recharts | 数据可视化 |
| 图标 | lucide-react | UI 图标 |
| 数据库 | better-sqlite3 + SQLite | 本地持久化 |
| 构建 | electron-builder (NSIS) | 打包为安装包 |
| 图标生成 | sharp (Node.js) | 多尺寸 PNG/ICO 生成 |
| AI | DeepSeek V4 Pro API (OpenAI 兼容) | AI 诊断/聊天 |
| 样式 | 纯 CSS + CSS 变量 | 暗色主题 AIDA64 风格 |

### 目录结构（完整）

```
pc-toolkit/
├── package.json / tsconfig.json / vite.config.ts
├── index.html
├── CLAUDE.md                     ← 本文档
├── README.md / REQUIREMENTS.md / RELEASE_NOTES.md
│
├── electron/                     # 🖥️ 后端主进程 (77 文件, ~10,600 行)
│   ├── main.ts                   #   入口：窗口管理、IPC 注册
│   ├── preload.ts                #   contextBridge IPC 通道暴露
│   │
│   ├── hardware/                 # 📊 硬件层
│   │   ├── collector.ts          #   综合采集 (CPU/GPU/内存/磁盘) 367行
│   │   ├── cpu.ts / gpu.ts / disk.ts / memory.ts / motherboard.ts
│   │   └── temperature.ts
│   │
│   ├── repair/                   # 🔧 一键修复 (Phase 10)
│   │   ├── engine.ts             #   修复引擎核心 296行
│   │   ├── ai.ts                 #   AI 诊断 (DeepSeek) 331行
│   │   ├── detectors/            #   问题检测器
│   │   │   ├── display.ts        #   显示问题 (黑屏/蓝屏/花屏)
│   │   │   ├── performance.ts    #   性能问题检测
│   │   │   ├── network.ts        #   网络问题检测
│   │   │   ├── audio.ts          #   音频问题检测
│   │   │   ├── peripherals.ts    #   外设问题检测
│   │   │   └── system.ts         #   系统问题检测
│   │   ├── fixers/               #   修复器（7个）
│   │   │   ├── display.ts / network.ts / audio.ts / performance.ts
│   │   │   ├── peripherals.ts / software.ts / system.ts
│   │   ├── bluescreen.ts         #   蓝屏分析
│   │   ├── sfc.ts / rollback.ts  #   系统文件检查 / 回滚
│   │   └── logs.ts / utils.ts
│   │
│   ├── overlay/                  # 📊 性能浮窗 (Phase 11a)
│   │   ├── dataCollector.ts      #   数据采集器 242行
│   │   ├── overlayManager.ts     #   浮窗窗口管理 213行
│   │   └── overlay.html          #   浮窗 HTML
│   │
│   ├── policy/                   # 📋 本地策略编辑器 (Phase 11e)
│   │   └── policyManager.ts      #   1096行 — 最大模块
│   │
│   ├── accounts/                 # 👤 用户账户管理 (Phase 11b)
│   │   ├── userManager.ts        #   本地用户管理
│   │   └── credentialManager.ts  #   凭据管理器
│   │
│   ├── netdiag/                  # 🌐 网络诊断 (Phase 11c)
│   │   └── toolkit.ts
│   │
│   ├── cleanup/                  # 🧹 系统清理 (Phase 11d)
│   │   └── optimizer.ts
│   │
│   ├── external/                 # 🔌 外部设备管理 (Phase 11g)
│   │   └── deviceManager.ts      #   362行
│   │
│   ├── driver/                   # 🧩 驱动管理 (Phase 6)
│   │   └── driverManager.ts      #   493行 — 备份/恢复
│   │
│   ├── remote/                   # 🖥️ 远程桌面 (Phase 8)
│   │   └── manager.ts            #   350行
│   │
│   ├── registry/                 # 🗂️ 注册表查看器 (Phase 7)
│   │   └── viewer.ts             #   302行 (READ-ONLY!)
│   │
│   ├── health/                   # ❤️ 健康评分
│   │   └── scorer.ts             #   333行
│   │
│   ├── alerter/                  # 🔔 AI 自动告警 (Phase 2)
│   │   └── engine.ts             #   364行
│   │
│   ├── conflict/                 # ⚡ 冲突检测 (Phase 2)
│   │   └── detector.ts           #   157行
│   │
│   ├── network/                  # 🌐 网络层
│   │   ├── connections.ts        #   网络连接查看 (Phase 7) 191行
│   │   └── monitor.ts            #   网络监视 (Phase 3)
│   │
│   ├── software/                 # 📦 软件管理
│   │   ├── manager.ts            #   应用管理 (Phase 2) 158行
│   │   ├── collecter.ts          #   已装应用扫描 (Phase 1) 146行
│   │   └── updater.ts            #   更新检测 (Phase 2) 151行
│   │
│   ├── report/                   # 📄 报告导出 (Phase 8)
│   ├── security/                 # 🛡️ 安全中心 (Phase 5)
│   ├── firewall/                 # 🔥 防火墙规则 (Phase 5)
│   ├── usb/                      # 🔌 USB 设备 (Phase 5)
│   ├── clipboard/                # 📋 剪贴板历史 (Phase 5)
│   ├── restartore/               # 🔄 系统还原点 (Phase 8)
│   ├── files/                    # 🔍 文件扫描 (Phase 8)
│   ├── features/                 # 🪟 Windows 功能 (Phase 9)
│   ├── memory/                   # 🧠 内存分析 (Phase 9)
│   ├── sounds/                   # 🔊 系统声音 (Phase 9)
│   ├── fonts/                    # 🔤 字体管理 (Phase 9)
│   ├── battery/                  # 🔋 电池报告 (Phase 6)
│   ├── events/                   # 📝 事件日志 (Phase 6)
│   ├── perflog/                  # 📊 性能日志 (Phase 6)
│   ├── services/                 # ⚙️ 服务管理 (Phase 6)
│   ├── process/                  # 🟢 进程监视 (Phase 4)
│   ├── benchmark/                # ⚡ 基准测试 (Phase 4)
│   ├── scheduler/                # ⏰ 计划任务 (Phase 4)
│   ├── display/                  # 🖥️ 显示信息 (Phase 7)
│   ├── power/                    # ⚡ 电源方案 (Phase 7)
│   ├── startup/                  # 🚀 启动项管理 (Phase 3)
│   ├── system/                   # ℹ️ 系统信息 (Phase 4)
│   ├── disk/                     # 💾 磁盘分析
│   ├── database/                 # 💾 SQLite 数据库层
│   └── ...
│
├── src/                          # 🎨 前端渲染进程 (131 文件, ~22,300 行)
│   ├── App.tsx / main.tsx        #   入口
│   ├── stores/                   #   Zustand 状态仓库 (~50 个)
│   ├── components/               #   组件视图 (42+ 个目录)
│   │   ├── Dashboard/            #   仪表盘
│   │   ├── HardwareView/         #   硬件检测
│   │   ├── SoftwareView/         #   软件管理
│   │   ├── RepairCenter/         #   一键修复中心
│   │   ├── PerfOverlay/          #   性能浮窗控制
│   │   ├── AIChatPanel/          #   AI 聊天面板
│   │   ├── Sidebar/              #   侧边导航栏
│   │   ├── TitleBar/             #   自定义标题栏
│   │   ├── SettingsView/         #   设置页
│   │   ├── common/               #   通用组件库
│   │   ├── AccountsView/ ~ UsbView/  # 30+ 功能视图
│   │   └── ...
│   ├── hooks/                    #   自定义 Hooks
│   ├── styles/                   #   全局样式 (CSS 变量/暗色主题)
│   ├── types/                    #   TypeScript 类型定义
│   └── utils/                    #   工具函数
│
├── scripts/                      # 📜 构建工具脚本
│   └── gen_icons.js              #   图标生成 (sharp)
├── assets/                       # 🖼️ 资源文件
│   ├── icon.svg                  #   源 SVG (256x256)
│   ├── icon.png                  #   256px PNG (build 用)
│   ├── logo.png                  #   512px logo
│   └── icon_{size}x{size}.png    #   8 种尺寸 (16-256)
└── dist-electron/                # 📦 编译输出
```

---

## 📈 开发进度

### 已完成阶段

| Phase | 内容 | 模块数 | 状态 |
|-------|------|--------|------|
| **MVP v1.0** | 初始脚手架、Electron + React + Vite 搭建 | ~15 | ✅ |
| **MVP Ph2** | 冲突检测、应用管理、软件更新、AI告警、健康评分 | ~8 | ✅ |
| **UI 抛光** | TitleBar 增强、Settings 页面、图标生成、AI 连接测试 | ~5 | ✅ |
| **Phase 3** | Dashboard 增强、启动项管理、网络监控、温度历史 | ~6 | ✅ |
| **Phase 4** | 进程监视器、系统信息、基准测试、计划任务 | ~8 | ✅ |
| **Phase 5** | 防火墙规则、USB 设备、磁盘清理、安全中心、剪贴板历史 | ~10 | ✅ |
| **Phase 6** | 驱动管理、服务管理、事件日志、电池报告、性能日志 | ~10 | ✅ |
| **Phase 7** | 注册表查看器、网络连接、文件类型关联、显示信息、电源计划 | ~10 | ✅ |
| **Phase 8** | 系统还原、文件扫描、远程桌面、硬件报告导出 | ~8 | ✅ |
| **Phase 9** | 内存分析、Windows 功能管理、系统声音、字体管理 | ~8 | ✅ |
| **UI 抛光 v2** | 设计系统(CSS变量)、动画系统、通用组件库、侧边栏分组 | ~15 | ✅ |
| **Phase 10** | ⭐ **一键修复系统** — 7大检测器 + 7大修复器 + AI诊断 + 蓝屏分析 | ~20 | ✅ |
| **Phase 11a** | 性能监视器浮窗 Overlay (FPS/CPU/GPU/RAM HUD) | ~3 | ✅ |
| **Phase 11b** | 用户账户管理 (本地用户/UAC/凭据) | ~4 | ✅ |
| **Phase 11c** | 网络诊断工具箱 | ~2 | ✅ |
| **Phase 11d** | 系统清理优化 | ~2 | ✅ |
| **Phase 11e** | 本地组策略编辑器 (只读模式) | ~1 | ✅ |
| **Phase 11f** | 驱动备份与恢复 | ~2 | ✅ |
| **Phase 11g** | 外部设备管理器 | ~2 | ✅ |
| **Phase 12** | **真实数据整合** — clearTempFiles(真实fs)、Overlay 真实数据(CPU/GPU/memory)、构建修复 | ~5 | ✅ |

### 当前状态

```
🏁 全部 Phase 1-12 完成
📦 215 源文件 · ~48,000 行代码 · TypeScript 零错误
🌐 pc-toolkit/main@002490d · v1.0-beta
```

### 剩余事项（已知待办/缺陷）

| 类型 | 项目 | 说明 |
|------|------|------|
| 🔴 **功能** | FPS 数据采集 | Overlay 的 FPS 检测需要 DXGI API，当前为模拟数据 |
| 🟡 **功能** | 部分检测器仍为模拟 | 部分 detectors (如 Process/Registry) 是静态模拟数据 |
| 🟢 **构建** | Windows 原生构建 | 当前在 Linux 开发机，需在 Windows + WMI 环境下测试 |
| 🟢 **优化** | 首次启动体验 | 安装后引导流程尚未完善 |
| 🟢 **文档** | 用户帮助文档 | 缺乏详细使用说明 |

### 下一步方向（备选）

1. **FPS Overlay 真实化** — 接入 DXGI/DXGIOutputDuplication 获取真实帧率
2. **AI 诊断升级** — 更精准的问题根因分析 + 修复建议
3. **系统托盘 + 后台驻留** — 最小化到系统托盘，后台提供实时告警
4. **网络加速功能** — DNS 优化、网络延迟检测、带宽监控
5. **多语言支持** — 国际化 (i18n)

---

## 🔬 关键模块详解

### 一键修复系统 (Phase 10 — 核心功能)

```
用户触发扫描
     ↓
RepairEngine.run()
     ├── 6 个 Detectors 并行检测
     │   ├── display     → 显卡驱动/分辨率/黑屏
     │   ├── performance → CPU/内存/磁盘高占用
     │   ├── network     → DNS/连接/代理
     │   ├── audio       → 声卡/驱动/服务
     │   ├── peripherals → USB/蓝牙/外设
     │   └── system      → 系统文件/服务/事件
     │
     ├── AI 诊断 (DeepSeek)
     │   └── → 根因分析 + 修复建议
     │
     └── 用户选择修复 → 6 个 Fixers
         └── UAC 提权（按需弹窗）
```

### Overlay 性能浮窗 (Phase 11a)

```
DataCollector
  ├── CPU: /proc/stat (Linux) / WMI (Windows) → 使用率%
  ├── GPU: nvidia-smi / WMI → 使用率%/温度
  ├── RAM: os.freemem() → 占用率%
  ├── FPS: 模拟数据（待 DXGI 真实化）
  └── 推送至浮窗窗口 (Always-on-top, click-through)
```

---

## ⚡ 关键命令

```bash
npm run dev      # 开发模式启动
npm run build    # 生产构建
npm run lint     # ESLint
npm run preview  # 预览打包结果
```

---

## 📐 编码规范

- **TypeScript 严格模式** — 所有 .ts/.tsx 文件
- **文件名** — 后端 kebab-case (`driverManager.ts`)，组件 PascalCase (`DriverManagerView`)
- **IPC 通道** — `pchelper:<channel>` 命名空间
- **状态管理** — Zustand stores，组件通过 hook 消费
- **样式** — CSS 变量暗色主题，全局变量在 `src/styles/`
- **注册表** — ❌ **只读！严禁写入注册表**

## ⭐ 关键规则

1. 模型优先级: **DeepSeek V4 Pro 主模型** → **V4 Flash 仅子代理**
2. 注册表操作: **只读** — 用户协议明确禁止修改注册表
3. 硬件数据: 非 Windows 平台自动回退模拟数据
4. 所有 `electron/` 后端模块必须在 `main.ts` 和 `preload.ts` 中注册
5. 每个功能视图必须有对应的 Zustand store
