# LibreChat 完整配置选项指南

LibreChat 提供两种主要配置方式：
1. **环境变量** (`.env` 文件) - 系统级别配置
2. **YAML 配置** (`librechat.yaml` 文件) - 功能和端点配置

---

## 📋 目录

1. [基础服务器配置](#基础服务器配置)
2. [认证和安全](#认证和安全)
3. [AI 端点配置](#ai-端点配置)
4. [用户界面配置](#用户界面配置)
5. [额度和计费系统](#额度和计费系统)
6. [文件上传和存储](#文件上传和存储)
7. [高级功能](#高级功能)
8. [性能和限制](#性能和限制)

---

## 1. 基础服务器配置

### 环境变量 (`.env`)

```bash
# 服务器基本配置
HOST=localhost                # 监听地址
PORT=3080                     # 监听端口
NODE_ENV=production           # 运行模式: production | development

# 域名配置
DOMAIN_CLIENT=http://localhost:3080    # 前端域名
DOMAIN_SERVER=http://localhost:3080    # 后端域名

# 数据库
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
MONGO_MAX_POOL_SIZE=          # 连接池最大连接数
MONGO_MIN_POOL_SIZE=          # 连接池最小连接数

# 搜索引擎 (Meilisearch)
MEILI_HOST=http://127.0.0.1:7700
MEILI_MASTER_KEY=your-master-key
MEILI_NO_ANALYTICS=true

# 日志
DEBUG_LOGGING=true            # 启用调试日志
DEBUG_CONSOLE=false           # 控制台调试输出
CONSOLE_JSON=false            # JSON 格式日志
```

### YAML 配置 (`librechat.yaml`)

```yaml
version: 1.3.3                # 配置版本 (必填)
cache: true                   # 启用缓存
```

---

## 2. 认证和安全

### 用户注册

```bash
# .env
ALLOW_REGISTRATION=true       # 启用用户注册
ALLOW_UNVERIFIED_EMAIL_LOGIN=false  # 允许未验证邮箱登录
```

```yaml
# librechat.yaml
registration:
  enabled: true               # 启用注册
  socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
  allowedDomains:             # 限制注册邮箱域名
    - "company.com"
    - "gmail.com"
```

### JWT 认证

```bash
# .env
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
SESSION_EXPIRY=1000 * 60 * 15              # 15分钟
REFRESH_TOKEN_EXPIRY=(1000 * 60 * 60 * 24) * 7  # 7天
```

### 社交登录 (OAuth)

```bash
# .env
ALLOW_SOCIAL_LOGIN=true

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
GITHUB_CALLBACK_URL=/oauth/github/callback

# Discord, Facebook, Apple 类似配置...
```

### LDAP 认证

```bash
# .env
LDAP_URL=ldap://your-ldap-server
LDAP_BIND_DN=cn=admin,dc=example,dc=com
LDAP_BIND_CREDENTIALS=admin-password
LDAP_USER_SEARCH_BASE=ou=users,dc=example,dc=com
```

### Cloudflare Turnstile (防机器人)

```yaml
# librechat.yaml
turnstile:
  siteKey: "your-site-key"
  options:
    language: "auto"          # 或 ISO 639-1 语言代码
    size: "normal"            # normal | compact | flexible | invisible
```

---

## 3. AI 端点配置

### OpenAI

```bash
# .env
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODELS=gpt-4o,gpt-4o-mini,o1,o1-mini
OPENAI_REVERSE_PROXY=        # 反向代理 URL
HIDE_USER_API_KEY=true       # 隐藏用户 API key 输入
```

### Anthropic (Claude)

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODELS=claude-opus-4.5,claude-sonnet-4
```

```yaml
# librechat.yaml - Vertex AI 配置
endpoints:
  anthropic:
    streamRate: 20            # 流式速率限制 (ms)
    titleModel: claude-3.5-haiku
    vertex:
      region: "us-east5"      # Vertex AI 区域
      projectId: "${VERTEX_PROJECT_ID}"
      models:
        claude-opus-4.5:
          deploymentName: claude-opus-4-5@20251101
        claude-sonnet-4:
          deploymentName: claude-sonnet-4-20250514
```

### Google (Gemini)

```bash
# .env
GOOGLE_KEY=your-google-api-key
GOOGLE_MODELS=gemini-2.5-flash,gemini-2.5-pro

# Vertex AI
VERTEX_PROJECT_ID=your-gcp-project-id
VERTEX_REGION=us-central1
GOOGLE_SERVICE_KEY_FILE=/path/to/service-account.json

# 安全设置
GOOGLE_SAFETY_SEXUALLY_EXPLICIT=BLOCK_ONLY_HIGH
GOOGLE_SAFETY_HATE_SPEECH=BLOCK_ONLY_HIGH
GOOGLE_SAFETY_HARASSMENT=BLOCK_ONLY_HIGH
GOOGLE_SAFETY_DANGEROUS_CONTENT=BLOCK_ONLY_HIGH
```

### 自定义端点 (Groq, Mistral, OpenRouter 等)

```yaml
# librechat.yaml
endpoints:
  custom:
    # Groq 示例
    - name: 'groq'
      apiKey: '${GROQ_API_KEY}'
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default:
          - 'llama3-70b-8192'
          - 'mixtral-8x7b-32768'
        fetch: false
      titleConvo: true
      titleModel: 'mixtral-8x7b-32768'
      modelDisplayLabel: 'Groq'

    # Mistral AI 示例
    - name: 'Mistral'
      apiKey: '${MISTRAL_API_KEY}'
      baseURL: 'https://api.mistral.ai/v1'
      models:
        default: ['mistral-large', 'mistral-small']
        fetch: true
      dropParams: ['stop', 'user', 'frequency_penalty', 'presence_penalty']

    # OpenRouter 示例
    - name: 'OpenRouter'
      apiKey: '${OPENROUTER_KEY}'
      baseURL: 'https://openrouter.ai/api/v1'
      models:
        default: ['meta-llama/llama-3-70b-instruct']
        fetch: true
      dropParams: ['stop']
```

### AWS Bedrock

```bash
# .env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

```yaml
# librechat.yaml
endpoints:
  bedrock:
    guardrailConfig:
      guardrailIdentifier: "your-guardrail-id"
      guardrailVersion: "1"
      trace: "enabled"        # enabled | enabled_full | disabled
```

---

## 4. 用户界面配置

```yaml
# librechat.yaml
interface:
  # 欢迎消息
  customWelcome: '欢迎使用 LibreChat！'

  # 功能开关
  endpointsMenu: true         # 端点选择菜单
  modelSelect: true           # 模型选择
  parameters: true            # 参数调整
  sidePanel: true             # 侧边栏
  presets: true               # 预设功能
  bookmarks: true             # 书签
  multiConvo: true            # 多对话
  fileSearch: true            # 文件搜索
  webSearch: true             # 网页搜索
  fileCitations: true         # 文件引用

  # Prompts 功能
  prompts:
    use: true                 # 使用提示词
    share: false              # 分享提示词
    public: false             # 公开提示词

  # AI Agents
  agents:
    use: true                 # 使用 AI Agents
    share: false              # 分享 Agents
    public: false             # 公开 Agents

  # MCP Servers
  mcpServers:
    use: false                # 使用 MCP 服务器
    create: false             # 创建 MCP 服务器
    share: false              # 分享 MCP 服务器
    public: false             # 公开 MCP 服务器

  # People Picker (用户/组选择器)
  peoplePicker:
    users: true               # 显示用户
    groups: true              # 显示组
    roles: true               # 显示角色

  # Marketplace
  marketplace:
    use: false                # Agent 市场

  # 隐私政策和服务条款
  privacyPolicy:
    externalUrl: 'https://your-domain.com/privacy'
    openNewTab: true

  termsOfService:
    externalUrl: 'https://your-domain.com/tos'
    openNewTab: true
    modalAcceptance: true     # 显示 TOS 确认弹窗
    modalTitle: 'Terms of Service'
    modalContent: |
      # 在此编写 Markdown 格式的服务条款...

  # 临时对话保留时间（小时）
  temporaryChatRetention: 720  # 默认 30 天
```

---

## 5. 额度和计费系统

```yaml
# librechat.yaml
balance:
  enabled: true               # 启用额度系统
  startBalance: 1000000       # 新用户初始额度 ($1.00)
  autoRefillEnabled: true     # 自动充值
  refillIntervalValue: 30     # 充值间隔值
  refillIntervalUnit: 'days'  # 间隔单位: seconds|minutes|hours|days|weeks|months
  refillAmount: 500000        # 每次充值金额 ($0.50)

transactions:
  enabled: true               # 启用交易记录
```

**换算关系**: 1,000,000 credits = $1.00

**CLI 命令**:
```bash
# 查看所有用户余额
node config/list-balances.js

# 给用户充值
node config/add-balance.js user@example.com 500000

# 设置用户余额
node config/set-balance.js user@example.com 1000000
```

---

## 6. 文件上传和存储

### 存储策略

```yaml
# librechat.yaml
# 方式一：统一存储策略
fileStrategy: "s3"            # local | s3 | firebase

# 方式二：分类存储（推荐）
fileStrategy:
  avatar: "s3"                # 用户头像
  image: "firebase"           # 聊天图片
  document: "local"           # 文档文件
```

### S3 存储配置

```bash
# .env
AWS_ENDPOINT_URL=            # 自定义 S3 端点（兼容 MinIO）
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=librechat-files
```

### Firebase 存储

```bash
# .env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

### Azure Blob 存储

```bash
# .env
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=librechat
```

### 文件大小限制

```yaml
# librechat.yaml
fileConfig:
  serverFileSizeLimit: 100    # 全局文件大小限制 (MB)
  avatarSizeLimit: 2          # 头像大小限制 (MB)

  endpoints:
    assistants:
      fileLimit: 5            # 最多文件数
      fileSizeLimit: 10       # 单个文件大小 (MB)
      totalSizeLimit: 50      # 总文件大小 (MB)
      supportedMimeTypes:
        - "image/.*"
        - "application/pdf"

    openAI:
      disabled: true          # 禁用文件上传

    default:
      totalSizeLimit: 20

  # 客户端图片调整
  clientImageResize:
    enabled: false
    maxWidth: 1900
    maxHeight: 1900
    quality: 0.92             # JPEG 质量 (0.0-1.0)

  # 图片生成设置
  imageGeneration:
    percentage: 100           # 或使用 px: 1024
```

---

## 7. 高级功能

### Model Specs (模型规格预设)

```yaml
# librechat.yaml
modelSpecs:
  prioritize: true            # 优先显示模型规格
  enforce: false              # 强制使用模型规格

  list:
    # 嵌套在端点下
    - name: "gpt-4o-coding"
      label: "GPT-4o 编程助手"
      description: "专为编程任务优化"
      group: "openAI"         # 分组到 openAI 端点下
      default: true           # 设为默认
      preset:
        endpoint: "openAI"
        model: "gpt-4o"
        temperature: 0.3
        instructions: "你是一个专业的编程助手..."

    # 自定义分组
    - name: "creative-writer"
      label: "创意写作助手"
      group: "My Assistants"  # 自定义分组
      groupIcon: "https://example.com/icon.png"
      preset:
        endpoint: "anthropic"
        model: "claude-sonnet-4"
        temperature: 0.9
```

### AI Agents 配置

```yaml
# librechat.yaml
endpoints:
  agents:
    recursionLimit: 50        # 默认递归深度
    maxRecursionLimit: 100    # 最大递归深度
    disableBuilder: false     # 禁用 Agent 构建器
    maxCitations: 30          # 最大引用数
    maxCitationsPerFile: 7    # 每个文件最大引用数
    minRelevanceScore: 0.45   # 最小相关性分数 (0.0-1.0)
    capabilities:             # 可用能力
      - "execute_code"
      - "file_search"
      - "actions"
      - "tools"
```

### MCP (Model Context Protocol) 服务器

```yaml
# librechat.yaml
mcpSettings:
  allowedDomains:             # 允许的域名（SSRF 保护）
    - 'host.docker.internal'
    - 'localhost'
    - '*.example.com'
    - 'https://secure.api.com'

mcpServers:
  # SSE 服务器
  everything:
    type: sse
    url: http://localhost:3001/sse
    timeout: 60000            # 超时时间 (ms)

  # Stdio 服务器
  puppeteer:
    type: stdio
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-puppeteer"
    timeout: 300000

  filesystem:
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-filesystem"
      - /home/user/LibreChat/
    iconPath: /path/to/icon.svg
```

### Actions (OpenAPI 规范)

```yaml
# librechat.yaml
actions:
  allowedDomains:             # 允许的域名（SSRF 保护）
    - 'swapi.dev'
    - 'api.example.com'
    - 'http://10.0.0.5:8080'  # 内部 IP
```

### 网页搜索

```bash
# .env
# 搜索提供商
GOOGLE_SEARCH_API_KEY=your-key
GOOGLE_CSE_ID=your-cse-id
SERPER_API_KEY=your-serper-key
TAVILY_API_KEY=your-tavily-key
SEARXNG_INSTANCE_URL=http://your-searxng
SEARXNG_API_KEY=your-key

# 内容抓取
FIRECRAWL_API_KEY=your-firecrawl-key
FIRECRAWL_API_URL=https://api.firecrawl.dev

# 重排序
JINA_API_KEY=your-jina-key
JINA_API_URL=https://api.jina.ai/v1/rerank  # 可选
COHERE_API_KEY=your-cohere-key
```

```yaml
# librechat.yaml
webSearch:
  jinaApiKey: '${JINA_API_KEY}'
  jinaApiUrl: '${JINA_API_URL}'
  cohereApiKey: '${COHERE_API_KEY}'
  serperApiKey: '${SERPER_API_KEY}'
  searxngInstanceUrl: '${SEARXNG_INSTANCE_URL}'
  searxngApiKey: '${SEARXNG_API_KEY}'
  firecrawlApiKey: '${FIRECRAWL_API_KEY}'
  firecrawlApiUrl: '${FIRECRAWL_API_URL}'
```

### 语音功能 (TTS/STT)

```yaml
# librechat.yaml
speech:
  tts:                        # Text-to-Speech
    openai:
      url: ''                 # 自定义 URL
      apiKey: '${TTS_API_KEY}'
      model: 'tts-1'
      voices: ['alloy', 'echo', 'fable']

  stt:                        # Speech-to-Text
    openai:
      url: ''
      apiKey: '${STT_API_KEY}'
      model: 'whisper-1'
```

### Memory (用户记忆)

```yaml
# librechat.yaml
memory:
  disabled: false             # 启用记忆功能
  personalize: true           # 启用个性化

  # 限制记忆键名
  validKeys:
    - "preferences"
    - "work_info"
    - "personal_info"
    - "skills"
    - "interests"

  tokenLimit: 10000           # Token 限制

  # 记忆管理 Agent
  agent:
    # 方式一：使用现有 Agent ID
    id: "your-memory-agent-id"

    # 方式二：定义内联 Agent
    # provider: "openai"
    # model: "gpt-4o-mini"
    # instructions: "你是记忆管理助手..."
    # model_parameters:
    #   temperature: 0.1
```

---

## 8. 性能和限制

### 速率限制

```yaml
# librechat.yaml
rateLimits:
  fileUploads:
    ipMax: 100                # IP 最大次数
    ipWindowInMinutes: 60     # IP 时间窗口
    userMax: 50               # 用户最大次数
    userWindowInMinutes: 60   # 用户时间窗口

  conversationsImport:
    ipMax: 100
    ipWindowInMinutes: 60
    userMax: 50
    userWindowInMinutes: 60
```

### 数据库连接池

```bash
# .env
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2
MONGO_MAX_CONNECTING=5
MONGO_MAX_IDLE_TIME_MS=60000
MONGO_WAIT_QUEUE_TIMEOUT_MS=30000
MONGO_AUTO_INDEX=true
MONGO_AUTO_CREATE=true
```

### 缓存和 Redis

```bash
# .env
# Redis 缓存（可选，用于多实例部署）
REDIS_URI=redis://localhost:6379
USE_REDIS=false
```

---

## 🔧 实用配置示例

### 示例1：简单的私有部署

```bash
# .env
ALLOW_REGISTRATION=false      # 禁止注册
ALLOW_SOCIAL_LOGIN=false      # 禁止社交登录
OPENAI_API_KEY=sk-your-key    # 管理员统一 key
HIDE_USER_API_KEY=true        # 隐藏用户 key 输入
```

```yaml
# librechat.yaml
balance:
  enabled: false              # 不启用额度系统
```

### 示例2：企业多用户部署

```bash
# .env
ALLOW_REGISTRATION=true
LDAP_URL=ldap://company-ldap
OPENAI_API_KEY=sk-company-key
```

```yaml
# librechat.yaml
balance:
  enabled: true
  startBalance: 5000000       # 新员工 $5
  autoRefillEnabled: true
  refillIntervalValue: 1
  refillIntervalUnit: 'months'
  refillAmount: 5000000

registration:
  allowedDomains:
    - "company.com"           # 只允许公司邮箱
```

### 示例3：付费 SaaS 服务

```bash
# .env
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=true
GOOGLE_CLIENT_ID=your-id
GITHUB_CLIENT_ID=your-id
```

```yaml
# librechat.yaml
balance:
  enabled: true
  startBalance: 1000000       # 新用户 $1 试用
  autoRefillEnabled: false    # 关闭自动充值，等待 Stripe 集成

interface:
  termsOfService:
    modalAcceptance: true     # 强制同意 TOS
```

---

## 📚 参考资源

- **官方文档**: https://librechat.ai/docs
- **配置指南**: https://librechat.ai/docs/configuration/librechat_yaml
- **环境变量**: https://librechat.ai/docs/configuration/dotenv
- **更新日志**: https://librechat.ai/changelog
- **GitHub**: https://github.com/danny-avila/LibreChat

---

## 💡 配置最佳实践

1. **安全优先**
   - 使用强随机密钥 (`JWT_SECRET`)
   - 生产环境禁用 `DEBUG_LOGGING`
   - 限制注册域名 (`allowedDomains`)
   - 配置 SSRF 保护 (`actions.allowedDomains`)

2. **性能优化**
   - 启用缓存 (`cache: true`)
   - 配置 Redis（多实例部署）
   - 设置合理的速率限制
   - 使用 CDN 托管静态资源

3. **用户体验**
   - 设置友好的欢迎消息
   - 配置隐私政策和服务条款
   - 启用需要的功能，禁用不需要的
   - 使用 Model Specs 简化模型选择

4. **成本控制**
   - 启用额度系统
   - 设置合理的初始余额
   - 记录所有交易
   - 监控 API 使用情况

5. **备份和恢复**
   - 定期备份 MongoDB
   - 备份用户上传的文件
   - 保存 `.env` 和 `librechat.yaml` 配置
