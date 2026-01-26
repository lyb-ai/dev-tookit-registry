# dev-tookit Registry 📦

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](#) [![React Peer](https://img.shields.io/badge/React-%3E%3D16.8-61DAFB?logo=react&logoColor=white)](#) [![pnpm](https://img.shields.io/badge/pnpm-%E2%86%91-2C4A6E?logo=pnpm)](#)

将包作为“源码生成器”而非“运行时依赖”。本仓库是 dev-tookit 的公共源码模板注册表：以 TypeScript 源码形式维护 Hooks 与 Utils，并通过索引文件 index.json 暴露给 CLI 或任意客户端使用。

文档地址：[dev-tookit Registry](https://lyb-ai.github.io/dev-tookit-registry/)

## 目录

- 🚀 快速开始
- 📁 仓库结构
- 🔖 注册表规范
- 🧩 内置组件一览
- 🛠️ 开发与维护
- 🤝 贡献指南
- 📄 许可协议

## 🚀 快速开始

你可以本地启动注册表服务，或将其部署到任意静态托管平台（如 GitHub Pages、Vercel、Netlify）。

- 在你的项目中配置 dev-tookit CLI：

```bash
npx dev-tookit init
```

- 使用 CLI 拉取并注入源码：

```bash
# 添加 Hook（自动处理内部依赖）
npx dev-tookit add hook useLocalStorage

# 添加 Util（强制覆盖）
npx dev-tookit add util formatDate --force

# 查看可用组件列表
npx dev-tookit list
```

说明：CLI 会请求 `<registryUrl>/index.json` 以获取组件元数据，并根据 aliases/paths 将源码写入你的项目，同时重写 import 路径以匹配本地别名。

## 📁 仓库结构

```
@dev-tookit/registry
├── hooks/              # Hook 源码（TS）
├── utils/              # 工具函数源码（TS）
├── index.json          # 中央注册表索引（自动/手动维护）
├── schema.json         # 索引文件 JSON Schema
├── scripts/            # 维护脚本（构建索引、新增模板）
├── tsconfig.json       # TS 配置（含路径别名）
├── package.json        # 工程与脚本
└── LICENSE             # 开源许可（MIT）
```

- 启动服务：`pnpm run start`（`serve . --cors`）。
- 构建索引：`pnpm run build:index`（扫描 hooks/ 与 utils/ 生成 index.json）。
- 类型检查：`pnpm run typecheck`（TS 严格模式，无输出）。

## 🔖 注册表规范

索引文件 [index.json](./index.json) 遵循 [schema.json](./schema.json) 的结构：

- 顶层分类：`hooks` 与 `utils`。
- 组件字段：`name`、`description`、`version`、`files`、`dependencies`、`internalDependencies`。
- 文件项：`type`（hook|util）、`path`（在注册表中的相对路径）、`target`（注入到用户项目的位置建议）。
- 内部依赖：以 `utils/isBrowser` 形式声明；CLI 会递归注入并重写 import。

示例（节选）：

```json
{
  "$schema": "./schema.json",
  "hooks": {
    "useLocalStorage": {
      "name": "useLocalStorage",
      "description": "Persists state to localStorage with synchronization.",
      "category": "Hooks",
      "version": "1.0.0",
      "files": [
        {
          "type": "hook",
          "path": "hooks/useLocalStorage.ts",
          "target": "hooks/useLocalStorage.ts"
        }
      ],
      "dependencies": [],
      "internalDependencies": ["utils/isBrowser"]
    }
  }
}
```

## 🧩 内置组件一览

- Hooks

  - useDebounce — [hooks/useDebounce.ts](./hooks/useDebounce.ts)
  - useDebounceFn — [hooks/useDebounceFn.ts](./hooks/useDebounceFn.ts)
  - useLocalStorage — [hooks/useLocalStorage.ts](./hooks/useLocalStorage.ts)

- Utils
  - isBrowser — [utils/isBrowser.ts](./utils/isBrowser.ts)
  - formatDate — [utils/formatDate.ts](./utils/formatDate.ts)

在 useLocalStorage 中使用了路径别名 `@/utils/isBrowser`。当通过 CLI 注入到你的项目时，会根据 `aliases` 自动重写为本地路径（例如 `@/lib/utils/isBrowser`）。

## 🛠️ 开发与维护

- 安装与启动（推荐使用 pnpm）：

```bash
pnpm install
pnpm run start # 使用 serve 静态服务，默认 http://localhost:3000/
```

- 新增一个 Hook/Util：

```bash
pnpm run newTool
```

根据交互选择类型与名称，脚本会在 `hooks/` 或 `utils/` 下创建模板文件。完成后执行：

```bash
pnpm run build:index
pnpm run typecheck
```

- 索引生成逻辑：

  - 扫描 `hooks/` 和 `utils/` 的 TS 文件。
  - 从注释中提取首行描述。
  - 解析 `@/hooks/*` 或 `@/utils/*` 的内部依赖。
  - 生成符合 Schema 的 `index.json`。

- 本地预览：

  - 启动后访问 `http://localhost:3000/index.json` 查看注册表索引。

- 配置 registryUrl 为本地服务地址：

```json
{
  "$schema": "./node_modules/dev-tookit/schema.json",
  "typescript": true,
  "registryUrl": "http://localhost:3000",
  "aliases": {
    "utils": "@/lib/utils",
    "hooks": "@/hooks"
  },
  "paths": {
    "hooks": "src/hooks",
    "utils": "src/lib/utils"
  }
}
```

## 🤝 贡献指南

- 欢迎提交 Issue 与 PR，建议包含：变更目的、实现概要、测试/验证方式。
- 建议补充：CONTRIBUTING.md、CODE_OF_CONDUCT.md、SECURITY.md 与 CHANGELOG.md，以提升协作质量。
- 代码风格：TypeScript 严格模式，保持简洁可读；避免引入运行时重型依赖。

## 📄 许可协议

本项目基于 MIT 许可证开源，详见 [LICENSE](./LICENSE)。
