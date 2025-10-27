# AI 旅行规划助手 (AI Traveler Planner)

本仓库是 AI 旅行规划助手项目的代码库，旨在通过 AI 技术简化旅行规划过程，为用户提供个性化的智能旅行服务。

项目采用前后端分离架构：
- **前端**: Vue 3 + Vite + Tailwind CSS
- **后端**: Node.js + Express
- **数据库与认证**: Supabase

---

## 快速开始

请遵循以下步骤在本地运行本项目进行开发。

### 1. 环境准备

- **Node.js**: 确保你已安装 Node.js (v18.x 或更高版本)。
- **Supabase**:
    1.  访问 [Supabase 官网](https://supabase.com/) 创建一个新项目。
    2.  在项目的 "SQL Editor" 中，执行根目录下的 `schema.sql` 文件内容以初始化数据库。
    3.  在 "Project Settings" -> "API" 中，获取你的 **Project URL** 和 **anon public key**。

### 2. 后端本地运行

1.  **进入后端目录**
    ```bash
    cd backend
    ```

2.  **配置环境变量**
    - 复制 `.env.example` (如果存在) 或手动创建一个 `.env` 文件。
    - 在 `.env` 文件中填入你的 Supabase 信息：
      ```env
      SUPABASE_URL=YOUR_SUPABASE_URL
      SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      PORT=3001
      ```

3.  **安装依赖**
    ```bash
    npm install
    ```

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    后端服务将运行在 `http://localhost:3001`。

### 3. 前端本地运行

1.  **进入前端目录**
    ```bash
    cd frontend
    ```

2.  **配置环境变量**
    - 创建一个 `.env` 文件。
    - 在 `.env` 文件中填入你的 Supabase 信息 (注意前缀 `VITE_`)：
      ```env
      VITE_SUPABASE_URL=YOUR_SUPABASE_URL
      VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```

3.  **安装依赖**
    ```bash
    npm install
    ```

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    前端应用通常会运行在 `http://localhost:5173`。在浏览器中打开此地址即可访问。

---

## 项目文档

- **产品需求文档**: [PRD.md](./PRD.md)
- **数据库结构**: [schema.sql](./schema.sql)
- **详细开发路线图**: [DEVELOPMENT_STEPS.md](./DEVELOPMENT_STEPS.md)
