# CodeFlash - 编程知识刷题工具

前后端分离的编程知识刷题应用，支持 Java、Golang、AI Agent 三个方向的题库。

## 技术栈

- **后端**: Go + Gin + GORM + SQLite
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **部署**: Docker + Docker Compose + Nginx

## 本地开发

### 后端

```bash
cd backend
go run .
# 服务启动在 http://localhost:8080
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 开发服务器启动在 http://localhost:3000
# API 请求自动代理到后端 8080 端口
```

## Docker 部署

### 一键部署到云服务器

```bash
# 1. 在服务器上安装 Docker 和 Docker Compose
# 2. 上传项目到服务器
# 3. 在项目根目录执行：
docker-compose up -d --build
```

### 单独构建镜像

```bash
# 后端
docker build -t codeflash-backend ./backend

# 前端
docker build -t codeflash-frontend ./frontend
```

### 查看日志

```bash
docker-compose logs -f
```

### 停止服务

```bash
docker-compose down
```

### 数据持久化

SQLite 数据库保存在 Docker Volume `codeflash_data` 中，重启不会丢失。如需备份：

```bash
docker cp codeflash-backend:/app/data/codeflash.db ./backup.db
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 获取所有分类和统计 |
| POST | /api/quiz/start | 开始一组题目 |
| POST | /api/quiz/submit | 提交单个答案 |
| POST | /api/quiz/submit-batch | 批量提交答案 |
| GET | /api/progress | 获取学习进度 |
| GET | /api/stats | 获取统计数据 |
| GET | /api/wrong-questions | 获取错题列表 |
| DELETE | /api/progress | 重置进度 |

## 题库

- ☕ **Java 后端开发** (60题): JVM、并发、Spring、MySQL、Redis、设计模式、Linux、网络等
- 🐹 **Go 后端开发** (60题): 基础语法、并发、GMP、接口、标准库、框架、项目管理等
- 🤖 **AI Agent 开发** (60题): LLM基础、Prompt工程、RAG、Agent架构、Function Calling、LangChain、Multi-Agent等
