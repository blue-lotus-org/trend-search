
export interface Trend {
  id: string;
  title: string;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: GroundingChunkWeb;
}

export interface SearchResult {
  text: string;
  sources: GroundingChunk[];
}

export interface GeminiServiceError {
  message: string;
}

export type TrendCategoryKey = "US" | "Canada" | "EU" | "Asia" | "Worldwide";

export type CategorizedTrends = {
  [K in TrendCategoryKey]?: string[];
};
