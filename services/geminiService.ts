import { GoogleGenAI, ChatSession, GenerativeModel } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: ChatSession | null = null;
let genAI: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!genAI) {
    if (!process.env.API_KEY) {
        throw new Error("API Key not found");
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const initializeChat = async (history: {role: string, parts: {text: string}[]}[] = []): Promise<ChatSession> => {
    const ai = getClient();
    
    // Using gemini-3-pro-preview for complex legal reasoning capability
    const model = "gemini-3-pro-preview"; 

    chatSession = ai.chats.create({
        model: model,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3, // Lower temperature for more precise/factual legal answers
            tools: [{ googleSearch: {} }] // Enable grounding for case law lookup
        },
        history: history
    });

    return chatSession;
};

export const sendMessageStream = async (
    message: string, 
    onChunk: (text: string, citations?: string[]) => void
): Promise<void> => {
    if (!chatSession) {
        await initializeChat();
    }

    if (!chatSession) {
        throw new Error("Failed to initialize chat session");
    }

    try {
        const result = await chatSession.sendMessageStream({ message });
        
        for await (const chunk of result) {
            const text = chunk.text;
            let citations: string[] = [];

            // Extract grounding chunks if available (URLs)
            if (chunk.candidates && chunk.candidates[0]?.groundingMetadata?.groundingChunks) {
                chunk.candidates[0].groundingMetadata.groundingChunks.forEach((c) => {
                   if (c.web?.uri) {
                       citations.push(c.web.uri);
                   }
                });
            }

            if (text) {
                onChunk(text, citations.length > 0 ? citations : undefined);
            }
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
