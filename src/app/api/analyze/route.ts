import { NextResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

import { mockAIAnalysis } from '@/data/mockAIResult';

// Initialize the Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { disruption, supplierDetails, companyProfile } = body;

    if (!disruption || !supplierDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: disruption or supplierDetails' },
        { status: 400 }
      );
    }

    const prompt = `
      You are the reasoning engine for SupplySense, an Autonomous Supply Chain Resilience Agent for a Tier-2 EV Parts Manufacturer.
      
      Company Profile:
      ${JSON.stringify(companyProfile, null, 2)}
      
      Current Disruption Event:
      ${JSON.stringify(disruption, null, 2)}
      
      Impacted Supplier Details:
      ${JSON.stringify(supplierDetails, null, 2)}
      
      Task:
      Analyze this disruption and generate exactly 3 distinct mitigation strategies. 
      For each strategy, you must evaluate the trade-offs between Cost, Service Level (SLA adherence to OEMs), and Resilience.
      
      Output your response ONLY as valid JSON matching this schema:
      {
        "analysisSummary": "A 2-3 sentence executive summary of the risk.",
        "strategies": [
          {
            "id": "strategy_1",
            "name": "Short descriptive name",
            "description": "Detailed explanation of the action to take",
            "tradeoffs": {
              "costImpact": "High/Medium/Low - with brief explanation",
              "serviceLevelImpact": "High/Medium/Low - with brief explanation",
              "resilienceImpact": "High/Medium/Low - with brief explanation"
            },
            "suggestedActions": ["Action 1", "Action 2"]
          }
        ]
      }
    `;

    // Fallback to mock data if no API key is present
    if (!ai) {
      console.warn('GEMINI_API_KEY is missing. Falling back to mock data for demo purposes.');
      return NextResponse.json(mockAIAnalysis);
    }

    // Call Gemini 2.5 Flash for fast reasoning
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.2,
            responseMimeType: "application/json",
        }
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response.");
    }
    
    // Parse the JSON response
    const analysisResult = JSON.parse(response.text);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze disruption' },
      { status: 500 }
    );
  }
}
