# AGENTS.md

## 目的

- 本仓库包含一个位于 `frontend/` 的 Vue 3 + TypeScript 前端，以及一个位于 `backend/` 的 Spring Boot 后端。
- 应用负责处理鉴权、路由守卫、Dify 流式转发，以及基于流式接口输出生成 ECharts 图表。
- 前端通过 `VITE_API_BASE_URL` 调用本地后端，后端再去调用 Dify。
- 本文件是所有代理式编码工具在此仓库内工作的约定说明。

## 仓库结构

- `backend/pom.xml` - 后端依赖与 Maven 构建入口。
- `backend/src/main/java/com/example/difyechart/controller/` - 鉴权、图表、全局异常控制器。
- `backend/src/main/java/com/example/difyechart/service/` - 鉴权逻辑与 Dify 流式转发服务。
- `backend/src/main/resources/` - Spring Profile 与后端运行配置。
- `frontend/package.json` - 前端脚本与依赖。
- `frontend/src/main.ts` - 应用启动入口。
- `frontend/src/router/index.ts` - 路由配置与鉴权守卫。
- `frontend/src/views/` - 路由页面，目前包括 `Login.vue`、`Register.vue`、`Chart.vue`。
- `frontend/src/components/` - 通用组件，目前核心是 `ChartGenerator.vue`。
- `frontend/src/api/` - HTTP 与流式接口封装。
- `frontend/src/utils/` - 本地鉴权 token 工具。
- `frontend/src/types/` - 共享类型定义。
- `frontend/.env` - 本地环境变量，目前包含 `VITE_API_BASE_URL`。

## 工具链概况

- 后端运行时：Spring Boot 3.2 + Java 17
- 后端构建工具：Maven
- 前端包管理器：`npm`
- 前端框架：Vue 3
- 前端构建工具：Vite 5
- 语言：TypeScript，开启 `strict: true`
- 路由：Vue Router 4
- HTTP：`axios` 与原生 `fetch`
- 图表：ECharts 5
- 当前未发现 ESLint 配置。
- 当前未发现 Prettier 配置。
- 当前未发现测试框架或测试文件。
- 当前未发现 monorepo 工具。

## 已存在的规则文件

- 未发现 `.cursorrules` 文件。
- 未发现 `.cursor/rules/` 目录。
- 未发现 `.github/copilot-instructions.md` 文件。
- 如果之后新增这些规则文件，应将其要求合并进本文件，而不是忽略。

## 安装

在 `frontend/` 下执行：

```bash
npm install
```

在需要构建或编译后端时，于 `backend/` 下执行：

```bash
mvn compile
```

## 构建、检查与测试命令

前端命令应在 `frontend/` 下执行。

### 开发

```bash
npm run dev
```

- 启动 Vite 开发服务器。
- 默认端口为 `5173`，定义在 `frontend/vite.config.ts`。

### 前端生产构建

```bash
npm run build
```

- 预期行为：执行 `vue-tsc && vite build`。
- 当前仓库在给定环境下会在 `vue-tsc` 阶段失败，尚未进入 Vite 构建。
- 已观察到的报错：`Search string not found: "/supportedTSExtensions = .*(?=;)/"`。
- 这应视为已知工具链兼容问题，不一定代表应用代码本身有回归。

### 前端构建兜底命令

```bash
npx vite build
```

- 当你只想验证前端打包结果，而 `vue-tsc` 仍然失败时，使用该命令。
- 该命令已在当前环境中验证可用。

### 预览构建产物

```bash
npm run preview
```

- 在成功构建后本地预览前端。

### Lint

- 当前没有 `lint` 脚本。
- 当前没有 ESLint 配置。
- 不要在自动化流程中凭空使用 `npm run lint`，除非你同时补齐并记录相关工具链。

### 类型检查

- 当前没有独立的类型检查脚本。
- 类型检查现在是 `npm run build` 中的 `vue-tsc` 阶段。
- 如果你需要单独做类型检查，请使用：

```bash
npx vue-tsc --noEmit
```

- 但要注意，这个命令在当前环境下也会因为同样的工具链问题而失败。

