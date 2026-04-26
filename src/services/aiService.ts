import { Type } from "@google/genai";
import { ai, MODELS } from "../lib/gemini";
import { Volunteer, MatchSuggestion } from "../types";

export interface MatchResult extends MatchSuggestion {
  volunteer: Volunteer;
}

export async function matchVolunteersWithAI(need: string, volunteers: Volunteer[]): Promise<MatchResult[]> {
  if (!need.trim() || volunteers.length === 0) return [];

  const prompt = `
    SYSTEM: You are a "Medical Resource Matcher" for a community health clinic. 
    Your mission is to connect staffing shortages with high-quality medical volunteers.

    CONTEXT:
    Clinic Need: "${need}"
    
    VOLUNTEER DATABASE:
    ${volunteers.map((v, i) => `[ID:${i}] Name: ${v.name}, Specialty: ${v.specialty}, Location: ${v.location}, Availability: ${v.availability}`).join('\n')}

    TASK:
    1. Rank the volunteers based on:
       - Specialty relevance to the need.
       - Availability matching (e.g., if the need mentions "Saturday", prioritize weekend availability).
       - Geographical proximity if mentioned.
    2. Select the TOP 3 candidates.
    3. Provide a professional, concise reasoning for each.

    OUTPUT:
    Return a JSON array of up to 3 matches.
    JSON Schema:
    {
      "volunteerIndex": number,
      "score": number (0-100),
      "reason": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          maxItems: 3,
          items: {
            type: Type.OBJECT,
            properties: {
              volunteerIndex: { type: Type.INTEGER },
              score: { type: Type.INTEGER },
              reason: { type: Type.STRING }
            },
            required: ["volunteerIndex", "score", "reason"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    return parsed.map((item: any) => ({
      volunteerId: volunteers[item.volunteerIndex].id || String(item.volunteerIndex),
      score: item.score,
      reason: item.reason,
      volunteer: volunteers[item.volunteerIndex]
    }));
  } catch (error) {
    console.error("AI Match Error:", error);
    throw new Error("Failed to generate matches via AI. Please check your API key.");
  }
}
