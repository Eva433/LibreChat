# LibreChat 本地开发环境

## 🚀 快速启动

### 1. 启动数据库服务
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. 启动开发服务器

**方式一：使用两个终端窗口**
```bash
# 终端 1 - 后端 API
npm run backend:dev

# 终端 2 - 前端界面
npm run frontend:dev
```

**方式二：使用 tmux/screen 分屏**
```bash
# 安装 tmux (如果没有)
sudo apt install tmux

# 启动 tmux
tmux

# 在第一个窗格运行后端
npm run backend:dev

# 按 Ctrl+B 然后按 " (双引号) 分割窗格
# 在第二个窗格运行前端
npm run frontend:dev

# 使用 Ctrl+B 然后方向键切换窗格
```

## 🌐 访问地址

- **前端界面**: http://localhost:3090
- **API 接口**: http://localhost:3080
- **API 配置**: http://localhost:3080/api/config

## 👤 测试账号

| Email | Password | 初始余额 |
|-------|----------|---------|
| test@example.com | Test123456 | 1,000,000 credits ($1.00) |
| test2@example.com | Test123456 | 1,000,000 credits ($1.00) |

## 📊 数据库服务

| 服务 | 地址 | 用途 |
|------|------|------|
| MongoDB | localhost:27017 | 主数据库 |
| Meilisearch | localhost:7700 | 搜索引擎 |

## 🛠️ 常用命令

### 用户管理
```bash
# 创建新用户
node config/create-user.js <email> <name> <username> <password> --email-verified=true

# 查看所有用户余额
node config/list-balances.js

# 给用户添加余额
node config/add-balance.js <email> <amount>
```

### 开发调试
```bash
# 重新构建 packages (修改 schemas 后需要)
npm run build:packages

# 只构建某个 package
npm run build:data-schemas
npm run build:data-provider
npm run build:api
npm run build:client-package

# 运行测试
npm run test:client
npm run test:api
```

### 数据库管理
```bash
# 停止数据库服务
docker compose -f docker-compose.dev.yml down

# 停止并删除数据（清空数据库）
docker compose -f docker-compose.dev.yml down -v

# 重启数据库
docker compose -f docker-compose.dev.yml restart

# 查看数据库日志
docker compose -f docker-compose.dev.yml logs -f mongodb
```

## 🔧 开发工作流

### 修改后端代码
1. 编辑 `api/` 目录下的文件
2. Nodemon 自动检测到变化并重启服务器（1-2秒）
3. 立即测试 API

### 修改前端代码
1. 编辑 `client/src/` 目录下的文件
2. Vite 热模块替换（HMR）立即生效（<1秒）
3. 浏览器自动刷新

### 修改共享包（schemas/types）
1. 编辑 `packages/` 目录下的文件
2. 运行 `npm run build:packages`
3. 后端和前端会自动重新加载

## 📝 环境配置

### 核心配置文件
- `.env` - 环境变量配置
- `librechat.yaml` - AI 端点和功能配置
- `docker-compose.dev.yml` - 数据库服务配置

### 重要环境变量
```bash
# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# OpenAI API Key (管理员统一 key)
OPENAI_API_KEY=sk-your-real-openai-api-key-here

# 数据库连接
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
MEILI_HOST=http://127.0.0.1:7700
```

## 💰 额度系统

当前配置：
- **启用**: ✅ balance.enabled = true
- **初始余额**: 1,000,000 credits ($1.00)
- **自动充值**: ✅ 每30天充值 500,000 credits ($0.50)
- **交易记录**: ✅ 已启用

### 额度换算
```
1,000,000 credits = $1.00
500,000 credits = $0.50
100,000 credits = $0.10
```

## 🐛 故障排除

### 后端启动失败
```bash
# 检查是否缺少 packages 构建
npm run build:packages

# 检查后端日志
# 日志会直接显示在终端中
```

### 前端无法连接后端
```bash
# 确认后端正在运行
curl http://localhost:3080/api/config

# 检查 .env 中的配置
grep DOMAIN .env
```

### 数据库连接失败
```bash
# 确认数据库容器运行中
docker compose -f docker-compose.dev.yml ps

# 重启数据库
docker compose -f docker-compose.dev.yml restart mongodb
```

### 端口被占用
```bash
# 查看端口占用
sudo lsof -i :3080  # 后端
sudo lsof -i :3090  # 前端
sudo lsof -i :27017 # MongoDB

# 杀掉占用进程
sudo kill -9 <PID>
```

## 📚 下一步开发

### 集成 Stripe 付费
参考 CLAUDE.md 中的 "Stripe 集成计划" 部分：
1. 添加前端充值按钮
2. 创建后端 Stripe API
3. 配置 webhook 处理支付成功事件
4. 测试充值流程

### 替换真实 API Key
```bash
# 编辑 .env 文件
vim .env

# 修改这一行
OPENAI_API_KEY=sk-你的真实OpenAI-API-Key

# 重启后端
# Ctrl+C 停止，然后重新运行 npm run backend:dev
```

## 🔗 相关文档

- [CLAUDE.md](./CLAUDE.md) - 项目架构和命令详解
- [LibreChat 官方文档](https://librechat.ai/docs)
- [Balance 系统文档](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/balance)
