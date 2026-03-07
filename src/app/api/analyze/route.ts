import { NextResponse } from 'next/server';

import { mockAIAnalysis } from '@/data/mockAIResult';

// ADK Backend URL (Python FastAPI server)
const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { disruption, supplierDetails } = body;

    if (!disruption || !supplierDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: disruption or supplierDetails' },
        { status: 400 }
      );
    }

    // Try calling the ADK Python backend
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
      // ADK backend not available, fall through to mock
      console.warn('ADK backend not reachable. Falling back to mock data.');
    }

    // Fallback: return mock data for demo purposes
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
