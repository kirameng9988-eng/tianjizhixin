# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

天机智信运营管理系统，一个基于 Node.js Monorepo 架构的前后端分离项目。

## 常用命令

```bash
# 启动全部服务（前端 + 后端）
npm run dev

# 仅启动前端开发服务器
npm run dev:frontend

# 仅启动后端服务
npm run dev:backend

# 前端构建生产版本
npm run build --workspace=frontend
```

## 架构说明

### Monorepo 结构

```
tianji-operation/
├── frontend/          # React + Vite 前端
│   └── src/
│       ├── contexts/  # React Context (AuthContext)
│       ├── pages/     # 页面组件 (Home, Config, Login)
│       ├── components/# 可复用组件
│       └── services/  # API 调用层
├── backend/           # Express.js 后端 API
│   ├── routes/        # 路由处理 (systems, config, users, roles)
│   └── data/          # JSON 数据存储
└── package.json       # 根 workspace 配置
```

### 技术栈

- **前端**: React 18, Vite, React Router DOM, 纯 CSS（Tailwind 可选）
- **后端**: Express.js, CORS, JSON 文件存储
- **端口**: 前端 5173, 后端 3001

### 认证与权限

认证机制使用 localStorage 持久化用户会话。登录流程：

1. 用户登录 → 调用 `/api/users` 验证
2. 验证成功 → 存储用户信息到 localStorage
3. 刷新页面 → 从 localStorage 恢复用户状态

权限控制基于角色（Role）：
- 每个角色包含 `systemIds` 数组，表示可访问的系统
- 用户首页只显示其角色有权限的系统

### API 代理配置

前端 Vite 配置了 `/api` 代理到 `http://localhost:3001`。主要接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/systems` | GET/POST | 子系统列表/添加 |
| `/api/systems/:id` | PUT/DELETE | 更新/删除子系统 |
| `/api/config` | GET/PUT | 系统配置（名称、Logo） |
| `/api/users` | GET/POST | 用户列表/添加 |
| `/api/users/:id` | PUT/DELETE | 更新/删除用户 |
| `/api/roles` | GET/POST | 角色列表/添加 |
| `/api/roles/:id` | PUT/DELETE | 更新/删除角色 |

### 页面路由

- `/login` - 登录页（无需认证）
- `/` - 首页，展示用户有权限访问的子系统
- `/config` - 配置管理页（需登录）

## 开发注意事项

- 后端数据存储在 `backend/data/*.json`，修改后需重启后端
- 前端 API 调用在 `src/services/api.ts` 集中管理
- 角色权限在 `roles.json` 中配置，通过 `systemIds` 控制可访问系统