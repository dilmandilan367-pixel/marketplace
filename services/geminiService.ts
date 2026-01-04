
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generateProjectPitch(projectName: string, description: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, persuasive sales pitch (max 2 sentences) for a project called "${projectName}". Description: ${description}`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "This high-quality project is exactly what your workflow needs. Buy now to get full access!";
  }
}

export async function suggestPrice(projectName: string, features: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a marketplace expert, suggest a competitive price in USD for a project named "${projectName}" with these features: ${features.join(', ')}. Return only the number.`,
    });
    const priceText = response.text.match(/\d+(\.\d+)?/);
    return priceText ? parseFloat(priceText[0]) : 49.99;
  } catch (error) {
    return 49.99;
  }
}
