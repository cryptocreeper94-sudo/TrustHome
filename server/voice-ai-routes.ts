import express, { type Express, type Request, type Response } from "express";
import OpenAI from "openai";
import { ensureCompatibleFormat, speechToText, textToSpeech } from "./replit_integrations/audio/client";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = "You are TrustHome AI, a knowledgeable real estate assistant for Jennifer Lambert's team at Lambert Realty Group. You help with transaction management, lead analysis, market insights, scheduling, mortgage calculations, contract questions, and client communication. You speak in a warm, professional tone. Keep responses concise but thorough — aim for 2-3 paragraphs max. You are powered by the TrustHome platform by DarkWave Studios.";

const voiceBodyParser = express.json({ limit: "50mb" });

export function registerVoiceAiRoutes(app: Express): void {
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const messages: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (history && Array.isArray(history)) {
        for (const msg of history) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: "user", content: message });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages,
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ type: "text", content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: "done", content: fullResponse })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to process chat request" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process chat request" });
      }
    }
  });

  app.post("/api/ai/voice", voiceBodyParser, async (req: Request, res: Response) => {
    try {
      const { audio } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Audio data (base64) is required" });
      }

      console.log("[Voice AI] Received audio, decoding...");
      const rawBuffer = Buffer.from(audio, "base64");
      const { buffer: audioBuffer, format: inputFormat } = await ensureCompatibleFormat(rawBuffer);

      console.log("[Voice AI] Transcribing with OpenAI STT...");
      const transcript = await speechToText(audioBuffer, inputFormat);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`data: ${JSON.stringify({ type: "transcript", content: transcript })}\n\n`);

      console.log("[Voice AI] Getting AI response from OpenAI...");
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        max_completion_tokens: 1024,
      });

      const aiText = aiResponse.choices[0]?.message?.content || "";
      res.write(`data: ${JSON.stringify({ type: "ai_text", content: aiText })}\n\n`);

      console.log("[Voice AI] Generating TTS with OpenAI gpt-audio...");
      try {
        const audioResponse = await textToSpeech(aiText, "nova", "mp3");
        const audioBase64 = audioResponse.toString("base64");
        res.write(`data: ${JSON.stringify({ type: "audio_full", content: audioBase64, format: "mp3" })}\n\n`);
      } catch (ttsErr) {
        console.error("[Voice AI] TTS failed:", ttsErr);
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Voice AI error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to process voice request" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process voice request" });
      }
    }
  });

  app.post("/api/ai/tts", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      console.log("[TTS] Request for", text.length, "chars");

      const audioResponse = await textToSpeech(text, "nova", "mp3");
      const audioBase64 = audioResponse.toString("base64");

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`data: ${JSON.stringify({ type: "audio_full", content: audioBase64, format: "mp3" })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (error) {
      console.error("TTS error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to process TTS request" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process TTS request" });
      }
    }
  });
}
