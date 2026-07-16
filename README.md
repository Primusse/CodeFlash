# CodeFlash - 编程知识刷题工具

前后端分离的编程知识刷题应用，支持 Java、Golang、AI Agent、Docker 四个方向的题库。包含选择题、填空题两种题型，自带错题本、学习统计、笔记管理和题库管理功能。

## ✨ 功能特性

- 📚 **多分类题库**：Java / Go / AI Agent / Docker，支持选择题和填空题
- 🎯 **随机抽题**：可自定义题目数量和题型，每次刷题随机打乱
- 📊 **学习统计**：全局正确率、分类进度统计、可视化进度条
- 📝 **错题本**：自动收录错题，支持按分类筛选，点击展开查看解析
- 📒 **笔记功能**：刷题过程中随时记录笔记，支持标签管理
- 🛠 **题库管理**：在线编辑题目、批量导入 JSON 格式题库
- 🎨 **分类自定义**：可自定义分类名称和图标，支持 48 个 emoji 图标
- 📱 **响应式设计**：移动端底部 Tab 栏，桌面端顶部导航，完美适配各种屏幕

## 🛠 技术栈

- **后端**: Go 1.22 + Gin v1.10 + GORM v1.25 + SQLite
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + React Router v6
- **部署**: Docker + Docker Compose + Nginx

## 📁 项目结构

```
CodeFlash/
├── backend/                    # 后端 Go 项目
│   ├── main.go                 # 入口，路由注册，CORS 配置
│   ├── config/                 # 配置加载（环境变量）
│   ├── database/               # 数据库初始化 + 种子数据
│   ├── models/                 # 纯数据库模型（Question/Progress/Note/CategoryMeta）
│   ├── dto/                    # 请求/响应结构体（按领域拆分）
│   ├── repository/             # 数据访问层（封装所有 DB 操作）
│   ├── handlers/               # HTTP 处理器（按领域拆分）
│   │   ├── category_handler.go
│   │   ├── quiz_handler.go
│   │   ├── progress_handler.go
│   │   ├── question_handler.go
│   │   ├── note_handler.go
│   │   └── category_meta_handler.go
│   ├── data/                   # JSON 题库文件 + SQLite 数据库
│   └── Dockerfile
│
├── frontend/                   # 前端 React 项目
│   ├── src/
│   │   ├── api/                # API 层（按领域拆分）
│   │   ├── hooks/              # 自定义 Hooks（useApi 状态管理）
│   │   ├── components/ui/      # 通用 UI 组件（Card/Button/Modal 等）
│   │   ├── pages/              # 页面组件
│   │   ├── constants/          # 常量配置
│   │   ├── utils/              # 工具函数
│   │   ├── types/              # TypeScript 类型定义
│   │   └── App.tsx             # 主应用 + 路由 + 导航
│   └── Dockerfile
│
├── docker-compose.yml          # 开发环境编排
├── docker-compose.prod.yml     # 生产环境编排
└── README.md
```

## 🚀 本地开发

### 后端

```bash
cd backend
go run .
# 服务启动在 http://localhost:8080
```

环境变量（可选）：
- `PORT`：服务端口，默认 `8080`
- `DB_PATH`：数据库文件路径，默认 `data/codeflash.db`
- `DATA_DIR`：数据目录，默认 `data`

### 前端

```bash
cd frontend
npm install
npm run dev
# 开发服务器启动在 http://localhost:3000
# API 请求自动代理到后端 8080 端口
```

构建生产版本：
```bash
npm run build
```

## 🐳 Docker 部署

### 一键部署

```bash
# 开发环境
docker-compose up -d --build

# 生产环境（带 Nginx）
docker-compose -f docker-compose.prod.yml up -d --build
```

### 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启后端
docker-compose restart backend
```

### 数据持久化

SQLite 数据库保存在 Docker Volume `codeflash_data` 中，重启不会丢失。

备份数据库：
```bash
docker cp codeflash-backend:/app/data/codeflash.db ./backup.db
```

## 🔌 API 端点

### 分类
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类及统计信息 |

### 答题
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/quiz/start` | 开始一组题目（随机抽取） |
| POST | `/api/quiz/submit` | 提交单个答案 |
| POST | `/api/quiz/submit-batch` | 批量提交答案 |

### 进度与统计
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/progress` | 获取各分类答题进度 |
| GET | `/api/stats` | 获取全局统计数据 |
| GET | `/api/wrong-questions` | 获取错题列表（支持 ?category= 筛选） |
| DELETE | `/api/progress` | 重置进度（支持 ?category= 指定分类） |

### 题库管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 获取题目列表 |
| PUT | `/api/questions/:id` | 更新题目 |
| DELETE | `/api/questions/:id` | 删除题目 |
| POST | `/api/questions/import` | 批量导入题目 |

### 笔记
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notes` | 获取笔记列表 |
| POST | `/api/notes` | 创建笔记 |
| PUT | `/api/notes/:id` | 更新笔记 |
| DELETE | `/api/notes/:id` | 删除笔记 |

### 分类元数据
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/category-metas` | 获取所有分类元数据 |
| PUT | `/api/category-metas/:key` | 更新分类名称和图标 |
| GET | `/api/icons` | 获取可用的 emoji 图标列表 |

## 📚 内置题库

| 分类 | 题量 | 覆盖内容 |
|------|------|----------|
| ☕ Java 后端开发 | 60题 | JVM、并发、Spring、MySQL、Redis、设计模式、Linux、网络等 |
| 🐹 Go 后端开发 | 60题 | 基础语法、并发、GMP、接口、标准库、框架、项目管理等 |
| 🤖 AI Agent 开发 | 60题 | LLM基础、Prompt工程、RAG、Agent架构、Function Calling、LangChain、Multi-Agent等 |
| 🐳 Docker 容器技术 | - | 镜像、容器、Dockerfile、Compose、网络等 |

### 批量导入题库

题目 JSON 格式：
```json
[
  {
    "id": "java-001",
    "category": "java",
    "subcategory": "jvm",
    "type": "choice",
    "difficulty": "medium",
    "question": "JVM 堆内存的默认最大值是？",
    "options": "[\"128MB\", \"512MB\", \"物理内存的1/4\", \"物理内存的1/2\"]",
    "answer": "物理内存的1/4",
    "explanation": "JVM 默认最大堆内存为物理内存的 1/4..."
  }
]
```

通过管理页面导入，或直接调用 `/api/questions/import` 接口。

## 📄 License

MIT
