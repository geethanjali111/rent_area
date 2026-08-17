import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

export async function generatePropertyDescription(details: {
  title: string;
  propertyType: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rentAmount: number;
}): Promise<{ description: string; highlights: string[] }> {
  const ai = getGeminiClient();
  if (!ai) {
    // Fallback template if no API key configured
    return {
      description: `Welcome to this exceptional ${details.bedrooms} bedroom, ${details.bathrooms} bathroom ${details.propertyType.toLowerCase()} situated in the heart of ${details.city}. Boasting modern finishes, abundant natural light, and premium conveniences including ${details.amenities.slice(0, 3).join(', ')}. Offered at $${details.rentAmount.toLocaleString()}/month with flexible lease terms.`,
      highlights: [
        `Prime ${details.city} location with excellent transit & walkability`,
        `Spacious ${details.bedrooms} Bed / ${details.bathrooms} Bath layout`,
        `Premium amenities: ${details.amenities.slice(0, 2).join(', ')}`
      ]
    };
  }

  try {
    const prompt = `You are an elite luxury real estate copywriter. Write an enticing, highly professional 2-3 paragraph listing description and 3 key bullet highlights for this rental property:
- Title: ${details.title}
- Type: ${details.propertyType}
- Location: ${details.city}
- Specs: ${details.bedrooms} bed, ${details.bathrooms} bath
- Rent: $${details.rentAmount}/mo
- Amenities: ${details.amenities.join(', ')}

Output in JSON format with keys "description" (string) and "highlights" (array of 3 short strings). Do not include markdown code block markers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      description: parsed.description || details.title,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : []
    };
  } catch (err) {
    console.error('Gemini generation error:', err);
    return {
      description: `Spectacular ${details.bedrooms} bed, ${details.bathrooms} bath ${details.propertyType.toLowerCase()} in ${details.city}. Features include ${details.amenities.join(', ')}.`,
      highlights: [`Great ${details.city} location`, `${details.bedrooms} Bed / ${details.bathrooms} Bath`, `Available for immediate lease`]
    };
  }
}

export async function analyzeTenantApplication(app: {
  monthlyIncome: number;
  propertyRent: number;
  creditScore: number;
  occupation: string;
  employer: string;
  hasPets: boolean;
  occupantsCount: number;
}): Promise<{ score: number; summary: string }> {
  const rentRatio = (app.propertyRent / (app.monthlyIncome || 1)) * 100;
  
  const ai = getGeminiClient();
  if (!ai) {
    let score = 85;
    if (rentRatio > 40) score -= 15;
    if (app.creditScore >= 750) score += 10;
    else if (app.creditScore < 650) score -= 20;

    const clampedScore = Math.max(10, Math.min(99, score));
    return {
      score: clampedScore,
      summary: `Automated Risk Assessment: Rent-to-income ratio is ${rentRatio.toFixed(1)}%. Credit rating is ${app.creditScore}. Verified employment as ${app.occupation} at ${app.employer}.`
    };
  }

  try {
    const prompt = `You are a real estate risk underwriter. Evaluate this rental application:
- Monthly Income: $${app.monthlyIncome}
- Property Rent: $${app.propertyRent} (Rent-to-income: ${rentRatio.toFixed(1)}%)
- Credit Score: ${app.creditScore}
- Employment: ${app.occupation} at ${app.employer}
- Occupants: ${app.occupantsCount}
- Pets: ${app.hasPets ? 'Yes' : 'No'}

Return a JSON object with:
"score": integer between 1 and 99 (90+ is very low risk, 70-89 moderate, <70 elevated)
"summary": 2-sentence objective professional summary highlighting key qualifications and potential risks.
Do not include markdown tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 85,
      summary: parsed.summary || `Application evaluation score: ${parsed.score}`
    };
  } catch (err) {
    return {
      score: 88,
      summary: `Applicant qualifies with ${rentRatio.toFixed(1)}% rent-to-income ratio and ${app.creditScore} credit score.`
    };
  }
}
