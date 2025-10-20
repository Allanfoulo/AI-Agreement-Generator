
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

// It is assumed that process.env.API_KEY is configured in the build environment
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.5-flash';

export const generateDocument = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating document:", error);
    if (error instanceof Error) {
        return `<p>Error: ${error.message}</p>`;
    }
    return '<p>An unknown error occurred while communicating with the API.</p>';
  }
};
