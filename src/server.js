import http from "http";
import url from "url";
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE_URL = "https://api.deepseek.com";

/**
 * 创建 OpenAI 客户端，配置为使用 DeepSeek API
 */
const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_API_BASE_URL,
});

/**
 * 处理静态文件请求
 * @param {string} filePath - 文件路径
 * @param {http.ServerResponse} res - HTTP 响应对象
 */
function serveStaticFile(filePath, res) {
  const fullPath = path.join(process.cwd(), 'src', filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('文件未找到');
      return;
    }
    
    const ext = path.extname(fullPath);
    let contentType = 'text/plain';
    
    switch (ext) {
      case '.html':
        contentType = 'text/html; charset=utf-8';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * 解析请求体 JSON 数据
 * @param {http.IncomingMessage} req - HTTP 请求对象
 * @returns {Promise<Object>} 解析后的 JSON 对象
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * 处理 /api/chat 接口
 * @param {http.IncomingMessage} req - HTTP 请求对象
 * @param {http.ServerResponse} res - HTTP 响应对象
 */
async function handleChatAPI(req, res) {
  try {
    // 解析请求体获取消息内容
    const { message } = await parseRequestBody(req);

    // 设置 SSE 响应头
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    // 调用 DeepSeek API 获取流式响应
    const stream = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: message }],
      stream: true,
    });

    // 处理流式数据并通过 SSE 发送给客户端
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        // 发送 SSE 格式的数据
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 发送结束标志
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error("处理聊天请求时发生错误:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "服务器内部错误" }));
  }
}

/**
 * 处理 CORS 预检请求
 * @param {http.ServerResponse} res - HTTP 响应对象
 */
function handleCORS(res) {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

/**
 * 创建 HTTP 服务器
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const { method } = req;

  // 处理 CORS 预检请求
  if (method === "OPTIONS") {
    handleCORS(res);
    return;
  }

  // 处理根路径，返回聊天页面
  if (pathname === '/' || pathname === '/chat') {
    serveStaticFile('chat.html', res);
    return;
  }

  // 处理 /api/chat 接口
  if (pathname === "/api/chat" && method === "POST") {
    await handleChatAPI(req, res);
    return;
  }

  // 处理其他请求
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "接口不存在" }));
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`聊天接口: POST http://localhost:${PORT}/api/chat`);
});
