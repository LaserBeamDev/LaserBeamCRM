
import { GoogleGenAI } from "@google/genai";
import { Transaction, ProductStock } from "../types";

export async function analyzeData(transactions: Transaction[], stocks: ProductStock[], query: string) {
  // Always initialize GoogleGenAI inside the function to use the latest process.env.API_KEY
  let apiKey = '';
  try {
    apiKey = (process?.env?.API_KEY || process?.env?.GEMINI_API_KEY) || '';
  } catch (e) {
    // In some environments process might not be defined
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const context = `
    Eres un asistente experto en negocios para el taller LaserBeam.
    Datos actuales:
    Transacciones recientes: ${JSON.stringify(transactions.slice(-20))}
    Stock actual: ${JSON.stringify(stocks)}
    
    Reglas:
    - Sé conciso y profesional.
    - Responde en español.
    - Ayuda con análisis de ventas, alertas de stock bajo y tendencias.
  `;

  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning tasks like business data analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Contexto: ${context}\nPregunta del usuario: ${query}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, no pude procesar tu solicitud en este momento.";
  }
}
