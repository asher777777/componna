# Google AI Studio / Gemini API Reference Guide (2026 Edition)

This reference documents the official Google AI Studio REST endpoints, valid models, request/response formats, deprecation dates, and best practices.

---

## 1. REST Endpoints & Authentication

### Base URL
```
https://generativelanguage.googleapis.com/v1beta
```

### Authentication
Pass API key either as query parameter or HTTP header:
- **Query Parameter**: `?key={API_KEY}`
- **HTTP Header (Recommended)**: `x-goog-api-key: {API_KEY}`

### Primary Methods
1. **Generate Content**:
   `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}`
2. **Stream Generate Content**:
   `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={API_KEY}`
3. **List Available Models**:
   `GET https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}`
4. **Get Model Metadata**:
   `GET https://generativelanguage.googleapis.com/v1beta/models/{model}?key={API_KEY}`
5. **Count Tokens**:
   `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:countTokens?key={API_KEY}`

---

## 2. Official Model Catalog & Status (2026)

| Model Identifier | Tier / Category | Status | Context Window | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`gemini-3.8-flash`** | Frontier Flash | **GA (Primary Workhorse)** | 1,048,576 tokens | Coding, Agentic tool use, complex workflows, low latency |
| **`gemini-3.8-flash-lite`** | Efficient Flash | **GA** | 1,048,576 tokens | High-throughput subagents, batch classification |
| **`gemini-3.5-flash`** | Balanced Flash | **GA (Workhorse)** | 1,048,576 tokens | Production reasoning, multi-turn chat, fallback |
| **`gemini-3.5-flash-lite`** | Budget Flash | **GA** | 1,048,576 tokens | Document parsing, high-speed lightweight jobs |
| **`gemini-3.1-pro`** | Reasoning Pro | **GA (Flagship Reasoning)** | 1,048,576 tokens | Complex math, multi-step problem solving, synthesis |
| **`gemini-3-flash-preview`** | Frontier Flash Preview | **Preview** | 1,048,576 tokens | Experimental agentic / computer-use features |
| **`gemini-3.8-flash-tts`** | Speech / Audio | **GA** | - | Expressive voice synthesis / Acting audio |
| **`gemini-3.1-flash-image`** | Image Generation | **GA** | - | Multimodal image generation |
| **`veo-3.1-generate-preview`**| Video Generation | **Preview** | - | High-definition AI video synthesis |
| `gemini-2.5-flash` | Legacy Flash | **Restricted / Legacy** | 1,048,576 tokens | Available only for existing users; fallback |
| `gemini-2.5-pro` | Legacy Pro | **Restricted / Legacy** | 1,048,576 tokens | Legacy reasoning; migrate to 3.1 Pro |
| `gemini-2.0-flash` | **DEPRECATED** | **SHUT DOWN (June 1, 2026)** | - | **DO NOT USE (Yields 404/410)** |
| `gemini-1.5-flash` | **DEPRECATED** | **SHUT DOWN (Sept 24, 2025)**| - | **DO NOT USE (Yields 404/410)** |
| `gemini-3.6-flash` | **FICTIONAL** | **NEVER EXISTED** | - | **HALLUCINATION (Yields 404)** |

---

## 3. Request Payload Specification

### Standard Multi-turn / Single-turn Request with System Instruction
```json
{
  "systemInstruction": {
    "parts": [
      {
        "text": "You are a brand marketing assistant. Output Hebrew responses in RTL format."
      }
    ]
  },
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Summarize this campaign brief."
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.95,
    "maxOutputTokens": 4096
  }
}
```

### Structured Output (Strict JSON Enforced)
When forcing the model to return a strict JSON schema without markdown backticks:
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Extract company metadata from the text: ..." }]
    }
  ],
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "OBJECT",
      "properties": {
        "companyName": { "type": "STRING" },
        "slogan": { "type": "STRING" },
        "primaryColor": { "type": "STRING" },
        "tags": {
          "type": "ARRAY",
          "items": { "type": "STRING" }
        }
      },
      "required": ["companyName", "slogan"]
    }
  }
}
```

---

## 4. Response Payload & Token Usage Parsing

A typical response from `:generateContent`:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "..."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 350,
    "candidatesTokenCount": 120,
    "totalTokenCount": 470
  }
}
```

### Safety & Finish Reasons
- `STOP`: Natural completion.
- `MAX_TOKENS`: Hit `maxOutputTokens`.
- `SAFETY`: Blocked by safety filters.
- `RECITATION`: Blocked due to exact copyright match.
