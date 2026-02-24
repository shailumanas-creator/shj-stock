
import { GoogleGenAI } from "@google/genai";
import { Combo, GroundingSource } from "./types";

export const analyzeCombo = async (combo: Combo): Promise<{ text: string; sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Based on the following Indian stock market screening strategy: "${combo.name}", 
    Fundamental Criteria: ${combo.fundamentals.join(', ')}.
    Technical Criteria: ${combo.technicals.join(', ')}.
    
    TASK:
    1. Identify 5-10 Indian stocks that currently (or recently) match these criteria using the most recent market data (2024-2025).
    2. Present the results in a CLEAR MARKDOWN TABLE.
    3. The table MUST contain exactly these columns in this order:
       | Stock Name | LTP | 52-Week High | 50-Day MA | SWOT Strength | Market Cap | Industry/Sector | Current Volume |
    4. Provide a brief 1-2 sentence bull case for each stock below the table.
    5. Use Google Search grounding to ensure you reference real-time/recent market performance.
    6. Include relevant NSE/BSE links for the mentioned stocks in the sources.
    7. HIGHLIGHTING: If a stock's LTP is within 3% of its 52-Week High, prepend a "⭐" to the Stock Name and BOLD the entire row in the markdown table (e.g., | **⭐ [Reliance](...)** | **₹2950** | ... |).
    8. TRADINGVIEW LINKS: The "Stock Name" in the table MUST be a clickable markdown link pointing to its TradingView chart (e.g., [Reliance](https://www.tradingview.com/symbols/NSE-RELIANCE/)).

    Formatting Requirements:
    - SWOT Strength: Refine this field to include BOTH the strongest fundamental indicator (e.g., "Zero Debt" or "High ROE") AND the strongest technical indicator (e.g., "52W Breakout" or "SMA Golden Cross") contributing to the stock's bullish outlook. Combine them concisely (e.g., "Zero Debt + 52W Breakout").
    - LTP, 52-Week High, 50-Day MA: Current prices with "₹" symbol.
    - Volume: Mention in Lakhs or Crores for clarity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No analysis available at this moment.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error fetching analysis. Please check your internet or try again later.", sources: [] };
  }
};
