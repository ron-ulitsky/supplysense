"""
FastAPI server that exposes the SupplySense ADK agent as a REST API.

The Next.js frontend sends disruption events to POST /analyze,
which runs the ADK agent pipeline and returns structured results.
"""

import os
import json
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from agent import root_agent


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class DisruptionRequest(BaseModel):
    """Incoming disruption event from the Next.js frontend."""
    title: str
    description: str
    severity: str
    region: str
    affected_components: list[str]
    estimated_delay_days: int
    supplier_details: Optional[dict] = None


class AnalysisResponse(BaseModel):
    """Response containing the agent's analysis and drafted actions."""
    agent_response: str
    tool_calls_made: list[str]


# ---------------------------------------------------------------------------
# Mock fallback data (for when GEMINI_API_KEY is not set)
# ---------------------------------------------------------------------------

MOCK_RESPONSE = {
    "agent_response": (
        "## Executive Risk Summary\n\n"
        "**Risk Level: HIGH** | Revenue at Risk: $6,000,000\n\n"
        "The Red Sea Port Congestion is causing severe delays to Asia-Europe "
        "shipping routes, directly impacting Battery Management Controllers and "
        "Thermal Sensors. Current inventory provides 14 days of coverage for "
        "controllers, which falls short of the estimated 14-day delay when "
        "accounting for safety stock consumption.\n\n"
        "### Mitigation Strategies Drafted for Approval:\n\n"
        "1. **Cost-Optimized: Partial Air Freight** -- Air-ship 30% of the order "
        "to maintain minimum production levels while waiting for sea freight. "
        "Est. cost: $85,000. (Confidence: 92%)\n\n"
        "2. **SLA-Optimized: Emergency Supplier Activation** -- Activate backup "
        "supplier Kyoto Micro Systems for a 2-week bridge order of Battery "
        "Management Controllers. Est. cost: $210,000. (Confidence: 88%)\n\n"
        "3. **Resilience-Optimized: Dual-Source Agreement** -- Negotiate a "
        "standing dual-source agreement with both Shenzhen Electronics and Kyoto "
        "Micro to prevent future single-point-of-failure exposure. "
        "Est. cost: $45,000/yr. (Confidence: 95%)\n\n"
        "**Top Recommendation:** Strategy 2 (Emergency Supplier Activation) to "
        "protect OEM SLA commitments. All 3 actions are queued in your Action Inbox "
        "for approval."
    ),
    "tool_calls_made": [
        "assess_disruption_impact",
        "check_inventory_and_buffers (Battery Management Controllers)",
        "check_inventory_and_buffers (Thermal Sensors)",
        "draft_mitigation_actions (Cost-Optimized)",
        "draft_mitigation_actions (SLA-Optimized)",
        "draft_mitigation_actions (Resilience-Optimized)",
    ],
}


# ---------------------------------------------------------------------------
# Application Setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SupplySense ADK Agent API",
    description="Google ADK-powered supply chain risk analysis agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Agent Runner Setup
# ---------------------------------------------------------------------------

APP_NAME = "supplysense"
USER_ID = "ops_lead"
SESSION_ID = "default_session"

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


async def run_agent(user_message: str) -> dict:
    """Runs the ADK agent with a user message and collects the response."""

    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
    )

    content = types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_message)],
    )

    final_response_parts = []
    tool_calls = []

    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=content,
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text and not part.function_call:
                    final_response_parts.append(part.text)
                if part.function_call:
                    tool_calls.append(part.function_call.name)

    return {
        "agent_response": "\n".join(final_response_parts) if final_response_parts else "Agent did not produce a text response.",
        "tool_calls_made": tool_calls,
    }


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    has_key = bool(os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "agent": "supplysense_coordinator",
        "model": "gemini-2.5-flash",
        "api_key_configured": has_key,
    }


@app.post("/analyze")
async def analyze_disruption(request: DisruptionRequest):
    """Receives a disruption event and runs the ADK agent pipeline."""

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

    if not api_key:
        # Return mock data for demo purposes
        return MOCK_RESPONSE

    # Build a structured prompt for the agent
    prompt = f"""A new supply chain disruption has been detected. Analyze it and generate mitigation strategies.

DISRUPTION EVENT:
- Title: {request.title}
- Description: {request.description}
- Severity: {request.severity}
- Region: {request.region}
- Affected Components: {', '.join(request.affected_components)}
- Estimated Delay: {request.estimated_delay_days} days

Please follow your standard workflow: assess impact, check inventory for each affected component, then draft 3 mitigation strategies with different trade-off profiles."""

    try:
        result = await run_agent(prompt)
        return result
    except Exception as e:
        # Graceful fallback to mock data on error
        print(f"Agent execution error: {e}. Falling back to mock response.")
        return MOCK_RESPONSE


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
