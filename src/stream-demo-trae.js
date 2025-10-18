import OpenAI from "openai";
import dotenv from "dotenv";

// 加载 .env 文件中的环境变量
dotenv.config();

// DeepSeek API 配置常量
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

/**
 * DeepSeek API 流式聊天客户端
 * 使用 OpenAI 兼容的接口调用 DeepSeek API
 */
class DeepSeekStreamClient {
  constructor() {
    // 初始化 OpenAI 客户端，配置为使用 DeepSeek API
    this.client = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
    });
  }

  /**
   * 发送流式聊天请求
   * @param {string} message - 用户输入的消息
   * @param {string} model - 使用的模型名称，默认为 deepseek-chat
   * @returns {Promise<void>}
   */
  async streamChat(message, model = "deepseek-chat") {
    try {
      console.log("🚀 开始发送请求到 DeepSeek API...\n");
      console.log(`📝 用户消息: ${message}\n`);
      console.log("💬 AI 回复:");

      // 创建流式聊天完成请求
      const stream = await this.client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: true, // 启用流式输出
        max_tokens: 1000,
        temperature: 0.7,
      });

      // 处理流式响应
      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          process.stdout.write(content); // 实时输出内容
          fullResponse += content;
        }
      }

      console.log("\n\n✅ 流式输出完成");
      console.log(`📊 完整回复长度: ${fullResponse.length} 字符`);
    } catch (error) {
      console.error("❌ 请求失败:", error.message);

      // 详细错误信息处理
      if (error.status) {
        console.error(`HTTP 状态码: ${error.status}`);
      }
      if (error.code) {
        console.error(`错误代码: ${error.code}`);
      }
    }
  }

  /**
   * 批量测试多个问题的流式输出
   * @param {string[]} questions - 问题数组
   */
  async batchStreamTest(questions) {
    console.log(`🔄 开始批量测试 ${questions.length} 个问题...\n`);

    for (let i = 0; i < questions.length; i++) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`📋 测试 ${i + 1}/${questions.length}`);
      console.log(`${"=".repeat(50)}`);

      await this.streamChat(questions[i]);

      // 在问题之间添加延迟，避免请求过于频繁
      if (i < questions.length - 1) {
        console.log("\n⏳ 等待 2 秒后继续下一个问题...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("\n🎉 批量测试完成！");
  }
}

/**
 * 主函数 - 程序入口点
 */
async function main() {
  // 检查环境变量
  if (!DEEPSEEK_API_KEY) {
    console.error("❌ 错误: 请设置环境变量 DEEPSEEK_API_KEY");
    process.exit(1);
  }

  // 创建 DeepSeek 客户端实例
  const deepseekClient = new DeepSeekStreamClient();

  // 从命令行参数获取用户输入，或使用默认问题
  const userMessage = process.argv[2] || "请用中文介绍一下人工智能的发展历史，大概200字左右。";

  console.log("🤖 DeepSeek API 流式输出演示");
  console.log("=".repeat(60));

  // 单个问题测试
  await deepseekClient.streamChat(userMessage);

  // 可选：批量测试多个问题
  const shouldRunBatchTest = process.argv.includes("--batch");
  if (shouldRunBatchTest) {
    const testQuestions = ["什么是机器学习？", "请解释一下深度学习的基本概念。", "人工智能在医疗领域有哪些应用？"];

    await deepseekClient.batchStreamTest(testQuestions);
  }
}

// 错误处理
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ 未处理的 Promise 拒绝:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ 未捕获的异常:", error);
  process.exit(1);
});

// 运行主函数
main().catch(console.error);
