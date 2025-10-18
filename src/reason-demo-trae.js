import OpenAI from "openai";
import dotenv from "dotenv";

// 加载 .env 文件中的环境变量
dotenv.config();

// DeepSeek API 配置常量
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

/**
 * DeepSeek Reasoner 流式推理客户端
 * 使用 deepseek-reasoner 模型进行推理，支持 reason 和 content 分别输出
 */
class DeepSeekReasonerClient {
  constructor() {
    // 初始化 OpenAI 客户端，配置为使用 DeepSeek API
    this.client = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
    });
  }

  /**
   * 发送推理请求并流式输出 reason 和 content
   * @param {string} question - 用户提出的问题
   * @returns {Promise<void>}
   */
  async streamReasoning(question) {
    try {
      console.log("🧠 开始使用 DeepSeek Reasoner 模型进行推理...\n");
      console.log(`❓ 问题: ${question}\n`);

      // 创建流式推理请求
      const stream = await this.client.chat.completions.create({
        model: "deepseek-reasoner",
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      });

      // 用于存储推理内容和最终回答
      let reasoningContent = "";
      let finalContent = "";

      // 用于标记是否已经显示过标题（避免重复显示）
      let reasoningTitleShown = false;
      let contentTitleShown = false;

      // 处理流式响应
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        // 处理推理内容
        if (delta?.reasoning_content) {
          if (!reasoningTitleShown) {
            console.log("🔍 推理过程 (Reasoning):");
            console.log("─".repeat(60));
            reasoningTitleShown = true;
          }
          process.stdout.write(delta.reasoning_content);
          reasoningContent += delta.reasoning_content;
        }

        // 处理最终回答
        if (delta?.content) {
          if (!contentTitleShown) {
            if (reasoningTitleShown) {
              console.log("\n\n" + "═".repeat(60));
            }
            console.log("💡 最终回答 (Content):");
            console.log("─".repeat(60));
            contentTitleShown = true;
          }
          process.stdout.write(delta.content);
          finalContent += delta.content;
        }
      }

      // 输出统计信息
      console.log("\n\n" + "═".repeat(60));
      console.log("📊 输出统计:");
      console.log(`🔍 推理内容长度: ${reasoningContent.length} 字符`);
      console.log(`💡 最终回答长度: ${finalContent.length} 字符`);
      console.log(`📝 总内容长度: ${reasoningContent.length + finalContent.length} 字符`);
      console.log("✅ 推理完成！");
    } catch (error) {
      console.error("❌ 推理请求失败:", error.message);

      // 详细错误信息处理
      if (error.status) {
        console.error(`HTTP 状态码: ${error.status}`);
      }
      if (error.code) {
        console.error(`错误代码: ${error.code}`);
      }
      if (error.type) {
        console.error(`错误类型: ${error.type}`);
      }
    }
  }

  /**
   * 批量推理测试
   * @param {string[]} questions - 问题数组
   */
  async batchReasoningTest(questions) {
    console.log(`🔄 开始批量推理测试 ${questions.length} 个问题...\n`);

    for (let i = 0; i < questions.length; i++) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`📋 推理测试 ${i + 1}/${questions.length}`);
      console.log(`${"=".repeat(80)}`);

      await this.streamReasoning(questions[i]);

      // 在问题之间添加延迟，避免请求过于频繁
      if (i < questions.length - 1) {
        console.log("\n⏳ 等待 3 秒后继续下一个问题...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log("\n🎉 批量推理测试完成！");
  }
}

/**
 * 主函数 - 程序入口点
 */
async function main() {
  // 检查环境变量
  if (!DEEPSEEK_API_KEY) {
    console.error("❌ 错误: 请设置环境变量 DEEPSEEK_API_KEY");
    console.log('💡 使用方法: export DEEPSEEK_API_KEY="your-api-key-here"');
    process.exit(1);
  }

  // 创建 DeepSeek Reasoner 客户端实例
  const reasonerClient = new DeepSeekReasonerClient();

  // 从命令行参数获取用户输入，或使用默认问题
  const userQuestion = process.argv[2] || "天空为什么是蓝色的";

  console.log("🤖 DeepSeek Reasoner 推理演示");
  console.log("=".repeat(80));

  // 单个问题推理
  await reasonerClient.streamReasoning(userQuestion);

  // 可选：批量测试多个问题
  const shouldRunBatchTest = process.argv.includes("--batch");
  if (shouldRunBatchTest) {
    const testQuestions = ["为什么水会结冰？", "地球为什么会自转？", "人类为什么需要睡眠？", "为什么植物是绿色的？"];

    await reasonerClient.batchReasoningTest(testQuestions);
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
