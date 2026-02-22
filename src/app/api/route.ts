import { NextResponse } from "next/server";
import ZAI from 'z-ai-web-dev-sdk';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  maxTokens?: number;
}

// Use Node.js runtime for better compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// System prompt
const SYSTEM_PROMPT = 'You are a helpful AI assistant named Doh Doh Ai. Provide clear, accurate, and helpful responses.';

// Fallback models in order of reliability
const FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct',
  'qwen/qwen3-coder-480b-a35b',
  'deepseek/deepseek-r1-0528',
  'google/gemma-3-27b'
];

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model, maxTokens } = body;

    console.log("[API] Request:", { model, msgCount: messages?.length, maxTokens });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: "Model required" }, { status: 400 });
    }

    // Create ZAI instance
    const zai = await ZAI.create();

    // Format messages
    const formattedMessages: Array<{role: 'user' | 'assistant', content: string}> = [
      { role: 'user', content: SYSTEM_PROMPT },
      { role: 'assistant', content: 'Understood! I am Doh Doh Ai, ready to help.' }
    ];
    
    for (const m of messages) {
      formattedMessages.push({
        role: m.role as 'user' | 'assistant',
        content: m.content
      });
    }

    // Build request params
    const buildRequest = (modelName: string) => {
      const params: Record<string, unknown> = {
        messages: formattedMessages,
        model: modelName,
        temperature: 0.7
      };
      if (maxTokens && maxTokens > 0 && maxTokens <= 128000) {
        params.max_tokens = Math.min(maxTokens, 32000);
      }
      return params;
    };

    // Try primary model with retries, then fallbacks
    const modelsToTry = [model, ...FALLBACK_MODELS.filter(m => m !== model)];
    let lastError: string = "Unknown error";
    
    for (const currentModel of modelsToTry) {
      // Try each model up to 2 times
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          console.log(`[API] Trying: ${currentModel} (attempt ${attempt + 1})`);
          
          if (attempt > 0) {
            await sleep(1000 * attempt); // Wait before retry
          }
          
          const completion = await zai.chat.completions.create(buildRequest(currentModel) as any);
          const content = completion.choices[0]?.message?.content || "";
          
          if (content) {
            console.log(`[API] Success with: ${currentModel}`);
            return NextResponse.json({
              success: true,
              content: content,
              model: currentModel,
              usage: completion.usage
            });
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.log(`[API] ${currentModel} failed: ${errMsg}`);
          lastError = errMsg;
        }
      }
    }
    
    // All models failed
    return NextResponse.json({ 
      error: "Service temporarily unavailable. Please try again.",
      success: false 
    }, { status: 503 });

  } catch (error: unknown) {
    console.error("[API] Error:", error);
    
    let errorMessage = "An error occurred. Please try again.";
    
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("fetch failed") || msg.includes("econnrefused") || msg.includes("enotfound")) {
        errorMessage = "Connection failed. Please check your network.";
      } else if (msg.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (msg.includes("rate limit")) {
        errorMessage = "Too many requests. Please wait and try again.";
      } else {
        // Clean error message
        errorMessage = error.message
          .replace(/API request failed with status \d+:\s*/i, '')
          .replace(/\{[^}]*"message"\s*:\s*"([^"]*)"[^}]*\}/gi, '$1')
          .trim() || "Request failed. Please try again.";
      }
    }
    
    return NextResponse.json({ error: errorMessage, success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const zai = await ZAI.create();
    return NextResponse.json({ 
      message: "Doh Doh Ai API",
      version: "2.5.0",
      features: ["chat", "multi-model", "auto-fallback", "retry"],
      status: "healthy"
    });
  } catch (error) {
    return NextResponse.json({ 
      message: "API running but SDK error",
      status: "degraded"
    });
  }
}
