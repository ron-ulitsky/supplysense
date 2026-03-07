import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

import { mockAIAnalysis } from '@/data/mockAIResult';

// Initialize the Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ADK Backend URL (Python FastAPI server)
const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';

// Define the tools for Gemini to use
const queryErpInventoryDeclaration: FunctionDeclaration = {
  name: 'query_erp_inventory',
  description: 'Query the mock ERP system to find the current buffer stock (in days) for a given component and region.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      componentName: {
        type: Type.STRING,
        description: 'The name of the component, e.g., "Battery Management Controllers".',
      },
      region: {
        type: Type.STRING,
        description: 'The geographic region to query inventory for.',
      },
    },
    required: ['componentName', 'region'],
  },
};

const calculateFreightQuoteDeclaration: FunctionDeclaration = {
  name: 'calculate_freight_quote',
  description: 'Calculate the estimated cost and lead time for shipping a specific component.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      freightType: {
        type: Type.STRING,
        description: 'The type of freight (e.g., "Air", "Ocean", "Rail").',
      },
      origin: {
        type: Type.STRING,
        description: 'The origin port or region.',
      },
      destination: {
        type: Type.STRING,
        description: 'The destination port or region.',
      },
    },
    required: ['freightType', 'origin', 'destination'],
  },
};

// Mock functions to execute when Gemini calls the tools
function executeMockQueryErpInventory(args: any) {
  console.log(`[TOOL CALLED] query_erp_inventory: ${JSON.stringify(args)}`);
  // Hardcoded mock response for the demo
  return {
    buffer_days: 14,
    units_on_hand: 1250,
    cost_per_unit_holding: 2.50
  };
}

function executeMockCalculateFreightQuote(args: any) {
  console.log(`[TOOL CALLED] calculate_freight_quote: ${JSON.stringify(args)}`);
  if (args.freightType?.toLowerCase() === 'air') {
    return {
      estimated_cost_usd: 42000,
      lead_time_days: 3,
      confidence_score: 0.95
    };
  }
  return {
    estimated_cost_usd: 15000,
    lead_time_days: 21,
    confidence_score: 0.88
  };
}

// Map function names to their implementations
const toolExecutors: Record<string, (args: any) => any> = {
  query_erp_inventory: executeMockQueryErpInventory,
  calculate_freight_quote: executeMockCalculateFreightQuote,
};

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

    const initialPrompt = `
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
      If you need ERP buffer days or real freight quotes, use the provided tools to query real data before making your recommendation.
      
      Output your FINAL response ONLY as valid JSON matching this schema:
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

    // Fallback 1: Call Gemini 2.5 Flash for fast reasoning with Tool Calling Loop
    try {
      if (typeof ai !== 'undefined' && ai) {
        // We need a chat session to maintain history through tool calls
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            temperature: 0.2,
            tools: [{ functionDeclarations: [queryErpInventoryDeclaration, calculateFreightQuoteDeclaration] }],
          }
        });

        // 1. Send the initial prompt
        let response = await chat.sendMessage({ message: initialPrompt });

        // 2. Loop while Gemini requests function calls
        let maxLoops = 3;
        while (response.functionCalls && response.functionCalls.length > 0 && maxLoops > 0) {
          maxLoops--;
          const functionResponses = [];

          // Execute requested tools
          for (const call of response.functionCalls) {
            if (!call.name) continue;

            const executor = toolExecutors[call.name];
            if (executor) {
              try {
                const result = executor(call.args);
                functionResponses.push({
                  id: call.id,
                  name: call.name,
                  response: result
                });
              } catch (e: any) {
                functionResponses.push({
                  id: call.id,
                  name: call.name,
                  response: { error: e.message }
                });
              }
            }
          }
          // Send tool results back to Gemini to continue its reasoning
          const toolResponseParts = functionResponses.map(fr => ({ functionResponse: fr }));
          response = await chat.sendMessage({ message: toolResponseParts });
        }

        // 3. We should now have the final JSON text (strip markdown if it returned ```json ... ```)
        if (response.text) {
          let jsonText = response.text.trim();
          if (jsonText.startsWith('\`\`\`json')) {
            jsonText = jsonText.substring(7);
          } else if (jsonText.startsWith('\`\`\`')) {
            jsonText = jsonText.substring(3);
          }
          if (jsonText.endsWith('\`\`\`')) {
            jsonText = jsonText.substring(0, jsonText.length - 3);
          }

          const analysisResult = JSON.parse(jsonText.trim());
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
