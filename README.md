
---

## 环境配置

1. **安装依赖**

   ```bash
   npm install
   # 或
   yarn install
   ```

2. **本地运行**

   ```bash
   npm run dev
   # 或
   yarn dev
   ```

---
## 项目结构
```bash
neusoft/
├── doc/ # 项目文档
├── public/ # 公共资源
├── src/
│ ├── api/ # API 请求模块
│ ├── assets/ # 静态资源（图片、样式等）
│ ├── components/ # 通用组件
│ ├── layout/ # 布局相关组件
│ ├── router/ # 路由配置
│ ├── stores/ # 状态管理（Pinia）
│ ├── utils/ # 工具函数
│ ├── views/ # 页面视图
│ └── main.ts # 入口文件
├── .vscode/ # VSCode 配置
├── .editorconfig # 编辑器配置
├── .eslintrc # ESLint 配置
├── .prettierrc # Prettier 配置
├── package.json # 项目依赖及脚本
├── tsconfig.json # TypeScript 配置
└── vite.config.ts # Vite 配置

```

---

## 开发规范

- **分支管理**：采用 `feature/xxx`、`fix/xxx`、`release/xxx` 等命名规范，便于协作和追踪。
- **代码风格**：统一使用 ESLint + Prettier 自动校验和格式化，保证代码风格一致。
- **组件开发**：推荐使用组合式 API，组件命名采用大驼峰（PascalCase）。
