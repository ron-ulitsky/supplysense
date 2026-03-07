import { NextResponse } from 'next/server';

// ADK Backend URL (Python FastAPI server)
const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { disruption, supplierDetails, companyProfile } = body;

    if (!disruption || !supplierDetails || !companyProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: disruption, supplierDetails, or companyProfile' },
        { status: 400 }
      );
    }

    // Call the newly implemented ADK Python backend
    try {
      const adkResponse = await fetch(`${ADK_BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disruption: {
            title: disruption.title,
            description: disruption.description,
            severity: disruption.severity,
            region: disruption.region,
            affected_components: disruption.affectedComponents,
            estimated_delay_days: disruption.estimatedDelayDays,
          },
          supplier_details: supplierDetails,
          company_profile: companyProfile
        }),
      });

      if (adkResponse.ok) {
        const adkResult = await adkResponse.json();
        // The ADK backend returns: { agent_response, tool_calls_made, strategies }
        return NextResponse.json({
          analysisSummary: adkResult.agent_response,
          toolCallsMade: adkResult.tool_calls_made,
          strategies: adkResult.strategies,
        });
      } else {
        console.error("ADK error status:", adkResponse.status);
        const errorText = await adkResponse.text();
        console.error("ADK error text:", errorText);
      }
    } catch (e) {
      console.warn('ADK backend not reachable. Ensure the Python FastAPI server is running.', e);
    }

    // Fallback: return mock data for demo purposes ONLY if the Python server is offline
    console.warn('Falling back to mock AI analysis data.');
    const { mockAIAnalysis } = await import('@/data/mockAIResult');
    return NextResponse.json(mockAIAnalysis);

  } catch (error) {
    console.error('Error in AI analysis route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze disruption' },
      { status: 500 }
    );
  }
}
