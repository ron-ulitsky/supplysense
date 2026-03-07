import { NextResponse } from 'next/server';

// ADK Backend URL (Python FastAPI server)
const ADK_BACKEND_URL = process.env.ADK_BACKEND_URL || 'http://localhost:8000';

export async function GET() {
    try {
        const adkResponse = await fetch(`${ADK_BACKEND_URL}/scan`, {
            method: 'GET',
        });

        if (adkResponse.ok) {
            const disruption = await adkResponse.json();
            return NextResponse.json(disruption);
        } else {
            console.error("ADK /scan error status:", adkResponse.status);
            const errorText = await adkResponse.text();
            console.error("ADK /scan error text:", errorText);
            return NextResponse.json(
                { error: 'Failed to generate disruption from ADK' },
                { status: adkResponse.status }
            );
        }
    } catch (error) {
        console.error('Error proxying to ADK /scan route:', error);
        return NextResponse.json(
            { error: 'ADK backend not reachable.' },
            { status: 500 }
        );
    }
}
