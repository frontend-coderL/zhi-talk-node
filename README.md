# zhi-talk-node

一个使用 Node.js 调用 DeepSeek API 的流式输出示例项目。

## 项目特点

- ✅ 使用 Node.js 原生代码，无第三方框架依赖
- ✅ 支持 ES Module 语法 (Node.js v22+)
- ✅ 使用 OpenAI 兼容的 SDK 调用 DeepSeek API
- ✅ 实现流式输出，实时显示 AI 回复
- ✅ 完整的错误处理和中文注释
- ✅ 支持单个问题和批量测试模式

## 环境要求

- Node.js v22.0.0 或更高版本
- DeepSeek API 密钥

## 安装和配置

### 1. 克隆项目并安装依赖

```bash
# 安装依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入您的 DeepSeek API 密钥
# DEEPSEEK_API_KEY=your-actual-api-key-here
```

或者直接在命令行中设置：

```bash
export DEEPSEEK_API_KEY="your-actual-api-key-here"
```

### 3. 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/api_keys)
2. 注册账号并登录
3. 创建新的 API 密钥
4. 将密钥配置到环境变量中

## 使用方法

### 基本使用

```bash
# 使用默认问题测试
npm start

# 或者
node src/stream-demo-trae.js
```

### 自定义问题

```bash
# 提问自定义问题
node src/stream-demo-trae.js "请介绍一下机器学习的基本概念"
```

### 批量测试模式

```bash
# 运行批量测试
node src/stream-demo-trae.js --batch
```

## 项目结构

```
zhi-talk-node/
├── src/
│   └── stream-demo-trae.js    # 主程序文件
├── .env.example               # 环境变量示例
├── package.json              # 项目配置
└── README.md                 # 项目说明
```

## 核心功能

### DeepSeekStreamClient 类

- `streamChat(message, model)` - 发送流式聊天请求
- `batchStreamTest(questions)` - 批量测试多个问题

### 主要特性

1. **流式输出**: 实时显示 AI 回复内容，提供更好的用户体验
2. **错误处理**: 完善的错误捕获和提示机制
3. **灵活配置**: 支持自定义模型和参数
4. **批量测试**: 支持一次性测试多个问题

## 示例输出

```
🤖 DeepSeek API 流式输出演示
============================================================
🚀 开始发送请求到 DeepSeek API...

📝 用户消息: 请用中文介绍一下人工智能的发展历史，大概200字左右。

💬 AI 回复:
人工智能的发展历史可以追溯到20世纪50年代...
[实时流式输出内容]

✅ 流式输出完成
📊 完整回复长度: 245 字符
```

## 注意事项

1. 确保 Node.js 版本为 v22.0.0 或更高
2. 请妥善保管您的 DeepSeek API 密钥，不要提交到版本控制系统
3. API 调用可能产生费用，请注意使用量
4. 建议在生产环境中添加更多的错误处理和日志记录

## 故障排除

### 常见问题

1. **环境变量未设置**
   ```
   ❌ 错误: 请设置环境变量 DEEPSEEK_API_KEY
   ```
   解决方案：确保正确设置了 `DEEPSEEK_API_KEY` 环境变量

2. **Node.js 版本过低**
   ```
   npm WARN EBADENGINE Unsupported engine
   ```
   解决方案：升级 Node.js 到 v22.0.0 或更高版本

3. **API 密钥无效**
   ```
   HTTP 状态码: 401
   ```
   解决方案：检查 API 密钥是否正确，是否有足够的配额

## 许可证

MIT License