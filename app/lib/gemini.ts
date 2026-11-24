import { GoogleGenAI } from "@google/genai";
import { buildUserPrompt, SYSTEM_PROMPT, type PromptInput } from "./prompts";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const API_KEY = process.env.GEMINI_API;

const ai = new GoogleGenAI({
    apiKey:API_KEY
})

const COST_CAP = { input: 0.30, output: 2.50 }

export async function generateSVG(input:PromptInput) {
    const prompt = buildUserPrompt(input);
    const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.3
        }
    })
    const usage = res.usageMetadata;
    const inputTokens = usage?.promptTokenCount ? usage.promptTokenCount : 0;
    const outputTokens = usage?.totalTokenCount ? (usage.totalTokenCount - inputTokens) : 0;

    return {
        svg: res.text?.match(/<svg[\s\S]*<\/svg>/)?.[0] ?? "",
        model: MODEL,
        inputTokens,
        outputTokens,
        costUsd: (inputTokens! * COST_CAP.input + outputTokens * COST_CAP.output) / 1000000,
      };

}

