
import { GoogleGenAI, GenerateContentResponse, Candidate } from "@google/genai";
import { GEMINI_MODEL_TEXT_GENERATION, TOP_TRENDS_PROMPT } from '../constants';
import { SearchResult, GroundingChunk, GeminiServiceError, CategorizedTrends, TrendCategoryKey } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const isValidCategorizedTrends = (data: any): data is CategorizedTrends => {
  if (typeof data !== 'object' || data === null) return false;
  const validKeys: TrendCategoryKey[] = ["US", "Canada", "EU", "Asia", "Worldwide"];
  for (const key of validKeys) {
    if (data.hasOwnProperty(key)) {
      if (!Array.isArray(data[key]) || !data[key].every((item: any) => typeof item === 'string')) {
        // Allow empty array for a category
        if (Array.isArray(data[key]) && data[key].length === 0) continue;
        return false;
      }
    }
    // It's okay if a category is missing, it will be treated as empty.
  }
  // Check if there are any unexpected keys, though the prompt should prevent this.
  // For simplicity here, we trust the prompt delivers only the specified keys or a subset.
  return true;
};


export const fetchSearchResults = async (query: string): Promise<SearchResult | GeminiServiceError> => {
  if (!ai) {
    return { message: "Gemini AI Service is not initialized. Check API Key." };
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT_GENERATION,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const candidate: Candidate | undefined = response.candidates?.[0];
    const sources: GroundingChunk[] = candidate?.groundingMetadata?.groundingChunks?.filter(
        (chunk): chunk is GroundingChunk => chunk && typeof chunk === 'object' && 'web' in chunk && chunk.web !== null && chunk.web !== undefined
      ) || [];

    return { text, sources };
  } catch (error) {
    console.error("Error fetching search results:", error);
    if (error instanceof Error) {
      return { message: `Failed to fetch search results: ${error.message}` };
    }
    return { message: "An unknown error occurred while fetching search results." };
  }
};

export const fetchTopTrends = async (): Promise<CategorizedTrends | GeminiServiceError> => {
  if (!ai) {
    return { message: "Gemini AI Service is not initialized. Check API Key." };
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT_GENERATION,
      contents: TOP_TRENDS_PROMPT,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (isValidCategorizedTrends(parsedData)) {
        // Ensure all categories are present, even if empty, for consistent UI rendering
        const allCategories: TrendCategoryKey[] = ["US", "Canada", "EU", "Asia", "Worldwide"];
        const completeCategorizedTrends: CategorizedTrends = {};
        allCategories.forEach(catKey => {
          completeCategorizedTrends[catKey] = parsedData[catKey] || [];
        });
        return completeCategorizedTrends;
      } else {
        console.error("Parsed trend data is not in the expected format:", parsedData);
        return { message: "Failed to parse categorized trends: Invalid data structure."};
      }
    } catch (e) {
      console.error("Failed to parse JSON response for trends:", e, "Raw string:", jsonStr);
      return { message: `Failed to parse categorized trends data from AI. ${ (e as Error).message }` };
    }

  } catch (error) {
    console.error("Error fetching top trends:", error);
     if (error instanceof Error) {
      return { message: `Failed to fetch top trends: ${error.message}` };
    }
    return { message: "An unknown error occurred while fetching top trends." };
  }
};
