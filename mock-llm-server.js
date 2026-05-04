import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const MOCK_RESPONSES = {
  "gpt-4o": (prompt) => `DEMO MODE - This is a simulated response for demonstration purposes. Your prompt "${prompt.slice(0, 50)}..." was processed safely without any API costs. In production, this would call OpenAI's GPT-4o with your encrypted API key.`,
  "gpt-4o-mini": (prompt) => `DEMO MODE - Simulated GPT-4o mini response for: "${prompt.slice(0, 40)}...". Safe BYOK workflow demonstrated.`,
  "claude-sonnet": (prompt) => `DEMO MODE - Claude Sonnet response (simulated): "${prompt.slice(0, 50)}...". Your API key remains encrypted and secure.`,
  "claude-haiku": (prompt) => `DEMO MODE - Claude Haiku fast response for: "${prompt.slice(0, 40)}...". Zero-cost testing demonstrated.`,
  "llama3": (prompt) => `DEMO MODE - Llama 3 response (local/Ollama simulation): "${prompt.slice(0, 50)}...". BYOK works with self-hosted models too.`,
  "default": (prompt) => `DEMO MODE - LLM response simulated for: "${prompt.slice(0, 50)}...". Your keys stay encrypted. No data leaves your workspace.`,
};

function generateResponse(model, prompt) {
  const handler = MOCK_RESPONSES[model] || MOCK_RESPONSES["default"];
  return handler(prompt);
}

app.post("/v1/chat/completions", (req, res) => {
  const { model, messages, temperature = 0.7, max_tokens = 2048 } = req.body;

  if (!model || !messages) {
    return res.status(400).json({
      error: {
        message: "Missing required fields: model and messages",
        type: "invalid_request_error",
        code: "missing_required_fields"
      }
    });
  }

  const lastMessage = messages[messages.length - 1];
  const userPrompt = typeof lastMessage === 'object' ? lastMessage.content : lastMessage;

  console.log(`[MOCK LLM] ${model} | temp: ${temperature} | max_tokens: ${max_tokens} | prompt: "${userPrompt.slice(0, 30)}..."`);

  const responseContent = generateResponse(model, userPrompt);

  // Simulate realistic latency
  const latency = 300 + Math.random() * 800;
  setTimeout(() => {
    res.json({
      id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: responseContent
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: Math.floor(userPrompt.length / 4),
        completion_tokens: Math.floor(responseContent.length / 4),
        total_tokens: Math.floor(userPrompt.length / 4) + Math.floor(responseContent.length / 4)
      },
      _meta: {
        mock: true,
        latency_ms: Math.round(latency),
        demo: true
      }
    });
  }, latency);
});

app.get("/v1/models", (req, res) => {
  res.json({
    object: "list",
    data: [
      { id: "gpt-4o", object: "model", created: 1700000000, owned_by: "openai" },
      { id: "gpt-4o-mini", object: "model", created: 1700000000, owned_by: "openai" },
      { id: "claude-sonnet", object: "model", created: 1700000000, owned_by: "anthropic" },
      { id: "claude-haiku", object: "model", created: 1700000000, owned_by: "anthropic" },
      { id: "llama3", object: "model", created: 1700000000, owned_by: "ollama" },
    ]
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", mock: true, demo: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[MOCK LLM] Server running on port ${PORT}`);
  console.log(`[MOCK LLM] Endpoints:`);
  console.log(`  POST /v1/chat/completions`);
  console.log(`  GET  /v1/models`);
  console.log(`  GET  /health`);
  console.log(`[MOCK LLM] Ready for demo!`);
});
