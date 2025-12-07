import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Role } from "../types";

// Initialize the API client
// Ensure process.env.API_KEY is available in your environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We keep a persistent chat session in memory for the lifecycle of the service
let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful, concise, and friendly AI assistant. You format your responses with clean Markdown when appropriate.",
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (
  text: string,
  onChunk: (chunkText: string) => void
): Promise<void> => {
  const chat = getChatSession();

  try {
    const resultStream = await chat.sendMessageStream({ message: text });

    for await (const chunk of resultStream) {
      const responseChunk = chunk as GenerateContentResponse;
      if (responseChunk.text) {
        onChunk(responseChunk.text);
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};
