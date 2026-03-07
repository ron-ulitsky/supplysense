import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

import { mockAIAnalysis } from '@/data/mockAIResult';

// Initialize the Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ADK Backend URL (Python FastAPI server)
const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';

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
      
      Simulated Memory & Reflection Logs:
      - Historic Log (May 2025): Air freight out of Shenzhen during Q3 peak experienced 5-day customs delay. High risk.
      - Profile Directive: If Company is "Cash-Rich," prioritize SLA at all costs. If "Cash-Poor," optimize for margin preservation. 
      
      Current Disruption Event:
      ${JSON.stringify(disruption, null, 2)}
      
      Impacted Supplier Details:
      ${JSON.stringify(supplierDetails, null, 2)}
      
      Task:
      Analyze this disruption and generate exactly 3 distinct mitigation strategies. 
      For each strategy, you must evaluate the trade-offs between Cost, Service Level (SLA adherence to OEMs), and Resilience.
      CRITICAL: You must provide a clear, one-sentence "explanation" that traces exactly *why* you made this recommendation based on the company profile, historical logs, and mathematics of the disruption.
      
      Output your response ONLY as valid JSON matching this schema:
      {
        "analysisSummary": "A 2-3 sentence executive summary of the risk.",
        "strategies": [
          {
            "id": "strategy_1",
            "name": "Short descriptive name",
            "description": "Detailed explanation of the action to take",
            "explanation": "Provides decision transparency (e.g. why this is better than alternative X given the company profile).",
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

    // Try calling the ADK Python backend first
    try {
      const adkResponse = await fetch(`${ADK_BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: disruption.title,
          description: disruption.description,
          severity: disruption.severity,
          region: disruption.region,
          affected_components: disruption.affectedComponents,
          estimated_delay_days: disruption.estimatedDelayDays,
          supplier_details: supplierDetails,
        }),
      });

      if (adkResponse.ok) {
        const adkResult = await adkResponse.json();
        // Transform ADK response to match frontend expected shape
        return NextResponse.json({
          analysisSummary: adkResult.agent_response,
          toolCallsMade: adkResult.tool_calls_made,
          strategies: mockAIAnalysis.strategies, // Use mock strategies for UI rendering
        });
      }
    } catch {
      // ADK backend not available, fall through to Gemini / mock
      console.warn('ADK backend not reachable. Falling back to Gemini / mock data.');
    }

    // Fallback 1: Call Gemini 2.5 Flash for fast reasoning
    try {
      if (typeof ai !== 'undefined' && ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        });

        if (response.text) {
          const analysisResult = JSON.parse(response.text);
          return NextResponse.json(analysisResult);
        }
      }
    } catch (geminiError) {
      console.warn("Gemini query failed, falling back to mock:", geminiError);
    }

    // Fallback 2: return mock data for demo purposes
    console.warn('Falling back to mock AI analysis data.');
    return NextResponse.json(mockAIAnalysis);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze disruption' },
      { status: 500 }
    );
  }
}