### 测试

- 当前未配置测试运行器。
- `frontend/package.json` 中没有 `test` 脚本。
- 源码中未发现单元测试、集成测试或 e2e 测试文件。

### 单测执行

- 当前不支持单独运行某个测试，因为仓库中还没有测试框架。
- 如果后续新增测试，请在这里补充准确的单测命令。
- 在此之前，代理应明确说明当前不支持单测执行。

### 后端编译

在 `backend/` 下执行：

```bash
mvn -q -DskipTests compile
```

- 这是 Java 改动后的默认验证命令。
- 该命令已在当前环境中验证可用。

### 后端运行

在 `backend/` 下执行：

```bash
mvn spring-boot:run
```

- 修改 Java 代码、配置文件、SSE 行为或 Dify 转发逻辑后，需要重启后端。

## 环境变量

- 必需前端环境变量：`VITE_API_BASE_URL`
- 当前 `frontend/.env` 中的本地默认值：`http://localhost:8080`
- 前端默认后端会提供鉴权相关接口以及 `/api/chart/generate`。
- 后端在当前激活的 Spring Profile 下还需要 `DIFY_API_URL` 与 `DIFY_API_KEY`。
- 当前开发环境默认配置位于 `backend/src/main/resources/application-dev.properties`。

## 架构说明

- 后端通过 `/api/chart/generate` 暴露 SSE 接口，并转发 Dify `/chat-messages` 的流式输出。
- 整条链路为：`Dify -> Spring SseEmitter -> 前端 fetch stream -> ChartGenerator`。
- 修改后端转发逻辑时，必须保留事件名和流式 JSON 载荷；如果丢掉 SSE 的 `event:` 元信息，会导致前端无法可靠识别最终结果事件。
- 前端必须把流式响应视为“可能被拆分的传输片段”，不能把每个 chunk 当成完整消息。
- 最终图表配置可能和中间 think 文本分开发出，不能假设页面上展示的流式文本就是最终解析源。
- Vue 组件统一使用 `<script setup lang="ts">` 单文件组件。
- 使用 Composition API，不要引入 Options API。
- 路由页面放在 `src/views/`，可复用 UI 放在 `src/components/`。
- 网络传输逻辑放在 `src/api/`，本地存储辅助逻辑放在 `src/utils/`。
- 共享接口类型优先放在 `src/types/index.ts`，仅在文件过大时再拆分。
- 路由级鉴权位于 `src/router/index.ts`，不要破坏已有守卫行为。

## 代码风格

### 通用格式

- 使用 2 空格缩进。
- TypeScript 中使用单引号。
- TypeScript 中除非语法要求，否则不写分号。
- 控制行长，长属性或长参数列表优先换行。
- 遵循现有 SFC 顺序：`<template>`、`<script setup lang="ts">`、`<style>`。
- 默认优先使用 ASCII；但本仓库已有中文 UI 文案时，可以继续使用中文。

### 导入规范

- 外部依赖放在内部依赖之前。
- 类型导入使用 `import type`。
- 同一来源尽量只保留一组导入，避免重复导入。
- 沿用当前相对路径导入方式；仓库未配置路径别名。
- 保持导入顺序稳定、易读。

### Vue 约定

- 本地响应式状态优先用 `ref`。
- 派生状态优先用 `computed`，不要在模板中重复计算。
- `onMounted` 等生命周期钩子应在 setup 顶层同步注册。
- 简单折叠/展开交互优先使用原生 `details` / `summary`，不要轻易引入额外状态或依赖。
- 不要直接修改 props。
- 跨组件通信优先使用 props / emits，而不是组件 ref。
- 当逻辑可以下沉到 composable 或 API 层时，保持页面组件足够轻量。

### 模板与样式

- 当前界面大量使用内联样式；如果只是小范围修改，不要无端扩大这种模式。
- 如果是较大的 UI 重构，优先考虑 `scoped style` 或抽取样式，而不是继续堆内联样式。
- 在 SFC 模板中使用 PascalCase 组件标签。
- 模板保持声明式，避免把复杂解析逻辑写进模板表达式。
- 访问可能为空的数据前加好 `v-if` 保护。

