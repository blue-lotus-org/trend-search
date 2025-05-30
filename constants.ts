
export const TOP_TRENDS_PROMPT = `Provide current popular internet search trends categorized by region.
Regions: US, Canada, EU, Asia, Worldwide.
For each region, list up to 3-5 concise trends.
Format the output as a JSON object like this:
{
  "US": ["Trend US 1", "Trend US 2", "Trend US 3"],
  "Canada": ["Trend CA 1", "Trend CA 2", "Trend CA 3"],
  "EU": ["Trend EU 1", "Trend EU 2", "Trend EU 3"],
  "Asia": ["Trend ASIA 1", "Trend ASIA 2", "Trend ASIA 3"],
  "Worldwide": ["Trend WW 1", "Trend WW 2", "Trend WW 3"]
}
Only output the JSON object. Ensure each trend is a string.`;

export const SEARCH_TREND_DETAIL_PROMPT_PREFIX = "Tell me more about the internet trend: ";
export const GEMINI_MODEL_TEXT_GENERATION = "gemini-2.5-flash-preview-04-17";