### 类型

- 严格遵守 `frontend/tsconfig.json` 中的 `strict: true`。
- 参数和返回值在类型不明显时必须显式标注。
- 避免 `any`，优先使用明确接口、联合类型或 `unknown`。
- 当前代码中存在 `any` 和较弱的错误处理分支，应视作技术债，而不是可复制模式。
- DOM ref 要显式标注类型，例如 `ref<HTMLElement | null>(null)`。
- API 响应类型定义放在 `src/types/`，并在 `src/api/` 与组件中复用。

### 命名

- Vue 组件文件名和组件导入使用 PascalCase。
- 变量、函数、ref、composable 使用 camelCase。
- 模块级常量使用 UPPER_SNAKE_CASE。
- 处理函数名应清晰表达意图，例如 `handleLogin`、`handleRegister`、`generateChart`、`logout`。
- 接口名使用 PascalCase，请求/响应类型后缀使用 `Request` / `Response`。

### 错误处理

- 涉及 loading 切换的异步 UI 行为，统一使用 `try` / `catch` / `finally`。
- 可重试的异步操作前要先重置页面级错误状态。
- 用户可见错误应通过响应式状态展示，而不是只打印日志。
- 除非是明确重构鉴权流程，否则保留 `src/api/auth.ts` 里的现有 401 处理行为。
- 避免空 `catch`；如果解析失败是预期行为，应说明原因并安全降级。
- 重新抛错或 reject 时保留足够上下文。
- 对流式请求而言，如果后段连接中断但前面已经拿到可用内容，应优先保留并继续处理；只有完全没有可用内容时才硬失败。

### API 与异步模式

- HTTP 逻辑放在 `src/api/`，不要直接写进视图组件。
- 复用 `src/utils/auth.ts` 中的鉴权 token 工具。
- 如果新增接口，统一抽取重复的 header 或 base URL 逻辑。
- 对流式响应要防御 partial chunk 和格式不完整的 JSON。
- 对 SSE 转发要按“事件块”解析，不能假设每一行都是独立完整消息。
- 代理 Dify 流时，必须同时保留 `event:` 和 `data:` 语义。
- 前端在解析流时要为不完整片段保留 buffer，再做 JSON 解析。
- 前端流解析需要兼容普通 JSON 行和 `data: {...}` 这种 SSE 风格行。
- think 文本和最终图表 JSON 应视为两类不同输出：think 用于用户体验展示，图表 option 应从完成态答案中提取。
- 当图表成功渲染后，长 think 文本优先折叠显示，而不是直接删除。
- 如果组件生命周期变复杂，记得清理 ECharts 实例或事件监听等副作用。

## 代理工作指引

- 在改动结构前，先判断是否可以通过小范围修改符合现有模式。
- 不要为了风格偏好随意增加新依赖。
- 只有在任务明确需要时，才增加 lint 或测试工具。
- 如果你新增了 lint 或测试，请同步更新本文件中的准确命令，包括单测命令。
- 当构建或类型检查失败时，要区分是工具链问题还是应用代码回归。
- 调试图表生成链路时，应检查整条链路：Dify 返回结构、后端 SSE 转发、前端流解析、最终 JSON 提取、ECharts 渲染。
- 如果前端出现部分 think 文本后接 `network error`，优先检查后端 SSE 超时与完成逻辑，不要先假定模型输出有问题。
- 保持修改聚焦；这是一个比较紧凑的小型代码库。

## 代理快速检查清单

- UI 相关任务在 `frontend/` 中处理；鉴权、接口、Dify 转发相关任务在 `backend/` 中处理。
- 保持 Vue 3 + Composition API + TypeScript 方案不变。
- 保持 Spring Boot 下 `/api/chart/generate` 的 SSE 行为不被破坏。
- 类型导入使用 `import type`。
- 避免 `any` 和静默失败。
- 记住当前没有 lint 命令，也没有测试命令。
- 记住当前不支持单独运行某个测试。
